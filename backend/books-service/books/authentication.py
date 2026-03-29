import requests
from django.conf import settings
from rest_framework import authentication, exceptions


class ServiceUser:
    """Objet utilisateur leger retourné par le users-service."""

    def __init__(self, data):
        self.id = data.get('id')
        self.email = data.get('email', '')
        self.first_name = data.get('first_name', '')
        self.last_name = data.get('last_name', '')
        self.user_type = data.get('user_type', '')
        self.is_authenticated = True
        self.is_active = True

    def __str__(self):
        return self.email


class ServiceJWTAuthentication(authentication.BaseAuthentication):
    """
    Authentification inter-services.
    Valide le token JWT en appelant le endpoint /api/users/me/
    du users-service via HTTP.
    """

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        users_service_url = settings.USERS_SERVICE_URL

        try:
            response = requests.get(
                f'{users_service_url}/api/users/me/',
                headers={'Authorization': f'Bearer {token}'},
                timeout=5,
            )
        except requests.ConnectionError:
            raise exceptions.AuthenticationFailed(
                "Le service utilisateurs est indisponible."
            )
        except requests.Timeout:
            raise exceptions.AuthenticationFailed(
                "Le service utilisateurs ne repond pas."
            )

        if response.status_code != 200:
            raise exceptions.AuthenticationFailed("Token invalide ou expire.")

        user_data = response.json()
        user = ServiceUser(user_data)
        return (user, token)
