from django.http import HttpResponse


def turbo_stream_response(fn):
    def new_fn(*args, **kwargs):
        resp = fn(*args, **kwargs)
        resp["Content-Type"] = "text/vnd.turbo-stream.html, charset=utf-8"
        return resp

    return new_fn


def add_turbo_stream_to_response(resp) -> HttpResponse:
    resp["Content-Type"] = "text/vnd.turbo-stream.html, charset=utf-8"
    return resp
