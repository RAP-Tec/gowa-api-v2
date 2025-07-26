
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
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Gowa Plataforma | Dashboard Devices</h1>
      <InstanceManager />
    </div>
  )
}

