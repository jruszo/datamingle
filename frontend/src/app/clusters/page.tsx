'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Server, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Database,
  Cloud,
  Key
} from 'lucide-react';
import { get, post, put, del } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ClustersPage() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    database_type: 'postgresql',
    replication_type: 'postgres_replication',
    notes: ''
  });

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    try {
      const response = await get('/clusters/');
      setClusters(response.results || response);
    } catch (error) {
      console.error('Error fetching clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await post('/clusters/', formData);
      setIsModalOpen(false);
      resetForm();
      fetchClusters();
    } catch (error) {
      console.error('Error creating cluster:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await put(`/clusters/${editingCluster.id}/`, formData);
      setIsModalOpen(false);
      resetForm();
      fetchClusters();
    } catch (error) {
      console.error('Error updating cluster:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this cluster?')) {
      try {
        await del(`/clusters/${id}/`);
        fetchClusters();
        if (selectedCluster?.id === id) {
          setSelectedCluster(null);
        }
      } catch (error) {
        console.error('Error deleting cluster:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      database_type: 'postgresql',
      replication_type: 'postgres_replication',
      notes: ''
    });
    setEditingCluster(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (cluster: any) => {
    setFormData({
      name: cluster.name,
      database_type: cluster.database_type,
      replication_type: cluster.replication_type,
      notes: cluster.notes || ''
    });
    setEditingCluster(cluster);
    setIsModalOpen(true);
  };

  const filteredClusters = clusters.filter(cluster => 
    cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cluster.database_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clusters</h1>
          <p className="text-muted-foreground">Manage your database clusters</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Cluster
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCluster ? 'Edit Cluster' : 'Add Cluster'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Cluster name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="database_type">Database Type</Label>
                  <select
                    id="database_type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.database_type}
                    onChange={(e) => setFormData({...formData, database_type: e.target.value})}
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replication_type">Replication Type</Label>
                  <select
                    id="replication_type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.replication_type}
                    onChange={(e) => setFormData({...formData, replication_type: e.target.value})}
                  >
                    <option value="postgres_replication">PostgreSQL Replication</option>
                    <option value="mysql_replication">MySQL Replication</option>
                    <option value="mongodb_replication">MongoDB Replication</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingCluster ? handleUpdate : handleCreate}>
                  {editingCluster ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clusters..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Clusters</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClusters.map((cluster) => (
                    <TableRow 
                      key={cluster.id} 
                      className={selectedCluster?.id === cluster.id ? "bg-muted" : ""}
                      onClick={() => setSelectedCluster(cluster)}
                    >
                      <TableCell className="font-medium">{cluster.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cluster.database_type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(cluster);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(cluster.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedCluster ? (
            <Tabs defaultValue="servers">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="servers">
                  <Database className="mr-2 h-4 w-4" />
                  Servers
                </TabsTrigger>
                <TabsTrigger value="loadbalancers">
                  <Cloud className="mr-2 h-4 w-4" />
                  Load Balancers
                </TabsTrigger>
                <TabsTrigger value="shards">
                  <Server className="mr-2 h-4 w-4" />
                  Shards
                </TabsTrigger>
                <TabsTrigger value="details">
                  <Key className="mr-2 h-4 w-4" />
                  Details
                </TabsTrigger>
              </TabsList>
              <TabsContent value="servers">
                <Card>
                  <CardHeader>
                    <CardTitle>Servers in {selectedCluster.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">No servers configured</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="loadbalancers">
                <Card>
                  <CardHeader>
                    <CardTitle>Load Balancers for {selectedCluster.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">No load balancers configured</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="shards">
                <Card>
                  <CardHeader>
                    <CardTitle>Shards in {selectedCluster.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">No shards configured</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Cluster Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{selectedCluster.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium">{selectedCluster.database_type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Replication Type</p>
                          <p className="font-medium">{selectedCluster.replication_type}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a cluster to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
