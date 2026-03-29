from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from .models import Borrowing
from .serializers import BorrowingSerializer, BorrowBookSerializer, ReturnBookSerializer
from .services import BooksServiceClient


class BorrowingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API pour la gestion des emprunts.

    list: Lister tous les emprunts
    retrieve: Consulter un emprunt
    """
    serializer_class = BorrowingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'user_id', 'book_id']
    ordering_fields = ['borrowed_at', 'due_date']

    def get_queryset(self):
        return Borrowing.objects.all()

    def _get_token(self, request):
        """Extraire le token de la requete pour le transmettre aux autres services."""
        auth = request.META.get('HTTP_AUTHORIZATION', '')
        if auth.startswith('Bearer '):
            return auth.split(' ')[1]
        return None

    @swagger_auto_schema(
        operation_description="Emprunter un livre (communique avec le books-service via HTTP)",
        request_body=BorrowBookSerializer,
        responses={201: BorrowingSerializer},
    )
    @action(detail=False, methods=['post'], url_path='borrow')
    def borrow_book(self, request):
        """Emprunter un livre."""
        serializer = BorrowBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        book_id = serializer.validated_data['book_id']
        token = self._get_token(request)

        # Appel HTTP vers le books-service pour verifier le livre
        books_client = BooksServiceClient(token=token)
        book_data = books_client.get_book(book_id)

        if not book_data:
            return Response(
                {"error": "Livre introuvable ou books-service indisponible."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if book_data.get('available_copies', 0) <= 0:
            return Response(
                {"error": "Ce livre n'est plus disponible."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verifier si l'utilisateur n'a pas déjà emprunte ce livre
        existing = Borrowing.objects.filter(
            user_id=request.user.id,
            book_id=book_id,
            status=Borrowing.Status.ACTIVE,
        ).exists()
        if existing:
            return Response(
                {"error": "Vous avez déjà emprunte ce livre."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Creer l'emprunt
        borrowing = Borrowing.objects.create(
            user_id=request.user.id,
            user_email=request.user.email,
            book_id=book_id,
            book_title=book_data.get('title', ''),
            due_date=serializer.validated_data.get('due_date'),
            notes=serializer.validated_data.get('notes', ''),
        )

        # Appel HTTP vers le books-service pour decrementer les exemplaires
        new_available = book_data['available_copies'] - 1
        books_client.update_book_copies(book_id, new_available)

        return Response(
            BorrowingSerializer(borrowing).data,
            status=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        operation_description="Retourner un livre emprunte (communique avec le books-service via HTTP)",
        request_body=ReturnBookSerializer,
        responses={200: BorrowingSerializer},
    )
    @action(detail=True, methods=['post'], url_path='return')
    def return_book(self, request, pk=None):
        """Retourner un livre."""
        try:
            borrowing = Borrowing.objects.get(pk=pk, status=Borrowing.Status.ACTIVE)
        except Borrowing.DoesNotExist:
            return Response(
                {"error": "Emprunt non trouve ou déjà retourné."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ReturnBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        borrowing.returned_at = timezone.now()
        borrowing.status = Borrowing.Status.RETURNED
        if serializer.validated_data.get('notes'):
            borrowing.notes = serializer.validated_data['notes']
        borrowing.save()

        # Appel HTTP vers le books-service pour incrementer les exemplaires
        token = self._get_token(request)
        books_client = BooksServiceClient(token=token)
        book_data = books_client.get_book(borrowing.book_id)
        if book_data:
            new_available = book_data['available_copies'] + 1
            books_client.update_book_copies(borrowing.book_id, new_available)

        return Response(BorrowingSerializer(borrowing).data)

    @swagger_auto_schema(
        operation_description="Historique des emprunts de l'utilisateur connecte",
        responses={200: BorrowingSerializer(many=True)},
    )
    @action(detail=False, methods=['get'], url_path='my-history')
    def my_history(self, request):
        """Historique des emprunts de l'utilisateur connecte."""
        borrowings = Borrowing.objects.filter(user_id=request.user.id)
        serializer = BorrowingSerializer(borrowings, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Lister les emprunts en retard",
        responses={200: BorrowingSerializer(many=True)},
    )
    @action(detail=False, methods=['get'], url_path='late')
    def late_borrowings(self, request):
        """Lister les emprunts en retard."""
        now = timezone.now()
        late = Borrowing.objects.filter(
            status=Borrowing.Status.ACTIVE,
            due_date__lt=now,
        )
        serializer = BorrowingSerializer(late, many=True)
        return Response(serializer.data)
