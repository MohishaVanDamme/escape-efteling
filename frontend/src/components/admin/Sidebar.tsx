import {Persons, ArrowRightFromSquare, CrownDiamond, LockFill} from '@gravity-ui/icons';
import { Button } from '@heroui/react';
import type { Dispatch, SetStateAction } from 'react';

export default function Sidebar(
    {handleLogout, activePage, setActivePage } : 
    { handleLogout: () => Promise<void>; activePage: string; setActivePage: Dispatch<SetStateAction<string>>;}
) {
    return (
    <aside className="flex h-full md:h-screen w-64 flex-col bg-accent">
      {/* Header */}
      <div className="p-6">
        <p className="text-xl font-bold text-center text-[#F8F1E7]">Efteling escape</p>
      </div>

      {/* Navigatie */}
      <nav className="flex-1 space-y-2 px-3">
        <Button fullWidth variant={activePage === "teams" ? "secondary": undefined} onPress={() => setActivePage("teams")}>
            <Persons />
            Teams
        </Button>
        <Button
          fullWidth
          variant={activePage === "leaderboard" ? "secondary": undefined}
          onPress={() => setActivePage("leaderboard")}
        >
            <CrownDiamond />
          Leaderboard
        </Button>
        <Button
          fullWidth
          variant={activePage === "secret-word" ? "secondary": undefined}
          onPress={() => setActivePage("secret-word")}
        >
          <LockFill />
          Secret Word
        </Button>
      </nav>

      {/* Logout */}
      <div className="p-3">
        <Button
          fullWidth
          onPress={handleLogout}
        >
            <ArrowRightFromSquare />
          Log uit
        </Button>
      </div>
    </aside>
  );
}