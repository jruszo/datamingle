import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-b from-background to-muted">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to <span className="text-primary">Datamingle</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            The ultimate platform for managing and sharing data across your organization. 
            Secure, scalable, and developer-friendly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground">
              Everything you need to manage, secure, and share your data efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Developer Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-6 w-6 text-primary" />
                  For Developers
                </CardTitle>
                <CardDescription>
                  Streamline your data workflows with our powerful tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Zap className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">API Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive REST and GraphQL APIs for seamless integration
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Zap className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Real-time Data</h3>
                    <p className="text-sm text-muted-foreground">
                      WebSockets support for live data updates and synchronization
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Zap className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">SDKs & Libraries</h3>
                    <p className="text-sm text-muted-foreground">
                      Client libraries for all major programming languages
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Administrator Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-6 w-6 text-primary" />
                  For Administrators
                </CardTitle>
                <CardDescription>
                  Complete control and visibility over your data infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Access Control</h3>
                    <p className="text-sm text-muted-foreground">
                      Fine-grained permissions and role-based access management
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Audit Logs</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive logging for compliance and security monitoring
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Data Governance</h3>
                    <p className="text-sm text-muted-foreground">
                      Policy enforcement and data quality management tools
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of teams using Datamingle to manage their data efficiently and securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/signup">
                Create Free Account
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
