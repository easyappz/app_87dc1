from django.contrib import admin

from .models import AuthToken, Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "created_at", "updated_at")
    search_fields = ("username",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(AuthToken)
class AuthTokenAdmin(admin.ModelAdmin):
    list_display = ("key", "member", "created_at")
    search_fields = ("key", "member__username")
    readonly_fields = ("created_at",)
    raw_id_fields = ("member",)
