'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import signOutAction from '../app/actions/signOut';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';

function Header() {
  const pathname = usePathname();

  return (
    <header className="flex justify-between gap-2 items-center px-4 py-2 shadow-xs">
      <div className="flex justify-start items-center gap-2">
        {pathname === '/' ? (
          <Button disabled variant="ghost" size="sm">
            Dashboard
          </Button>
        ) : (
          <Button asChild variant="link" size="sm">
            <Link href="/" draggable={false}>
              Dashboard
            </Link>
          </Button>
        )}
        {/* {isAdmin &&
          (pathname === '/admin' ? (
            <Button disabled variant="ghost" size="sm">
              Admin
            </Button>
          ) : (
            <Button asChild variant="link" size="sm">
              <Link href="/admin" draggable={false}>
                Admin
              </Link>
            </Button>
          ))} */}
      </div>
      <div className="flex gap-2 items-center">
        <ModeToggle />
        <form action={signOutAction}>
          <Button variant="outline" size="icon-sm" type="submit">
            <LogOut className="text-destructive" />
          </Button>
        </form>
      </div>
    </header>
  );
}

export default Header;
