'use client';

import { BadgeAlert } from 'lucide-react';
import Link from 'next/link';

function Error() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="flex flex-col justify-center items-center gap-2 max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow">
        <BadgeAlert size={32} />
        <Link href="/">
          <h5 className="text-xl font-bold tracking-tight text-foreground">Something went wrong</h5>
        </Link>
        <div className="font-normal text-muted-foreground">
          <p>Please contact us if this error persists.</p>
        </div>
      </div>
    </div>
  );
}

export default Error;
