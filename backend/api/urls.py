from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from . import views

app_name = 'api'

# Main router
router = routers.DefaultRouter()
router.register(r'database-servers', views.DatabaseServerViewSet)
router.register(r'clusters', views.ClusterViewSet)
router.register(r'load-balancers', views.LoadBalancerViewSet)
router.register(r'connections', views.ConnectionViewSet)
router.register(r'shard-keys', views.ShardKeyViewSet)

# Nested routers for clusters
cluster_router = routers.NestedDefaultRouter(router, r'clusters', lookup='cluster')
cluster_router.register(r'servers', views.ClusterServerViewSet, basename='cluster-servers')
cluster_router.register(r'load-balancers', views.ClusterLoadBalancerViewSet, basename='cluster-load-balancers')
cluster_router.register(r'shards', views.ShardViewSet, basename='cluster-shards')

# Nested routers for shards
shard_router = routers.NestedDefaultRouter(cluster_router, r'shards', lookup='shard')
shard_router.register(r'servers', views.ShardServerViewSet, basename='shard-servers')
shard_router.register(r'mappings', views.ShardMappingViewSet, basename='shard-mappings')

urlpatterns = [
    path('status/', views.status, name='status'),
    path('', include(router.urls)),
    path('', include(cluster_router.urls)),
    path('', include(shard_router.urls)),
]
