"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { getUser, signOut } from "@/lib/supabase/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await getUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex gap-3">
        <div className="h-10 w-20 bg-white/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-white/80">
          <User className="h-4 w-4" />
          <span className="text-sm">{user.email}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Link
        href="/login"
        className="px-4 py-2 text-white hover:text-orange-400 transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
}
