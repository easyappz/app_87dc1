import secrets

from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuthToken, Member, Message
from .serializers import (
    HelloMessageSerializer,
    LoginSerializer,
    MemberRegisterSerializer,
    MemberSerializer,
    MessageSerializer,
)


class HelloView(APIView):
    """A simple API endpoint that returns a greeting message."""

    @extend_schema(
        responses={200: HelloMessageSerializer},
        description="Get a hello world message",
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = HelloMessageSerializer(data)
        return Response(serializer.data)


class RegistrationView(APIView):
    """Register a new Member."""

    def post(self, request):
        serializer = MemberRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Authenticate a Member and return an auth token."""

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        member: Member = serializer.validated_data["member"]

        # Invalidate existing tokens for this member
        AuthToken.objects.filter(member=member).delete()

        key = secrets.token_hex(20)
        token = AuthToken.objects.create(key=key, member=member)

        member_data = MemberSerializer(member).data
        return Response(
            {"token": token.key, "member": member_data},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """Logout the current Member by deleting their token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        auth = request.auth

        if auth is None:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        if isinstance(auth, AuthToken):
            auth.delete()
        else:
            AuthToken.objects.filter(key=str(auth)).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileView(APIView):
    """Retrieve or update the authenticated Member profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = MemberSerializer(request.user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupMessageListCreateView(generics.ListCreateAPIView):
    """List and create group chat messages."""

    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.select_related("member").order_by("created_at")
