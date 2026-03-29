from rest_framework import serializers
from django.utils import timezone
from .models import Borrowing


class BorrowingSerializer(serializers.ModelSerializer):
    is_late = serializers.BooleanField(read_only=True)
    days_late = serializers.IntegerField(read_only=True)

    class Meta:
        model = Borrowing
        fields = [
            'id', 'user_id', 'user_email', 'book_id', 'book_title',
            'borrowed_at', 'due_date', 'returned_at', 'status',
            'is_late', 'days_late', 'notes',
        ]
        read_only_fields = ['id', 'borrowed_at', 'returned_at', 'status',
                            'user_id', 'user_email', 'book_title']


class BorrowBookSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
    user_id = serializers.IntegerField(required=True)
    user_email = serializers.EmailField(required=False, allow_blank=True, default='')
    due_date = serializers.DateTimeField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_due_date(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError(
                "La date de retour prevue doit etre dans le futur."
            )
        return value


class ReturnBookSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, default='')
