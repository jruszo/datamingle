'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Search
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ShardKeysPage() {
  const [shardKeys, setShardKeys] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShardKey, setEditingShardKey] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    cluster: '',
    key_type: 'range',
    key_fields: '',
    data_type: 'integer',
    notes: ''
  });

  useEffect(() => {
    Promise.all([fetchShardKeys(), fetchClusters()]);
  }, []);

  const fetchShardKeys = async () => {
    try {
      const response = await get('/shard-keys/');
      setShardKeys(response.results || response);
    } catch (error) {
      console.error('Error fetching shard keys:', error);
    } finally {
      if (clusters.length > 0) setLoading(false);
    }
  };

  const fetchClusters = async () => {
    try {
      const response = await get('/clusters/');
      setClusters(response.results || response);
    } catch (error) {
      console.error('Error fetching clusters:', error);
    } finally {
      if (shardKeys.length > 0) setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const data = {
        ...formData,
        cluster: formData.cluster ? parseInt(formData.cluster) : null,
        key_fields: formData.key_fields.split(',').map(field => field.trim()).filter(field => field)
      };
      await post('/shard-keys/', data);
      setIsModalOpen(false);
      resetForm();
      fetchShardKeys();
    } catch (error) {
      console.error('Error creating shard key:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const data = {
        ...formData,
        cluster: formData.cluster ? parseInt(formData.cluster) : null,
        key_fields: formData.key_fields.split(',').map(field => field.trim()).filter(field => field)
      };
      await put(`/shard-keys/${editingShardKey.id}/`, data);
      setIsModalOpen(false);
      resetForm();
      fetchShardKeys();
    } catch (error) {
      console.error('Error updating shard key:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this shard key?')) {
      try {
        await del(`/shard-keys/${id}/`);
        fetchShardKeys();
      } catch (error) {
        console.error('Error deleting shard key:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cluster: '',
      key_type: 'range',
      key_fields: '',
      data_type: 'integer',
      notes: ''
    });
    setEditingShardKey(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (key: any) => {
    setFormData({
      name: key.name,
      cluster: key.cluster?.id?.toString() || '',
      key_type: key.key_type || 'range',
      key_fields: key.key_fields ? key.key_fields.join(', ') : '',
      data_type: key.data_type || 'integer',
      notes: key.notes || ''
    });
    setEditingShardKey(key);
    setIsModalOpen(true);
  };

  const filteredShardKeys = shardKeys.filter(key => 
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (key.cluster?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.key_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shard Keys</h1>
          <p className="text-muted-foreground">Manage your shard keys</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Shard Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingShardKey ? 'Edit Shard Key' : 'Add Shard Key'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Shard key name"
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="key_type">Key Type</Label>
                  <select
                    id="key_type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.key_type}
                    onChange={(e) => setFormData({...formData, key_type: e.target.value})}
                  >
                    <option value="range">Range</option>
                    <option value="hash">Hash</option>
                    <option value="list">List</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_type">Data Type</Label>
                  <select
                    id="data_type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.data_type}
                    onChange={(e) => setFormData({...formData, data_type: e.target.value})}
                  >
                    <option value="integer">Integer</option>
                    <option value="string">String</option>
                    <option value="datetime">DateTime</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="key_fields">Key Fields (comma separated)</Label>
                <Input
                  id="key_fields"
                  value={formData.key_fields}
                  onChange={(e) => setFormData({...formData, key_fields: e.target.value})}
                  placeholder="field1, field2, field3"
                />
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
                <Button onClick={editingShardKey ? handleUpdate : handleCreate}>
                  {editingShardKey ? 'Update' : 'Create'}
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
            placeholder="Search shard keys..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shard Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Key Fields</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShardKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    {key.cluster ? (
                      <Badge variant="secondary">{key.cluster.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">No cluster</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{key.key_type || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    {key.key_fields ? (
                      <div className="flex flex-wrap gap-1">
                        {key.key_fields.map((field: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{field}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No fields</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(key)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(key.id)}
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
