import Link from "next/link";
import {
  getSignInUrl,
  getSignUpUrl,
  withAuth,
} from "@workos-inc/authkit-nextjs";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const { user } = await withAuth();
  const signInUrl = await getSignInUrl();
  const signUpUrl = await getSignUpUrl();
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 p-6 text-white">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">DataMingle</h1>
            <p className="text-xl">Your all-in-one database solution.</p>
          </div>
          <div className="flex gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  Welcome, {user.firstName || user.email}!
                </span>
                <Link href="/dashboard">
                  <Button variant="secondary">Go to Dashboard</Button>
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href={signInUrl}>
                  <Button variant="secondary">Sign In</Button>
                </Link>
                <Link href={signUpUrl}>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <section className="py-12 text-center">
          <h2 className="mb-4 text-4xl font-semibold text-gray-800">
            Monitor, Secure, and Optimize Your Database with Ease
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            DataMingle provides a seamless experience to manage your database
            operations efficiently.
          </p>
          <Link href={user ? "/dashboard" : signUpUrl}>
            <Button className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700">
              {user ? "Go to Dashboard" : "Get Started"}
            </Button>
          </Link>
        </section>

        <section className="grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-2xl font-semibold text-gray-700">
              Easy Monitoring
            </h3>
            <p className="text-gray-600">
              Keep an eye on your database performance with our intuitive
              monitoring tools. Real-time insights and alerts.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-2xl font-semibold text-gray-700">
              Robust Security
            </h3>
            <p className="text-gray-600">
              Protect your valuable data with advanced security features and
              proactive threat detection.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-2xl font-semibold text-gray-700">
              Seamless Schema Changes
            </h3>
            <p className="text-gray-600">
              Manage and evolve your database schema without downtime. Apply
              changes with confidence.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-2xl font-semibold text-gray-700">
              Smart Optimizations
            </h3>
            <p className="text-gray-600">
              Boost your database performance with AI-powered optimization
              suggestions and automated tuning.
            </p>
          </div>
        </section>

        <section className="rounded-lg bg-gray-50 py-12 text-center">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800">
            Ready to take control of your database?
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Join DataMingle today and experience the future of database
            management.
          </p>
          <Link href={user ? "/dashboard" : signUpUrl}>
            <Button className="rounded-lg bg-green-500 px-8 py-3 font-semibold text-white transition duration-300 hover:bg-green-600">
              {user ? "Go to Dashboard" : "Sign Up Now"}
            </Button>
          </Link>
        </section>
      </main>

      <footer className="bg-gray-800 p-6 text-center text-white">
        <p>&copy; 2024 DataMingle. All rights reserved.</p>
      </footer>
    </div>
  );
}
