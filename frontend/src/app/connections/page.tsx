'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Link, 
  Plus, 
  Edit, 
  Trash2, 
  Search
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    cluster: '',
    notes: ''
  });

  useEffect(() => {
    Promise.all([fetchConnections(), fetchClusters()]);
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await api.get('/api/connections/');
      setConnections(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      if (clusters.length > 0) setLoading(false);
    }
  };

  const fetchClusters = async () => {
    try {
      const response = await api.get('/api/clusters/');
      setClusters(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching clusters:', error);
    } finally {
      if (connections.length > 0) setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const data = {
        ...formData,
        cluster: formData.cluster ? parseInt(formData.cluster) : null
      };
      await api.post('/api/connections/', data);
      setIsModalOpen(false);
      resetForm();
      fetchConnections();
    } catch (error) {
      console.error('Error creating connection:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const data = {
        ...formData,
        cluster: formData.cluster ? parseInt(formData.cluster) : null
      };
      await api.put(`/api/connections/${editingConnection.id}/`, data);
      setIsModalOpen(false);
      resetForm();
      fetchConnections();
    } catch (error) {
      console.error('Error updating connection:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      try {
        await api.delete(`/api/connections/${id}/`);
        fetchConnections();
      } catch (error) {
        console.error('Error deleting connection:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cluster: '',
      notes: ''
    });
    setEditingConnection(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (conn: any) => {
    setFormData({
      name: conn.name,
      cluster: conn.cluster?.id?.toString() || '',
      notes: conn.notes || ''
    });
    setEditingConnection(conn);
    setIsModalOpen(true);
  };

  const filteredConnections = connections.filter(conn => 
    conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conn.cluster?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Connections</h1>
          <p className="text-muted-foreground">Manage your database connections</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingConnection ? 'Edit Connection' : 'Add Connection'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Connection name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cluster">Cluster</Label>
                <select
                  id="cluster"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.cluster}
                  onChange={(e) => setFormData({...formData, cluster: e.target.value})}
                >
                  <option value="">Select a cluster</option>
                  {clusters.map(cluster => (
                    <option key={cluster.id} value={cluster.id}>
                      {cluster.name}
                    </option>
                  ))}
                </select>
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
                <Button onClick={editingConnection ? handleUpdate : handleCreate}>
                  {editingConnection ? 'Update' : 'Create'}
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
            placeholder="Search connections..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConnections.map((conn) => (
                <TableRow key={conn.id}>
                  <TableCell className="font-medium">{conn.name}</TableCell>
                  <TableCell>
                    {conn.cluster ? (
                      <Badge variant="secondary">{conn.cluster.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">No cluster</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(conn)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(conn.id)}
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
  );
}
