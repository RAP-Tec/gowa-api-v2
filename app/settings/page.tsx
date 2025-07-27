
"use client";

import InstanceManager from "@/app/components/instance-manager"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("gowa_auth");
      if (!auth) {
        router.replace("/login");
      }
    }
  }, [router]);

  const handleLogoff = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("gowa_auth");
      router.replace("/login");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 relative">
      <button
        onClick={handleLogoff}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
        title="Logoff"
      >
        Logoff
      </button>
      <h1 className="text-2xl font-bold mb-6">Gowa Plataforma | Dashboard Devices</h1>
      <InstanceManager />
    </div>
  );
}

