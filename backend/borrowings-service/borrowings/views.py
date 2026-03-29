from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Borrowing
from .serializers import BorrowingSerializer, BorrowBookSerializer, ReturnBookSerializer
from .services import BooksServiceClient

class BorrowingViewSet(viewsets.ModelViewSet): # Changé en ModelViewSet pour supporter le POST
    serializer_class = BorrowingSerializer
    # SOLUTION : Autoriser l'accès sans Token pour le développement
    permission_class_instance = permissions.AllowAny()
    permission_classes = [permissions.AllowAny] 
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'user_id', 'book_id']
    ordering_fields = ['borrowed_at', 'due_date']

    def get_queryset(self):
        return Borrowing.objects.all()

    def _get_token(self, request):
        auth = request.META.get('HTTP_AUTHORIZATION', '')
        if auth.startswith('Bearer '):
            return auth.split(' ')[1]
        return None

    @action(detail=False, methods=['post'], url_path='borrow')
    def borrow_book(self, request):
        serializer = BorrowBookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        book_id = serializer.validated_data['book_id']
        token = self._get_token(request)

        # Appel au service Livres
        books_client = BooksServiceClient(token=token)
        book_data = books_client.get_book(book_id)

        if not book_data:
            return Response({"error": "Livre introuvable."}, status=status.HTTP_400_BAD_REQUEST)

        if book_data.get('available_copies', 0) <= 0:
            return Response({"error": "Plus d'exemplaires."}, status=status.HTTP_400_BAD_REQUEST)

        u_id = serializer.validated_data['user_id']
        u_email = serializer.validated_data.get('user_email', '')

        # Création de l'emprunt
        borrowing = Borrowing.objects.create(
            user_id=u_id,
            user_email=u_email,
            book_id=book_id,
            book_title=book_data.get('title', 'Livre Inconnu'),
            due_date=serializer.validated_data.get('due_date'),
            notes=serializer.validated_data.get('notes', ''),
        )

        # Mise à jour du stock via microservice
        new_available = book_data['available_copies'] - 1
        books_client.update_book_copies(book_id, new_available)

        return Response(BorrowingSerializer(borrowing).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='return')
    def return_book(self, request, pk=None):
        try:
            borrowing = Borrowing.objects.get(pk=pk, status=Borrowing.Status.ACTIVE)
        except Borrowing.DoesNotExist:
            return Response({"error": "Emprunt introuvable."}, status=status.HTTP_404_NOT_FOUND)

        borrowing.returned_at = timezone.now()
        borrowing.status = Borrowing.Status.RETURNED
        borrowing.save()

        # Rendre le livre disponible
        token = self._get_token(request)
        books_client = BooksServiceClient(token=token)
        book_data = books_client.get_book(borrowing.book_id)
        if book_data:
            new_available = book_data['available_copies'] + 1
            books_client.update_book_copies(borrowing.book_id, new_available)

        return Response(BorrowingSerializer(borrowing).data)