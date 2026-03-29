from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'user_type', 'is_active']
    list_filter = ['user_type', 'is_active', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Infos', {'fields': ('first_name', 'last_name', 'phone', 'student_id')}),
        ('Role', {'fields': ('user_type',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'first_name', 'last_name', 'user_type', 'password1', 'password2')}),
    )
