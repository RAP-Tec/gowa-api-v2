
"use client";

import InstanceManager from "@/app/components/instance-manager"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

  const router = useRouter();
  const { theme, setTheme } = useTheme();

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

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="container mx-auto py-8 px-4 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleToggleTheme}
          className="bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 px-3 py-2 rounded shadow hover:bg-gray-300 dark:hover:bg-zinc-700"
          title="Alternar tema"
        >
          {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
        </button>
        <button
          onClick={handleLogoff}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
          title="Logoff"
        >
          Logoff
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-6">Gowa Plataforma | Dashboard Devices</h1>
      <InstanceManager />
    </div>
  );
}

