import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_delete
from django.dispatch import receiver


def user_directory_path(instance, filename):
    return instance.storage_path

class File(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    original_name = models.CharField(max_length=255)
    storage_path = models.CharField(max_length=255, unique=True)
    size = models.BigIntegerField()
    upload_date = models.DateTimeField(auto_now_add=True)
    last_download = models.DateTimeField(null=True, blank=True)
    comment = models.TextField(blank=True)
    share_link = models.UUIDField(default=uuid.uuid4, unique=True)
    file = models.FileField(upload_to=user_directory_path)

    class Meta:
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        ordering = ['-upload_date']
        constraints = [
            models.UniqueConstraint(
                fields=['owner', 'storage_path'],
                name='unique_original_name_per_user'
            )
        ]

    def save(self, *args, **kwargs):
        if not self.storage_path:
            self.storage_path = self.file.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.original_name} ({self.owner.username})"

@receiver(post_delete, sender=File)
def delete_file(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)
