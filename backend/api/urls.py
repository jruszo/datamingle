from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'api'

router = DefaultRouter()
router.register(r'database-servers', views.DatabaseServerViewSet)
router.register(r'clusters', views.ClusterViewSet)
router.register(r'cluster-servers', views.ClusterServerViewSet)
router.register(r'load-balancers', views.LoadBalancerViewSet)
router.register(r'cluster-load-balancers', views.ClusterLoadBalancerViewSet)
router.register(r'connections', views.ConnectionViewSet)
router.register(r'shards', views.ShardViewSet)
router.register(r'shard-servers', views.ShardServerViewSet)
router.register(r'shard-keys', views.ShardKeyViewSet)
router.register(r'shard-mappings', views.ShardMappingViewSet)

urlpatterns = [
    path('status/', views.status, name='status'),
    path('', include(router.urls)),
]
