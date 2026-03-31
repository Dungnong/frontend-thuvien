from rest_framework import serializers
from .models import Category,Book


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields='__all__'

class BookSerializer(serializers.ModelSerializer):
    is_available = serializers.SerializerMethodField()
    
    class Meta:
        model=Book
        fields='__all__'
    
    def get_is_available(self, obj):
        return obj.is_available