from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django import get_version
import sys
import platform
from .models import (
    DatabaseServer, Cluster, ClusterServer, LoadBalancer, 
    ClusterLoadBalancer, Connection, Shard, ShardServer, 
    ShardKey, ShardMapping
)
from .serializers import (
    DatabaseServerSerializer, ClusterSerializer, ClusterServerSerializer,
    LoadBalancerSerializer, ClusterLoadBalancerSerializer, ConnectionSerializer,
    ShardSerializer, ShardServerSerializer, ShardKeySerializer, ShardMappingSerializer
)

@api_view(['GET'])
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

class DatabaseServerViewSet(viewsets.ModelViewSet):
    queryset = DatabaseServer.objects.all()
    serializer_class = DatabaseServerSerializer

class ClusterViewSet(viewsets.ModelViewSet):
    queryset = Cluster.objects.all()
    serializer_class = ClusterSerializer

class ClusterServerViewSet(viewsets.ModelViewSet):
    queryset = ClusterServer.objects.all()
    serializer_class = ClusterServerSerializer

class LoadBalancerViewSet(viewsets.ModelViewSet):
    queryset = LoadBalancer.objects.all()
    serializer_class = LoadBalancerSerializer

class ClusterLoadBalancerViewSet(viewsets.ModelViewSet):
    queryset = ClusterLoadBalancer.objects.all()
    serializer_class = ClusterLoadBalancerSerializer

class ConnectionViewSet(viewsets.ModelViewSet):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer

class ShardViewSet(viewsets.ModelViewSet):
    queryset = Shard.objects.all()
    serializer_class = ShardSerializer

class ShardServerViewSet(viewsets.ModelViewSet):
    queryset = ShardServer.objects.all()
    serializer_class = ShardServerSerializer

class ShardKeyViewSet(viewsets.ModelViewSet):
    queryset = ShardKey.objects.all()
    serializer_class = ShardKeySerializer

class ShardMappingViewSet(viewsets.ModelViewSet):
    queryset = ShardMapping.objects.all()
    serializer_class = ShardMappingSerializer
