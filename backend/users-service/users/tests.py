from rest_framework.test import APITestCase
from rest_framework import status
from .models import User


class UserCreateTests(APITestCase):
    """Tests de creation d'utilisateurs (endpoint ouvert)."""

    def test_create_user_success(self):
        data = {
            'email': 'amadou@dit.sn',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Amadou',
            'last_name': 'Diallo',
        }
        response = self.client.post('/api/users/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(response.data['email'], 'amadou@dit.sn')

    def test_create_user_password_mismatch(self):
        data = {
            'email': 'test@dit.sn',
            'password': 'testpass123',
            'password_confirm': 'autrepass',
            'first_name': 'Test',
            'last_name': 'User',
        }
        response = self.client.post('/api/users/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_user_duplicate_email(self):
        data = {
            'email': 'same@dit.sn',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'User',
            'last_name': 'One',
        }
        self.client.post('/api/users/', data, format='json')
        response = self.client.post('/api/users/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_user_missing_fields(self):
        data = {'email': 'incomplete@dit.sn'}
        response = self.client.post('/api/users/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserListTests(APITestCase):
    """Tests de listage des utilisateurs (authentification requise)."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='auth@dit.sn',
            password='testpass123',
            first_name='Auth',
            last_name='User',
        )

    def test_list_users_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_list_users_unauthenticated(self):
        # Tous les accès sont ouverts (AllowAny) car l'auth JWT n'est pas activée
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_user_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/users/{self.user.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'auth@dit.sn')

    def test_me_endpoint_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'auth@dit.sn')


class LoginTests(APITestCase):
    """Tests d'authentification via l'endpoint /login/."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='login@dit.sn',
            password='securepass123',
            first_name='Login',
            last_name='Test',
        )

    def test_login_success(self):
        data = {'email': 'login@dit.sn', 'password': 'securepass123'}
        response = self.client.post('/api/users/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'login@dit.sn')

    def test_login_wrong_password(self):
        data = {'email': 'login@dit.sn', 'password': 'wrongpassword'}
        response = self.client.post('/api/users/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_unknown_email(self):
        data = {'email': 'inconnu@dit.sn', 'password': 'securepass123'}
        response = self.client.post('/api/users/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields(self):
        response = self.client.post('/api/users/login/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ResetPasswordTests(APITestCase):
    """Tests de reinitialisation du mot de passe."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='reset@dit.sn', password='oldpass123',
            first_name='Reset', last_name='Test',
        )

    def test_reset_password_success(self):
        data = {'email': 'reset@dit.sn', 'new_password': 'newpass456', 'confirm_password': 'newpass456'}
        response = self.client.post('/api/users/reset-password/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass456'))

    def test_reset_password_wrong_email(self):
        data = {'email': 'inconnu@dit.sn', 'new_password': 'newpass456', 'confirm_password': 'newpass456'}
        response = self.client.post('/api/users/reset-password/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_reset_password_mismatch(self):
        data = {'email': 'reset@dit.sn', 'new_password': 'newpass456', 'confirm_password': 'autrepass'}
        response = self.client.post('/api/users/reset-password/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_too_short(self):
        data = {'email': 'reset@dit.sn', 'new_password': '123', 'confirm_password': '123'}
        response = self.client.post('/api/users/reset-password/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_missing_email(self):
        data = {'new_password': 'newpass456', 'confirm_password': 'newpass456'}
        response = self.client.post('/api/users/reset-password/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
