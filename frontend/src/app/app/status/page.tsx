"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Info } from "lucide-react";

interface BackendStatus {
  status: string;
  django_version: string;
  python_version: string;
  platform: string;
  python_implementation: string;
}

export default function StatusPage() {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/api/status/`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading backend status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Connection Error
            </CardTitle>
            <CardDescription>
              Unable to connect to the backend server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Make sure the Django backend is running on localhost:8000</p>
              <p className="mt-2">
                Run:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  cd backend && python manage.py runserver
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Backend Status</h1>
          <p className="text-muted-foreground">
            Real-time status of the Django backend server
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status?.status === "ok" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Overall Status
              </CardTitle>
              <CardDescription>
                Current health status of the backend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge
                variant={status?.status === "ok" ? "default" : "destructive"}
              >
                {status?.status?.toUpperCase() || "UNKNOWN"}
              </Badge>
            </CardContent>
          </Card>

          {/* Django Version */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Django Version
              </CardTitle>
              <CardDescription>
                Current Django framework version
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-lg">
                {status?.django_version || "Unknown"}
              </Badge>
            </CardContent>
          </Card>

          {/* Python Version */}
          <Card>
            <CardHeader>
              <CardTitle>Python Version</CardTitle>
              <CardDescription>Python interpreter version</CardDescription>
            </CardHeader>
            <CardContent>
              <code className="bg-muted px-2 py-1 rounded text-sm">
                {status?.python_version || "Unknown"}
              </code>
            </CardContent>
          </Card>

          {/* Python Implementation */}
          <Card>
            <CardHeader>
              <CardTitle>Python Implementation</CardTitle>
              <CardDescription>
                Python implementation being used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                {status?.python_implementation || "Unknown"}
              </Badge>
            </CardContent>
          </Card>

          {/* Platform Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>
                Operating system and platform details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <code className="bg-muted px-2 py-1 rounded text-sm block">
                {status?.platform || "Unknown"}
              </code>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
