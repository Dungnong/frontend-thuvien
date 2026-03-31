from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Zone, Seat, SeatReservation 
from .serializers import ZoneSerializer, SeatSerializer, SeatReservationSerializer

class ZoneView(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer

class SeatView(viewsets.ModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer

class SeatReservationView(viewsets.ModelViewSet):
    queryset = SeatReservation.objects.all()
    serializer_class = SeatReservationSerializer

    # API Custom: Check-in (PATCH /api/reservations/{id}/check_in/)
    @action(detail=True, methods=['patch'])
    def check_in(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status != 'booked':
            return Response({"error": "Chỉ có thể check-in các ghế đã đặt."}, status=status.HTTP_400_BAD_REQUEST)
        
        reservation.status = 'checked_in' 
        reservation.save()
        return Response({"status": "Check-in thành công"})

    # API Custom: Check-out (PATCH /api/reservations/{id}/check_out/)
    @action(detail=True, methods=['patch'])
    def check_out(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status != 'checked_in':
            return Response({"error": "Chưa check-in nên không thể check-out."}, status=status.HTTP_400_BAD_REQUEST)
        
        reservation.status = 'completed' 
        reservation.save()
        return Response({"status": "Check-out thành công"})