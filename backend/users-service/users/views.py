from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from django.contrib.auth import authenticate
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
        return [permissions.AllowAny()]

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

    @action(detail=False, methods=['post'], url_path='login', permission_classes=[permissions.AllowAny])
    def login(self, request):
        """Authentification par email et mot de passe."""
        from rest_framework import status as http_status
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        if not email or not password:
            return Response({'error': "Email et mot de passe requis."}, status=http_status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response({'error': "Email ou mot de passe incorrect."}, status=http_status.HTTP_401_UNAUTHORIZED)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='reset-password', permission_classes=[permissions.AllowAny])
    def reset_password(self, request):
        """Reinitialiser le mot de passe via l'email."""
        from rest_framework import status as http_status
        email = request.data.get('email', '').strip()
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not email:
            return Response({'error': "L'adresse email est requise."}, status=http_status.HTTP_400_BAD_REQUEST)
        if not new_password:
            return Response({'error': 'Le nouveau mot de passe est requis.'}, status=http_status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'error': 'Le mot de passe doit contenir au moins 8 caractères.'}, status=http_status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({'error': 'Les mots de passe ne correspondent pas.'}, status=http_status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Aucun compte trouvé avec cette adresse email.'}, status=http_status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Mot de passe modifié avec succès. Vous pouvez maintenant vous connecter.'})
