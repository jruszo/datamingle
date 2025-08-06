from rest_framework import serializers
from .models import (
    DatabaseServer, Cluster, ClusterServer, LoadBalancer, 
    ClusterLoadBalancer, Connection, Shard, ShardServer, 
    ShardKey, ShardMapping
)

class DatabaseServerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseServer
        fields = '__all__'

class ClusterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cluster
        fields = '__all__'

class ClusterServerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClusterServer
        fields = '__all__'

class LoadBalancerSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoadBalancer
        fields = '__all__'

class ClusterLoadBalancerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClusterLoadBalancer
        fields = '__all__'

class ConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Connection
        fields = '__all__'

class ShardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shard
        fields = '__all__'

class ShardServerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShardServer
        fields = '__all__'

class ShardKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = ShardKey
        fields = '__all__'

class ShardMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShardMapping
        fields = '__all__'
