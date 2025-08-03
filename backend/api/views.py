from django.shortcuts import render
from django.http import JsonResponse
from django import get_version
import sys
import platform

# Create your views here.

def status(request):
    """
    Status endpoint that returns Django version and system information
    """
    status_data = {
        'status': 'ok',
        'django_version': get_version(),
        'python_version': sys.version,
        'platform': platform.platform(),
        'python_implementation': platform.python_implementation(),
    }
    
    return JsonResponse(status_data)
