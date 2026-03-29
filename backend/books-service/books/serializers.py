from rest_framework import serializers
from .models import Book


class BookSerializer(serializers.ModelSerializer):
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'isbn', 'publisher',
            'publication_year', 'genre', 'description',
            'total_copies', 'available_copies', 'is_available',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_isbn(self, value):
        value = value.replace('-', '').replace(' ', '')
        if len(value) not in (10, 13):
            raise serializers.ValidationError("L'ISBN doit contenir 10 ou 13 caracteres.")
        return value

    def validate(self, data):
        total = data.get('total_copies', getattr(self.instance, 'total_copies', 1))
        available = data.get('available_copies', getattr(self.instance, 'available_copies', 1))
        if available > total:
            raise serializers.ValidationError(
                "Le nombre d'exemplaires disponibles ne peut pas depasser le total."
            )
        return data
