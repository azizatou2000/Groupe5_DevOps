from rest_framework.test import APITestCase
from rest_framework import status
from .models import Book


class BookCRUDTests(APITestCase):
    """Tests CRUD du catalogue de livres (AllowAny)."""

    def setUp(self):
        self.book_data = {
            'title': 'Python pour les Data Scientists',
            'author': 'Moussa Sow',
            'isbn': '9782100000001',
            'total_copies': 3,
            'available_copies': 3,
        }
        self.book = Book.objects.create(**self.book_data)

    def test_list_books(self):
        response = self.client.get('/api/books/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_book_success(self):
        data = {
            'title': 'DevOps en Pratique',
            'author': 'Fatou Ndiaye',
            'isbn': '9782100000002',
            'total_copies': 2,
            'available_copies': 2,
        }
        response = self.client.post('/api/books/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'DevOps en Pratique')

    def test_create_book_invalid_isbn(self):
        data = {
            'title': 'Mauvais ISBN',
            'author': 'Test',
            'isbn': '123',  # trop court
            'total_copies': 1,
            'available_copies': 1,
        }
        response = self.client.post('/api/books/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_book(self):
        response = self.client.get(f'/api/books/{self.book.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.book_data['title'])

    def test_update_book_partial(self):
        response = self.client.patch(
            f'/api/books/{self.book.id}/',
            {'available_copies': 1},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['available_copies'], 1)

    def test_delete_book(self):
        response = self.client.delete(f'/api/books/{self.book.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Book.objects.count(), 0)

    def test_book_search(self):
        response = self.client.get('/api/books/?search=Python')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_book_is_available_property(self):
        self.assertTrue(self.book.is_available)
        self.book.available_copies = 0
        self.book.save()
        self.assertFalse(self.book.is_available)

    def test_available_copies_cannot_exceed_total(self):
        data = {
            'title': 'Test Validation',
            'author': 'Test',
            'isbn': '9782100000099',
            'total_copies': 2,
            'available_copies': 5,  # depasse total
        }
        response = self.client.post('/api/books/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
