from unittest.mock import patch, MagicMock
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Borrowing


MOCK_BOOK = {
    'id': 1,
    'title': 'Python pour les Data Scientists',
    'author': 'Moussa Sow',
    'available_copies': 3,
    'total_copies': 3,
}


class BorrowingListTests(APITestCase):
    """Tests de listage des emprunts."""

    def setUp(self):
        Borrowing.objects.create(
            user_id=1,
            user_email='etudiant@dit.sn',
            book_id=1,
            book_title='Python pour les Data Scientists',
            due_date=timezone.now() + timedelta(days=14),
        )

    def test_list_borrowings(self):
        response = self.client.get('/api/borrowings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_filter_by_status(self):
        response = self.client.get('/api/borrowings/?status=ACTIVE')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class BorrowBookTests(APITestCase):
    """Tests de creation d'emprunts via /borrow/."""

    @patch('borrowings.views.BooksServiceClient')
    def test_borrow_book_success(self, MockClient):
        mock_instance = MagicMock()
        mock_instance.get_book.return_value = MOCK_BOOK
        mock_instance.update_book_copies.return_value = True
        MockClient.return_value = mock_instance

        data = {
            'book_id': 1,
            'user_id': 42,
            'user_email': 'etudiant@dit.sn',
            'due_date': (timezone.now() + timedelta(days=14)).isoformat(),
        }
        response = self.client.post('/api/borrowings/borrow/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['book_id'], 1)
        self.assertEqual(response.data['user_id'], 42)
        self.assertEqual(response.data['user_email'], 'etudiant@dit.sn')
        self.assertEqual(response.data['status'], 'ACTIVE')
        self.assertEqual(Borrowing.objects.count(), 1)

    @patch('borrowings.views.BooksServiceClient')
    def test_borrow_book_not_found(self, MockClient):
        mock_instance = MagicMock()
        mock_instance.get_book.return_value = None
        MockClient.return_value = mock_instance

        data = {'book_id': 999, 'user_id': 1, 'user_email': 'test@dit.sn'}
        response = self.client.post('/api/borrowings/borrow/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('borrowings.views.BooksServiceClient')
    def test_borrow_book_no_copies_available(self, MockClient):
        mock_instance = MagicMock()
        mock_instance.get_book.return_value = {**MOCK_BOOK, 'available_copies': 0}
        MockClient.return_value = mock_instance

        data = {'book_id': 1, 'user_id': 1, 'user_email': 'test@dit.sn'}
        response = self.client.post('/api/borrowings/borrow/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_borrow_missing_fields(self):
        # Sans user_id ni book_id
        response = self.client.post('/api/borrowings/borrow/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_borrow_missing_user_id(self):
        # book_id présent mais pas user_id
        response = self.client.post('/api/borrowings/borrow/', {'book_id': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ReturnBookTests(APITestCase):
    """Tests de retour de livres."""

    def setUp(self):
        self.borrowing = Borrowing.objects.create(
            user_id=1,
            user_email='etudiant@dit.sn',
            book_id=1,
            book_title='Python pour les Data Scientists',
            due_date=timezone.now() + timedelta(days=14),
            status=Borrowing.Status.ACTIVE,
        )

    @patch('borrowings.views.BooksServiceClient')
    def test_return_book_success(self, MockClient):
        mock_instance = MagicMock()
        mock_instance.get_book.return_value = MOCK_BOOK
        mock_instance.update_book_copies.return_value = True
        MockClient.return_value = mock_instance

        response = self.client.post(f'/api/borrowings/{self.borrowing.id}/return/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.borrowing.refresh_from_db()
        self.assertEqual(self.borrowing.status, Borrowing.Status.RETURNED)
        self.assertIsNotNone(self.borrowing.returned_at)

    def test_return_nonexistent_borrowing(self):
        response = self.client.post('/api/borrowings/9999/return/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class BorrowingModelTests(APITestCase):
    """Tests du modele Borrowing."""

    def test_is_late_active_overdue(self):
        borrowing = Borrowing.objects.create(
            user_id=1,
            user_email='test@dit.sn',
            book_id=1,
            book_title='Test Book',
            due_date=timezone.now() - timedelta(days=3),
        )
        self.assertTrue(borrowing.is_late)
        self.assertGreater(borrowing.days_late, 0)

    def test_is_not_late_future_due_date(self):
        borrowing = Borrowing.objects.create(
            user_id=1,
            user_email='test@dit.sn',
            book_id=1,
            book_title='Test Book',
            due_date=timezone.now() + timedelta(days=7),
        )
        self.assertFalse(borrowing.is_late)
        self.assertEqual(borrowing.days_late, 0)
