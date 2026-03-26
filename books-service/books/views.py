from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Book
from .serializers import BookSerializer


class BookViewSet(viewsets.ModelViewSet):
    """
    API pour la gestion des livres de la bibliotheque.

    list: Lister tous les livres
    create: Ajouter un nouveau livre
    retrieve: Consulter un livre
    update: Modifier un livre
    partial_update: Modifier partiellement un livre
    destroy: Supprimer un livre
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['genre', 'publication_year']
    search_fields = ['title', 'author', 'isbn']
    ordering_fields = ['title', 'author', 'created_at', 'publication_year']

    @swagger_auto_schema(
        operation_description="Rechercher des livres par titre, auteur ou ISBN",
        manual_parameters=[
            openapi.Parameter(
                'search', openapi.IN_QUERY,
                description="Recherche par titre, auteur ou ISBN",
                type=openapi.TYPE_STRING,
            ),
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
