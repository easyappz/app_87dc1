from django.contrib.auth.hashers import check_password, make_password
from rest_framework import serializers

from .models import Member, Message


class HelloMessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class MemberRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Member
        fields = ["id", "username", "password", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_username(self, value: str) -> str:
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        member = Member(**validated_data)
        member.password = make_password(password)
        member.save()
        return member


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ["id", "username", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if not username or not password:
            raise serializers.ValidationError("Username and password are required.")

        try:
            member = Member.objects.get(username=username)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Invalid username or password.")

        if not check_password(password, member.password):
            raise serializers.ValidationError("Invalid username or password.")

        attrs["member"] = member
        return attrs


class MessageSerializer(serializers.ModelSerializer):
    member_username = serializers.CharField(source="member.username", read_only=True)
    text = serializers.CharField(allow_blank=False)

    class Meta:
        model = Message
        fields = ["id", "member_username", "text", "created_at"]
        read_only_fields = ["id", "member_username", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        member = getattr(request, "user", None)

        if member is None or not isinstance(member, Member):
            raise serializers.ValidationError("Authenticated member is required.")

        return Message.objects.create(member=member, **validated_data)
