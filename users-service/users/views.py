from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, UserProfileSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API pour la gestion des utilisateurs.

    list: Lister tous les utilisateurs
    create: Creer un nouvel utilisateur
    retrieve: Consulter un utilisateur
    update: Modifier un utilisateur
    destroy: Supprimer un utilisateur
    """
    queryset = User.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user_type', 'is_active']
    search_fields = ['first_name', 'last_name', 'email', 'student_id']
    ordering_fields = ['last_name', 'date_joined']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @swagger_auto_schema(
        method='get',
        operation_description="Consulter le profil de l'utilisateur connecte",
        responses={200: UserProfileSerializer},
    )
    @swagger_auto_schema(
        method='patch',
        operation_description="Modifier le profil de l'utilisateur connecte",
        request_body=UserProfileSerializer,
        responses={200: UserProfileSerializer},
    )
    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        """Consulter ou modifier son propre profil."""
        if request.method == 'GET':
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data)
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
