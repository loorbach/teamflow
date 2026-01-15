import { EmployeeWithNotes, Role, Team } from '@/db/types';
import { authClient } from '@/lib/auth-client';
import MainMenu from './main-menu';
import { ModeToggle } from './mode-toggle';

type Props = {
  onEmployeeAdded: (employee: EmployeeWithNotes) => void;
  teams: Team[];
  roles: Role[];
};

function Header({ onEmployeeAdded, teams, roles }: Props) {
  const { data: session } = authClient.useSession();

  return (
    <header className="flex justify-between gap-8 items-center px-4 py-2">
      <MainMenu onEmployeeAdded={onEmployeeAdded} roles={roles} teams={teams} />
      <div className="flex items-center gap-2">
        {session?.user && (
          <h1 className="text-muted-foreground text-sm">
            welcome {session?.user.name}
          </h1>
        )}
        <ModeToggle />
      </div>
    </header>
  );
}

export default Header;
