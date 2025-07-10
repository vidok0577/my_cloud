from django.db import migrations
from django.contrib.auth import get_user_model
import os


def create_superuser(apps, schema_editor):
    User = get_user_model()
    admin_password = os.getenv('ADMIN_PASSWORD')

    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password=admin_password,
            is_active=True,
            is_staff=True
        )
        print("Superuser 'admin' created successfully")
    else:
        print("Superuser 'admin' already exists")


class Migration(migrations.Migration):
    dependencies = [
        ('storage', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]