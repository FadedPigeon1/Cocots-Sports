import Link from "next/link";
import { Trophy } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-primary"
        >
          <Trophy className="h-6 w-6" />
          <span>Cocots Sports</span>
        </Link>
        <div className="ml-auto flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/predictions"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            My Predictions
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
