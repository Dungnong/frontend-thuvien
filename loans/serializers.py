from rest_framework import serializers
from .models import Loan, LoanDetail
from books.models import Book

class BookDetailSerializer(serializers.ModelSerializer):
    """✓ Để include book info trong loan details"""
    class Meta:
        model = Book
        fields = ['id', 'title', 'cover_image']

class LoanDetailSerializer(serializers.ModelSerializer):
    book = BookDetailSerializer(read_only=True)  # ✓ FIX: Nested serializer để lấy book info
    
    class Meta:
        model = LoanDetail
        fields = ['id', 'book', 'fine_amounts']

class LoanSerializer(serializers.ModelSerializer):
    loan_details = LoanDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Loan
        fields = ['id', 'user', 'borrow_date', 'due_date', 'return_date', 'status', 'loan_details']