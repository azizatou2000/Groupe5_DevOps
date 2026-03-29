from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True) # Assurer que le superuser est actif
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    class UserType(models.TextChoices):
        STUDENT = 'STUDENT', 'Etudiant'
        PROFESSOR = 'PROFESSOR', 'Professeur'
        ADMIN = 'ADMIN', 'Personnel administratif'

    email = models.EmailField('Adresse email', unique=True)
    first_name = models.CharField('Prenom', max_length=150)
    last_name = models.CharField('Nom', max_length=150)
    user_type = models.CharField(
        'Type d\'utilisateur',
        max_length=10,
        choices=UserType.choices,
        default=UserType.STUDENT,
    )
    student_id = models.CharField('Numero etudiant', max_length=50, blank=True)
    phone = models.CharField('Telephone', max_length=20, blank=True)
    is_active = models.BooleanField('Actif', default=True)
    is_staff = models.BooleanField('Staff', default=False)
    date_joined = models.DateTimeField('Date d\'inscription', auto_now_add=True)

    # CORRECTION DES CONFLITS (related_name uniques)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_user_type_display()})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"