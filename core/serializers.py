from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class  Meta:
        model=User
        fields=[
            'id',
            'username',
            'email',
            'full_name',
            'address',
            'phone',
            'date_of_birth',
            'role'
        ]

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=[
            'username',
            'password',
            'email',
            'full_name'
        ]
        extra_kwargs={
            'password':{'write_only':True}
        }
    def create(self, validated_data):
        user=User.objects.create_user(**validated_data)
        return user