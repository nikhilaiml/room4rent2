import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
            <h1 className="text-4xl font-headline font-bold">Welcome to RoomLeLo</h1>
            <p className="text-muted-foreground">The easiest way to find your next accommodation.</p>
            <div className="flex gap-4 justify-center">
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="secondary">
                    <Link href="/register">Sign Up</Link>
                </Button>
            </div>
        </div>
    </div>
  );
}