from typing import Optional, Tuple

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import AuthToken, Member


class TokenMemberAuthentication(BaseAuthentication):
    """Token-based authentication using the Authorization header.

    Expected header format: ``Authorization: Token <key>``.
    """

    keyword = "Token"

    def authenticate(self, request) -> Optional[Tuple[Member, AuthToken]]:  # type: ignore[override]
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return None

        parts = auth_header.split(" ", 1)
        if len(parts) != 2:
            raise AuthenticationFailed("Invalid Authorization header format.")

        keyword, key = parts[0], parts[1].strip()

        if keyword != self.keyword:
            return None

        if not key:
            raise AuthenticationFailed("Invalid token.")

        try:
            token = AuthToken.objects.select_related("member").get(key=key)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed("Invalid token.")

        member = token.member
        return member, token
