from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'api'

# Main router
router = DefaultRouter()
router.register(r'database-servers', views.DatabaseServerViewSet)
router.register(r'clusters', views.ClusterViewSet)
router.register(r'load-balancers', views.LoadBalancerViewSet)
router.register(r'connections', views.ConnectionViewSet)
router.register(r'shard-keys', views.ShardKeyViewSet)

# Individual nested paths for clusters
cluster_servers = views.ClusterServerViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

cluster_server_detail = views.ClusterServerViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

cluster_load_balancers = views.ClusterLoadBalancerViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

cluster_load_balancer_detail = views.ClusterLoadBalancerViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

cluster_shards = views.ShardViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

cluster_shard_detail = views.ShardViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

# Individual nested paths for shards
shard_servers = views.ShardServerViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

shard_server_detail = views.ShardServerViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

shard_mappings = views.ShardMappingViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

shard_mapping_detail = views.ShardMappingViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('status/', views.status, name='status'),
    path('', include(router.urls)),
    
    # Cluster nested routes
    path('clusters/<int:cluster_pk>/servers/', cluster_servers, name='cluster-servers-list'),
    path('clusters/<int:cluster_pk>/servers/<int:pk>/', cluster_server_detail, name='cluster-servers-detail'),
    path('clusters/<int:cluster_pk>/load-balancers/', cluster_load_balancers, name='cluster-load-balancers-list'),
    path('clusters/<int:cluster_pk>/load-balancers/<int:pk>/', cluster_load_balancer_detail, name='cluster-load-balancers-detail'),
    path('clusters/<int:cluster_pk>/shards/', cluster_shards, name='cluster-shards-list'),
    path('clusters/<int:cluster_pk>/shards/<int:pk>/', cluster_shard_detail, name='cluster-shards-detail'),
    
    # Shard nested routes
    path('clusters/<int:cluster_pk>/shards/<int:shard_pk>/servers/', shard_servers, name='shard-servers-list'),
    path('clusters/<int:cluster_pk>/shards/<int:shard_pk>/servers/<int:pk>/', shard_server_detail, name='shard-servers-detail'),
    path('clusters/<int:cluster_pk>/shards/<int:shard_pk>/mappings/', shard_mappings, name='shard-mappings-list'),
    path('clusters/<int:cluster_pk>/shards/<int:shard_pk>/mappings/<int:pk>/', shard_mapping_detail, name='shard-mappings-detail'),
]
