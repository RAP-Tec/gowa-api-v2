"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [authKey, setAuthKey] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, apiKey: authKey })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("gowa_auth", JSON.stringify({ user, authKey }));
      router.push("/manager");
    } else {
      setError("Invalid Login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-black">
      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded shadow">
        <div className="flex justify-center mb-6">
          <Image src="/tealogin.png" alt="Login" width={96} height={96} />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">GOWA</h2>
        <h2 className="text-1xl mb-4 text-center">Plataforma e soluções completas para WhatsApp.</h2>
        <h2 className="text-1xl mb-4 text-center">Devices and Hooks Dashboard</h2>
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">User</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              value={user}
              onChange={e => setUser(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">AuthKey</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              value={authKey}
              onChange={e => setAuthKey(e.target.value)}
              required
            />
          </div>
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 font-semibold"
          >
            Conectar
          </button>
        </form>
      </div>
    </div>
  );
}
