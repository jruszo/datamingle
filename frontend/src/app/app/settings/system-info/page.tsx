"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Clock, 
  Cpu, 
  Database, 
  Globe, 
  HardDrive, 
  MemoryStick, 
  Server,
  Zap
} from "lucide-react"
import { useEffect, useState } from "react"

interface BackendInfo {
  python_version: string
  django_version: string
  database_engine: string
  database_name: string
  database_host: string
  database_port: string
  server_time: string
  server_timezone: string
  platform: string
  architecture: string
  cpu_count: number
  memory_total: string
  memory_available: string
}

export default function SystemInfoPage() {
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBackendInfo = async () => {
      try {
        const response = await fetch("/api/system-info/")
        if (!response.ok) {
          throw new Error("Failed to fetch backend system information")
        }
        const data: BackendInfo = await response.json()
        setBackendInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchBackendInfo()
  }, [])

  // Frontend information
  const frontendInfo = {
    nextjsVersion: "14.2.3",
    nodeVersion: process.env.NODE_VERSION || "20.x",
    platform: typeof navigator !== "undefined" ? navigator.platform : "Unknown",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Zap className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2">Loading system information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-destructive">
              <p>Error loading backend information: {error}</p>
              <p className="mt-2 text-sm">Please check your connection and try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Information</h1>
        <p className="text-muted-foreground">
          Detailed information about your frontend and backend environments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Frontend Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Frontend Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Framework</span>
              <Badge variant="secondary">Next.js</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next.js Version</span>
                <span>{frontendInfo.nextjsVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Node.js Version</span>
                <span>{frontendInfo.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span>{frontendInfo.platform}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build Time</span>
                <span>{new Date(frontendInfo.buildTime).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5" />
              Backend Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Framework</span>
              <Badge variant="secondary">Django</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Python Version</span>
                <span>{backendInfo?.python_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Django Version</span>
                <span>{backendInfo?.django_version}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Engine</span>
                <span>{backendInfo?.database_engine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Name</span>
                <span>{backendInfo?.database_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Host</span>
                <span>{backendInfo?.database_host || "localhost"}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Server Time</span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {backendInfo?.server_time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timezone</span>
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {backendInfo?.server_timezone}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span>{backendInfo?.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Architecture</span>
                <span>{backendInfo?.architecture}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPU Cores</span>
                <span className="flex items-center">
                  <Cpu className="mr-1 h-4 w-4" />
                  {backendInfo?.cpu_count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Memory</span>
                <span className="flex items-center">
                  <MemoryStick className="mr-1 h-4 w-4" />
                  {backendInfo?.memory_available} / {backendInfo?.memory_total}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
