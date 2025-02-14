from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class DemoPresentationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            client_ip = x_forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.META.get("REMOTE_ADDR")

        working_ips = getattr(settings, "WORKING_PCS_IP", [])

        request.is_demo_presentation = client_ip not in working_ips
