from django.db import models
from django.utils import timezone
from datetime import timedelta


class Borrowing(models.Model):

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'En cours'
        RETURNED = 'RETURNED', 'Retourne'
        LATE = 'LATE', 'En retard'

    # Pas de ForeignKey : on stocke les IDs des autres microservices
    user_id = models.IntegerField('ID Utilisateur')
    user_email = models.EmailField('Email Utilisateur', blank=True)
    book_id = models.IntegerField('ID Livre')
    book_title = models.CharField('Titre du livre', max_length=255, blank=True)

    borrowed_at = models.DateTimeField('Date d\'emprunt', auto_now_add=True)
    due_date = models.DateTimeField('Date de retour prevue')
    returned_at = models.DateTimeField('Date de retour effectif', null=True, blank=True)
    status = models.CharField(
        'Statut',
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    notes = models.TextField('Remarques', blank=True)

    class Meta:
        verbose_name = 'Emprunt'
        verbose_name_plural = 'Emprunts'
        ordering = ['-borrowed_at']

    def __str__(self):
        return f"User {self.user_id} - {self.book_title}"

    def save(self, *args, **kwargs):
        if not self.due_date:
            self.due_date = timezone.now() + timedelta(days=14)
        super().save(*args, **kwargs)

    @property
    def is_late(self):
        if self.status == self.Status.RETURNED:
            return self.returned_at and self.returned_at > self.due_date
        return timezone.now() > self.due_date

    @property
    def days_late(self):
        if not self.is_late:
            return 0
        end = self.returned_at if self.returned_at else timezone.now()
        return (end - self.due_date).days
