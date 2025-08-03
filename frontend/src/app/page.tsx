import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8">
      <main className="flex flex-col items-center space-y-8 max-w-2xl text-center">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to begin development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">1</Badge>
              <span className="text-sm">
                Edit{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                  src/app/page.tsx
                </code>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">2</Badge>
              <span className="text-sm">
                Save and see your changes instantly
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button asChild className="flex-1">
            <Link href="/status">
              <Image
                className="dark:invert mr-2"
                src="/globe.svg"
                alt="Status icon"
                width={20}
                height={20}
              />
              Backend Status
            </Link>
          </Button>

          <Button variant="outline" asChild className="flex-1">
            <a
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read our docs
            </a>
          </Button>
        </div>
      </main>

      <footer className="flex flex-wrap gap-6 justify-center">
        <Button variant="ghost" size="sm" asChild>
          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
              className="mr-2"
            />
            Learn
          </a>
        </Button>

        <Button variant="ghost" size="sm" asChild>
          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
              className="mr-2"
            />
            Examples
          </a>
        </Button>

        <Button variant="ghost" size="sm" asChild>
          <a
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
              className="mr-2"
            />
            Go to nextjs.org →
          </a>
        </Button>
      </footer>
    </div>
  );
}
