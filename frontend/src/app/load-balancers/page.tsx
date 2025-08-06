'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Cloud, 
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

export default function LoadBalancersPage() {
  const [loadBalancers, setLoadBalancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoadBalancer, setEditingLoadBalancer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    port: 8080,
    load_balancer_type: 'haproxy',
    notes: ''
  });

  useEffect(() => {
    fetchLoadBalancers();
  }, []);

  const fetchLoadBalancers = async () => {
    try {
      const response = await api.get('/api/load-balancers/');
      setLoadBalancers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching load balancers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/api/load-balancers/', formData);
      setIsModalOpen(false);
      resetForm();
      fetchLoadBalancers();
    } catch (error) {
      console.error('Error creating load balancer:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/api/load-balancers/${editingLoadBalancer.id}/`, formData);
      setIsModalOpen(false);
      resetForm();
      fetchLoadBalancers();
    } catch (error) {
      console.error('Error updating load balancer:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this load balancer?')) {
      try {
        await api.delete(`/api/load-balancers/${id}/`);
        fetchLoadBalancers();
      } catch (error) {
        console.error('Error deleting load balancer:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      hostname: '',
      port: 8080,
      load_balancer_type: 'haproxy',
      notes: ''
    });
    setEditingLoadBalancer(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (lb: any) => {
    setFormData({
      name: lb.name,
      hostname: lb.hostname,
      port: lb.port,
      load_balancer_type: lb.load_balancer_type,
      notes: lb.notes || ''
    });
    setEditingLoadBalancer(lb);
    setIsModalOpen(true);
  };

  const filteredLoadBalancers = loadBalancers.filter(lb => 
    lb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lb.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lb.load_balancer_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Load Balancers</h1>
          <p className="text-muted-foreground">Manage your load balancers</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Load Balancer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingLoadBalancer ? 'Edit Load Balancer' : 'Add Load Balancer'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Load balancer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostname">Hostname</Label>
                <Input
                  id="hostname"
                  value={formData.hostname}
                  onChange={(e) => setFormData({...formData, hostname: e.target.value})}
                  placeholder="Load balancer hostname"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({...formData, port: parseInt(e.target.value) || 8080})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="load_balancer_type">Type</Label>
                  <select
                    id="load_balancer_type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.load_balancer_type}
                    onChange={(e) => setFormData({...formData, load_balancer_type: e.target.value})}
                  >
                    <option value="haproxy">HAProxy</option>
                    <option value="nginx">Nginx</option>
                    <option value="aws_alb">AWS ALB</option>
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
                <Button onClick={editingLoadBalancer ? handleUpdate : handleCreate}>
                  {editingLoadBalancer ? 'Update' : 'Create'}
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
            placeholder="Search load balancers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Load Balancers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Hostname</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoadBalancers.map((lb) => (
                <TableRow key={lb.id}>
                  <TableCell className="font-medium">{lb.name}</TableCell>
                  <TableCell>{lb.hostname}</TableCell>
                  <TableCell>{lb.port}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lb.load_balancer_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(lb)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(lb.id)}
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
