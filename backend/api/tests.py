from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import DatabaseServer, Cluster, LoadBalancer, Connection, ShardKey

class ApiUrlsTestCase(APITestCase):
    def setUp(self):
        self.database_server = DatabaseServer.objects.create(
            name="test-db-server",
            hostname="localhost",
            port=5432,
            database_type="postgresql",
            username="testuser",
            password="testpass"
        )
        
        self.cluster = Cluster.objects.create(
            name="test-cluster",
            database_type="postgresql",
            replication_type="postgres_replication"
        )
        
        self.load_balancer = LoadBalancer.objects.create(
            name="test-load-balancer",
            hostname="localhost",
            port=8080,
            load_balancer_type="haproxy"
        )
        
        self.connection = Connection.objects.create(
            name="test-connection",
            cluster=self.cluster
        )
        
        self.shard_key = ShardKey.objects.create(
            name="test-shard-key",
            cluster=self.cluster,
            key_fields=["id"]
        )

    def test_status_endpoint(self):
        url = reverse('api:status')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_database_servers_list(self):
        url = reverse('api:database-server-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_clusters_list(self):
        url = reverse('api:cluster-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_load_balancers_list(self):
        url = reverse('api:load-balancer-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_connections_list(self):
        url = reverse('api:connection-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_shard_keys_list(self):
        url = reverse('api:shard-key-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_cluster_servers_list(self):
        url = reverse('api:cluster-servers-list', kwargs={'cluster_pk': self.cluster.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_cluster_load_balancers_list(self):
        url = reverse('api:cluster-load-balancers-list', kwargs={'cluster_pk': self.cluster.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_cluster_shards_list(self):
        url = reverse('api:cluster-shards-list', kwargs={'cluster_pk': self.cluster.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
