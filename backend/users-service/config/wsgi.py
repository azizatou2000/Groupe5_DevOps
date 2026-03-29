import os
from django.core.wsgi import get_wsgi_application

# Remplacez 'users_service.settings' par 'settings' si nécessaire
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

application = get_wsgi_application()