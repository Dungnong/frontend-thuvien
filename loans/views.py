from django.shortcuts import render
from datetime import date, timedelta
from rest_framework import status,viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Loan,LoanDetail
from .serializers import LoanDetailSerializer,LoanSerializer
from books.models import Book
# Create your views here.
class LoanView(viewsets.ModelViewSet):
    queryset=Loan.objects.all()
    serializer_class=LoanSerializer
    permission_classes = [IsAuthenticated]  # Chỉ cho phép user đã đăng nhập
    
    def get_queryset(self):
        """✓ FIX: Chỉ lấy loans của user hiện tại, tránh thấy loans của người khác"""
        return Loan.objects.filter(user=self.request.user)
    def create(self, request, *args, **kwargs):
        """Override create để xử lý POST request từ frontend"""
        try:
            book_id = request.data.get('book')
            quantity = request.data.get('quantity', 1)
            borrow_duration = request.data.get('borrow_duration', 14)
            
            # Kiểm tra user đã đăng nhập
            if not request.user.is_authenticated:
                return Response(
                    {"error": "Vui lòng đăng nhập trước!"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Lấy sách từ DB
            try:
                book = Book.objects.get(id=book_id)
            except Book.DoesNotExist:
                return Response(
                    {"error": "Sách không tồn tại!"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Kiểm tra số lượng sẵn có
            if book.available_quantity < quantity:
                return Response(
                    {"error": f"Chỉ còn {book.available_quantity} cuốn sách!"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Tạo Loan mới
            due_date = date.today() + timedelta(days=borrow_duration)
            loan = Loan.objects.create(
                user=request.user,
                due_date=due_date,
                status='borrowed'
            )
            
            # Tạo LoanDetail
            LoanDetail.objects.create(
                loan=loan,
                book=book,
                fine_amounts=0
            )
            
            # Cập nhật số lượng sách
            book.available_quantity -= quantity
            book.save()
            
            return Response(
                {
                    "message": f"Mượn sách '{book.title}' thành công!",
                    "loan_id": loan.id,
                    "due_date": due_date
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True,methods=['patch'])
    def approve(self,request,pk=None):
        loan=self.get_object()
        
        for detail in loan.loan_details.all():
            book=detail.book
            if book.available_quantity<=0:
                return Response({
                    "error":f"{book.title} is not available"
                })
            book.available_quantity-=1
            book.save()
        loan.status="borrowed"
        loan.save()
        return Response({"message":"Loan Approved"})
    @action(detail=True,methods=['patch'])
    def return_book(self,request,pk=None):
        loan=self.get_object()
        
        for detail in loan.loan_details.all():
            book=detail.book
            book.available_quantity+=1
            book.save()

        loan.status="returned"
        loan.return_date=date.today()
        loan.save()

        return Response({"message":"Book Returned"})

    @action(detail=False,methods=['get'])
    def my_loans(self,request):
        loans=Loan.objects.filter(user=request.user)
        serializer=self.get_serializer(loans,many=True)
        return Response(serializer.data)

class LoanDetailView(viewsets.ModelViewSet):
    queryset=LoanDetail.objects.all()
    serializer_class=LoanDetailSerializer
