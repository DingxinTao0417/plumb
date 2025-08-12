import json
from django.http import JsonResponse, HttpResponseBadRequest, FileResponse, HttpResponseNotFound
from django.views.decorators.csrf import csrf_exempt
from .models import Booking
from django.core.mail import send_mail, EmailMessage
from pathlib import Path
from django.conf import settings

def index_static(request):
    index_path = Path(settings.BASE_DIR).parent / 'index.html'
    try:
        return FileResponse(open(index_path, 'rb'))
    except FileNotFoundError:
        return HttpResponseNotFound('index.html not found')

@csrf_exempt
def create_booking(request):
    if request.method != 'POST':
        return HttpResponseBadRequest('POST only')

    try:
        data = json.loads(request.body.decode('utf-8'))
    except Exception:
        return HttpResponseBadRequest('Invalid JSON')

    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    email = (data.get('email') or '').strip()
    service = (data.get('service') or '').strip()
    message = (data.get('message') or '').strip()

    if not name or not phone:
        return HttpResponseBadRequest('Name and phone are required')

    booking = Booking.objects.create(
        name=name, phone=phone, email=email, service=service, message=message
    )

    # send emails
    admin_to = getattr(settings, 'ADMIN_NOTIFICATION_EMAIL', None)
    subject = f"[EliteFlow] New booking #{booking.id}"
    body = (
        f"Name: {name}\nPhone: {phone}\nEmail: {email}\n"
        f"Service: {service}\nMessage:\n{message}\n"
    )

    # ADMIN_NOTIFICATION_EMAIL
    if admin_to:
        send_mail(
            subject, body,
            getattr(settings, 'DEFAULT_FROM_EMAIL', settings.EMAIL_HOST_USER),
            [admin_to], fail_silently=False
        )

    # email reply
    if email:
        try:
            reply = EmailMessage(
                subject="We received your request",
                body=("Thanks for contacting EliteFlow Plumbing!\n"
                      "We will call you shortly to confirm your appointment.\n\n"
                      f"Ref #{booking.id}"),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', settings.EMAIL_HOST_USER),
                to=[email],
            )
            reply.send(fail_silently=True)
        except Exception:
            pass

    return JsonResponse({'id': booking.id, 'ok': True})