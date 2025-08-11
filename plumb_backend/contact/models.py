from django.db import models

class Booking(models.Model):
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=40)
    email = models.EmailField(blank=True)
    service = models.CharField(max_length=120, blank=True)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"#{self.id} {self.name} ({self.phone})"