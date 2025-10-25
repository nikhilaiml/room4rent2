import { BookOpenCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-primary-foreground group-data-[collapsible=icon]:justify-center',
        className
      )}
    >
      <BookOpenCheck className="h-7 w-7 text-primary-foreground" />
      <span className="text-lg font-bold font-headline group-data-[collapsible=icon]:hidden">
        ScholarSage
      </span>
    </div>
  );
}
