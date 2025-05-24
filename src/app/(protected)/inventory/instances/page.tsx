"use client";

import { useState, useEffect } from "react";
import { useAuthenticatedApi } from "@/hooks/use-api"; // Added import
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, TestTube } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
///import { toast } from "sonner";

interface DatabaseInstance {
  id: number;
  database_type: string;
  name: string;
  hostname: string;
  port: number;
  username: string;
  database_name?: string;
  ssl_enabled: boolean;
  connection_timeout: number;
  connection_status?: string;
  last_tested_at?: string;
  created_at: string;
  updated_at: string;
}

interface DatabaseInstanceFormData {
  database_type: string;
  name: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
  database_name?: string;
  ssl_enabled: boolean;
  connection_timeout: number;
}

export default function DatabaseInstancesPage() {
  const [instances, setInstances] = useState<DatabaseInstance[]>([]);
  // const [loading, setLoading] = useState(true); // Will be replaced by isTokenLoading or local loading states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstance, setEditingInstance] =
    useState<DatabaseInstance | null>(null);
  const [formData, setFormData] = useState<DatabaseInstanceFormData>({
    database_type: "mysql",
    name: "",
    hostname: "",
    port: 3306,
    username: "",
    password: "",
    database_name: "",
    ssl_enabled: false,
    connection_timeout: 30,
  });
  //const { toast } = useToast();

  const { apiCall, isTokenLoading, hasToken } = useAuthenticatedApi(); // Instantiated hook

  const databaseTypes = [
    { value: "mysql", label: "MySQL", defaultPort: 3306 },
    { value: "postgresql", label: "PostgreSQL", defaultPort: 5432 },
    { value: "mssql", label: "Microsoft SQL Server", defaultPort: 1433 },
    { value: "oracle", label: "Oracle", defaultPort: 1521 },
    { value: "mongodb", label: "MongoDB", defaultPort: 27017 },
  ];

  const fetchInstances = async () => {
    // setLoading(true); // Consider a local loading state if needed beyond initial load
    try {
      const result = await apiCall("/database-instances");

      if (result.ok) {
        setInstances(result.data);
      } else {
        console.error("Failed to fetch database instances:", result.error);
        //toast({
        //  title: "Error",
        //  description: result.error || "Failed to fetch database instances",
        //  variant: "destructive",
        //});
      }
    } catch (error) {
      console.error("Failed to fetch database instances:", error);
      //   toast({
      //     title: "Error",
      //     description: "Failed to fetch database instances",
      //     variant: "destructive",
      //   });
    } finally {
      // setLoading(false); // Handled by isTokenLoading or local state
    }
  };

  useEffect(() => {
    if (hasToken) {
      fetchInstances();
    }
  }, [hasToken]); // Added hasToken dependency

  const handleDatabaseTypeChange = (value: string) => {
    const dbType = databaseTypes.find((type) => type.value === value);
    setFormData((prev) => ({
      ...prev,
      database_type: value,
      port: dbType?.defaultPort || 3306,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add a local loading state for form submission if desired
    // const [isSubmitting, setIsSubmitting] = useState(false);
    // setIsSubmitting(true);

    try {
      const url = editingInstance
        ? `/database-instances/${editingInstance.id}`
        : "/database-instances";
      const method = editingInstance ? "PUT" : "POST";

      const result = await apiCall(url, {
        method,
        body: formData,
      });

      if (result.ok) {
        //toast({
        //  title: "Success",
        //  description: `Database instance ${editingInstance ? "updated" : "created"} successfully`,
        //});
        setIsDialogOpen(false);
        setEditingInstance(null);
        resetForm();
        fetchInstances();
      } else {
        console.error(`Failed to ${editingInstance ? "update" : "create"} database instance:`, result.error);
        //toast({
        //  title: "Error",
        //  description:
        //    result.error ||
        //    `Failed to ${editingInstance ? "update" : "create"} database instance`,
        //  variant: "destructive",
        //});
      }
    } catch (error) {
      console.error(`Failed to ${editingInstance ? "update" : "create"} database instance:`, error);
      //toast({
      //  title: "Error",
      //  description: `Failed to ${editingInstance ? "update" : "create"} database instance`,
      //  variant: "destructive",
      //});
    } finally {
      // setIsSubmitting(false);
    }
  };

  const handleEdit = (instance: DatabaseInstance) => {
    setEditingInstance(instance);
    setFormData({
      database_type: instance.database_type,
      name: instance.name,
      hostname: instance.hostname,
      port: instance.port,
      username: instance.username,
      password: "", // Don't populate password for security
      database_name: instance.database_name || "",
      ssl_enabled: instance.ssl_enabled,
      connection_timeout: instance.connection_timeout,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this database instance?"))
      return;
    // Add a local loading state for delete if desired
    // const [isDeleting, setIsDeleting] = useState(false);
    // setIsDeleting(true);
    try {
      const result = await apiCall(`/database-instances/${id}`, {
        method: "DELETE",
      });

      if (result.ok) {
        //toast({
        //  title: "Success",
        //  description: "Database instance deleted successfully",
        //});
        fetchInstances();
      } else {
        console.error("Failed to delete database instance:", result.error);
        //toast({
        //  title: "Error",
        //  description: result.error || "Failed to delete database instance",
        //  variant: "destructive",
        //});
      }
    } catch (error) {
      console.error("Failed to delete database instance:", error);
      //toast({
      //  title: "Error",
      //  description: "Failed to delete database instance",
      //  variant: "destructive",
      //});
    } finally {
      // setIsDeleting(false);
    }
  };

  const handleTestConnection = async (id: number) => {
    // Add a local loading state for test connection if desired
    // const [isTesting, setIsTesting] = useState(false);
    // setIsTesting(true);
    try {
      const result = await apiCall(
        `/database-instances/${id}/test-connection`,
        {
          method: "POST",
        },
      );

      // Assuming the response structure from useAuthenticatedApi is { ok: boolean, data: any, error: string | null }
      // And the specific endpoint returns { success: boolean, message: string } in `data`
      if (result.ok && result.data) {
        //toast({
        //  title: result.data.success ? "Connection Successful" : "Connection Failed",
        //  description: result.data.message,
        //  variant: result.data.success ? "default" : "destructive",
        //});
      } else {
         console.error("Failed to test connection:", result.error || result.data?.message);
        //toast({
        //  title: "Error",
        //  description: result.error || result.data?.message || "Failed to test connection",
        //  variant: "destructive",
        //});
      }
      fetchInstances(); // Refresh to update connection status
    } catch (error) {
      console.error("Failed to test connection:", error);
      //toast({
      //  title: "Error",
      //  description: "Failed to test connection",
      //  variant: "destructive",
      //});
    } finally {
      // setIsTesting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      database_type: "mysql",
      name: "",
      hostname: "",
      port: 3306,
      username: "",
      password: "",
      database_name: "",
      ssl_enabled: false,
      connection_timeout: 30,
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-500">
            Connected
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Untested</Badge>;
    }
  };

  if (isTokenLoading) { // Replaced loading with isTokenLoading
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Instances</h1>
          <p className="text-muted-foreground">
            Manage your database connections
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingInstance(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Database
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingInstance
                  ? "Edit Database Instance"
                  : "Add Database Instance"}
              </DialogTitle>
              <DialogDescription>
                {editingInstance
                  ? "Update the database connection details."
                  : "Add a new database connection."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="database_type">Database Type</Label>
                <Select
                  value={formData.database_type}
                  onValueChange={handleDatabaseTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    {databaseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="My Database"
                  required
                />
              </div>

              <div>
                <Label htmlFor="hostname">Hostname</Label>
                <Input
                  id="hostname"
                  value={formData.hostname}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hostname: e.target.value,
                    }))
                  }
                  placeholder="localhost"
                  required
                />
              </div>

              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      port: parseInt(e.target.value),
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required={!editingInstance}
                  placeholder={
                    editingInstance
                      ? "Leave blank to keep current password"
                      : ""
                  }
                />
              </div>

              <div>
                <Label htmlFor="database_name">Database Name (Optional)</Label>
                <Input
                  id="database_name"
                  value={formData.database_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      database_name: e.target.value,
                    }))
                  }
                  placeholder="my_database"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ssl_enabled"
                  checked={formData.ssl_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, ssl_enabled: checked }))
                  }
                />
                <Label htmlFor="ssl_enabled">Enable SSL</Label>
              </div>

              <div>
                <Label htmlFor="connection_timeout">
                  Connection Timeout (seconds)
                </Label>
                <Input
                  id="connection_timeout"
                  type="number"
                  value={formData.connection_timeout}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      connection_timeout: parseInt(e.target.value),
                    }))
                  }
                  min="1"
                  max="300"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingInstance ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {instances.map((instance) => (
          <Card key={instance.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {instance.name}
                    {getStatusBadge(instance.connection_status)}
                  </CardTitle>
                  <CardDescription>
                    {instance.database_type.toUpperCase()} • {instance.hostname}
                    :{instance.port}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Username:</strong> {instance.username}
                </div>
                {instance.database_name && (
                  <div>
                    <strong>Database:</strong> {instance.database_name}
                  </div>
                )}
                <div>
                  <strong>SSL:</strong>{" "}
                  {instance.ssl_enabled ? "Enabled" : "Disabled"}
                </div>
                {instance.last_tested_at && (
                  <div>
                    <strong>Last tested:</strong>{" "}
                    {new Date(instance.last_tested_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection(instance.id)}
                >
                  <TestTube className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(instance)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(instance.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {instances.length === 0 && (
        <div className="py-12 text-center">
          <h3 className="text-lg font-semibold">No database instances</h3>
          <p className="text-muted-foreground">
            Get started by adding your first database connection.
          </p>
        </div>
      )}
    </div>
  );
}
