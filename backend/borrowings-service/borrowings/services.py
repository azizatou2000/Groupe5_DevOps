import requests
from django.conf import settings


class BooksServiceClient:
    """Client HTTP pour communiquer avec le books-service."""

    def __init__(self, token=None):
        self.base_url = settings.BOOKS_SERVICE_URL
        self.headers = {}
        if token:
            self.headers['Authorization'] = f'Bearer {token}'

    def get_book(self, book_id):
        """Recuperer les details d'un livre via le books-service."""
        try:
            response = requests.get(
                f'{self.base_url}/api/books/{book_id}/',
                headers=self.headers,
                timeout=5,
            )
            if response.status_code == 200:
                return response.json()
            return None
        except (requests.ConnectionError, requests.Timeout):
            return None

    def update_book_copies(self, book_id, available_copies):
        """Mettre a jour le nombre d'exemplaires disponibles."""
        try:
            response = requests.patch(
                f'{self.base_url}/api/books/{book_id}/',
                json={'available_copies': available_copies},
                headers=self.headers,
                timeout=5,
            )
            return response.status_code == 200
        except (requests.ConnectionError, requests.Timeout):
            return False
