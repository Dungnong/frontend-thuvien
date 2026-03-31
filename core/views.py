from django.shortcuts import render
from rest_framework import viewsets,status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .models import User
from  .serializers import RegisterSerializer,UserSerializer
# Create your views here.
#Dung viewset voi crud con api voi logic dac biet
class UserView(viewsets.ModelViewSet):
    queryset=User.objects.all()
    serializer_class=UserSerializer
#tao token de register + login luon
class RegisterView(APIView):
    def post(self,request):
        serializer=RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user=serializer.save()
            return Response({
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self,request):
        username=request.data.get("username")
        password=request.data.get("password")
        user=authenticate(username=username,password=password)

        if user:
            return Response({
                "message":"Login successful"
            })
        return Response({"error":"Invalid"},status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        allowed_fields = ['full_name', 'email', 'phone', 'address', 'date_of_birth']
        partial_data = {k: v for k, v in request.data.items() if k in allowed_fields}

        serializer = UserSerializer(request.user, data=partial_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response({"detail": "Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới."}, status=status.HTTP_400_BAD_REQUEST)

        if not request.user.check_password(current_password):
            return Response({"detail": "Mật khẩu hiện tại không đúng."}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({"detail": "Mật khẩu mới phải có ít nhất 6 ký tự."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()

        return Response({"detail": "Đổi mật khẩu thành công."}, status=status.HTTP_200_OK)




