from django.contrib import admin
from .models import Borrowing


@admin.register(Borrowing)
class BorrowingAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'book_title', 'borrowed_at', 'due_date', 'status']
    list_filter = ['status', 'borrowed_at']
    search_fields = ['user_email', 'book_title']
