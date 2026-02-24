"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTracking } from "@/lib/hooks/useTracking";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useTracking();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return; // still initialising
    if (!user) {
      router.push("/login");
    } else {
      setReady(true);
    }
  }, [user, loading, router]);

  if (loading || !ready) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent mb-4" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
