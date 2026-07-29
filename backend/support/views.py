from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Ticket, TicketReply
from .serializers import TicketSerializer, TicketReplySerializer

class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TicketDetailView(generics.RetrieveAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user)

class TicketReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(id=pk)
        except Ticket.DoesNotExist:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.is_staff and ticket.user != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        message = request.data.get("message")
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        reply = TicketReply.objects.create(
            ticket=ticket,
            user=request.user,
            message=message
        )

        # Update status if staff replies
        if request.user.is_staff:
            ticket.status = 'in_progress'
            ticket.save()

        serializer = TicketReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
