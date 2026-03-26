from django.db import models


class Book(models.Model):
    title = models.CharField('Titre', max_length=255)
    author = models.CharField('Auteur', max_length=255)
    isbn = models.CharField('ISBN', max_length=13, unique=True)
    publisher = models.CharField('Editeur', max_length=255, blank=True)
    publication_year = models.PositiveIntegerField('Annee de publication', null=True, blank=True)
    genre = models.CharField('Genre', max_length=100, blank=True)
    description = models.TextField('Description', blank=True)
    total_copies = models.PositiveIntegerField('Nombre total d\'exemplaires', default=1)
    available_copies = models.PositiveIntegerField('Exemplaires disponibles', default=1)
    created_at = models.DateTimeField('Date d\'ajout', auto_now_add=True)
    updated_at = models.DateTimeField('Derniere modification', auto_now=True)

    class Meta:
        verbose_name = 'Livre'
        verbose_name_plural = 'Livres'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.author}"

    @property
    def is_available(self):
        return self.available_copies > 0
