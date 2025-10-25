import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="space-y-4">
          <h1 className="text-5xl font-headline font-bold text-primary">
            Welcome to ScholarSage
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal AI research assistant. Upload documents, ask questions, and get summaries instantly.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
