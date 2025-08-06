from django.db import models
from django.core.exceptions import ValidationError

class DatabaseType(models.TextChoices):
    POSTGRESQL = 'postgresql', 'PostgreSQL'
    MYSQL = 'mysql', 'MySQL'
    MONGODB = 'mongodb', 'MongoDB'
    TIDB = 'tidb', 'TiDB'
    CLICKHOUSE = 'clickhouse', 'ClickHouse'

class ReplicationType(models.TextChoices):
    NONE = 'none', 'None'
    ASYNC = 'async', 'Asynchronous Replication'
    GALERA = 'galera', 'Galera Cluster'
    POSTGRES_REPLICATION = 'postgres_replication', 'PostgreSQL Replication'
    MONGO_REPLICATION = 'mongo_replication', 'MongoDB Replication'

class LoadBalancerType(models.TextChoices):
    PGBOUNCER = 'pgbouncer', 'PgBouncer'
    PROXYSQL = 'proxysql', 'ProxySQL'
    HAPROXY = 'haproxy', 'HAProxy'
    MONGOS = 'mongos', 'Mongos'

class DatabaseServer(models.Model):
    name = models.CharField(max_length=100, unique=True)
    hostname = models.CharField(max_length=255)
    port = models.IntegerField()
    database_type = models.CharField(max_length=20, choices=DatabaseType.choices)
    version = models.CharField(max_length=50, blank=True)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)  # In production, use encryption
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.hostname}:{self.port})"

class Cluster(models.Model):
    name = models.CharField(max_length=100, unique=True)
    database_type = models.CharField(max_length=20, choices=DatabaseType.choices)
    replication_type = models.CharField(max_length=30, choices=ReplicationType.choices)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class ClusterServer(models.Model):
    cluster = models.ForeignKey(Cluster, on_delete=models.CASCADE, related_name='servers')
    server = models.ForeignKey(DatabaseServer, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, help_text="e.g. primary, secondary, arbiter")
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('cluster', 'server')
    
    def __str__(self):
        return f"{self.cluster.name} - {self.server.name}"

class LoadBalancer(models.Model):
    name = models.CharField(max_length=100, unique=True)
    hostname = models.CharField(max_length=255)
    port = models.IntegerField()
    load_balancer_type = models.CharField(max_length=20, choices=LoadBalancerType.choices)
    username = models.CharField(max_length=100, blank=True)
    password = models.CharField(max_length=100, blank=True)  # In production, use encryption
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class ClusterLoadBalancer(models.Model):
    cluster = models.ForeignKey(Cluster, on_delete=models.CASCADE, related_name='load_balancers')
    load_balancer = models.ForeignKey(LoadBalancer, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('cluster', 'load_balancer')
    
    def __str__(self):
        return f"{self.cluster.name} - {self.load_balancer.name}"

class Connection(models.Model):
    name = models.CharField(max_length=100, unique=True)
    cluster = models.ForeignKey(Cluster, on_delete=models.CASCADE, null=True, blank=True)
    server = models.ForeignKey(DatabaseServer, on_delete=models.CASCADE, null=True, blank=True)
    load_balancer = models.ForeignKey(LoadBalancer, on_delete=models.CASCADE, null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    def clean(self):
        # Ensure exactly one of cluster, server, or load_balancer is set
        sources = [self.cluster, self.server, self.load_balancer]
        if sum(1 for source in sources if source) != 1:
            raise ValidationError("Connection must reference exactly one of: cluster, server, or load balancer")

# Sharding models
class Shard(models.Model):
    name = models.CharField(max_length=100)
    cluster = models.ForeignKey(Cluster, on_delete=models.CASCADE, related_name='shards')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('name', 'cluster')
    
    def __str__(self):
        return f"{self.cluster.name} - {self.name}"

class ShardServer(models.Model):
    shard = models.ForeignKey(Shard, on_delete=models.CASCADE, related_name='servers')
    server = models.ForeignKey(DatabaseServer, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, help_text="e.g. primary, secondary")
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('shard', 'server')
    
    def __str__(self):
        return f"{self.shard.name} - {self.server.name}"

class ShardKey(models.Model):
    name = models.CharField(max_length=100)
    cluster = models.ForeignKey(Cluster, on_delete=models.CASCADE, related_name='shard_keys')
    key_fields = models.JSONField(help_text="List of fields used for sharding")
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('name', 'cluster')
    
    def __str__(self):
        return f"{self.cluster.name} - {self.name}"

class ShardMapping(models.Model):
    shard = models.ForeignKey(Shard, on_delete=models.CASCADE)
    shard_key = models.ForeignKey(ShardKey, on_delete=models.CASCADE)
    key_range_start = models.TextField(help_text="Start of key range (inclusive)")
    key_range_end = models.TextField(help_text="End of key range (exclusive)")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('shard', 'shard_key')
    
    def __str__(self):
        return f"{self.shard.name} - {self.shard_key.name}"
