
"use client";

import InstanceManager from "@/app/components/instance-manager"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const router = useRouter();
  const [hooks, setHooks] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    id: "",
    verify_token: "",
    chat_api_url: "",
    chat_api_key: "",
    send_post_url_1: "",
    send_post_url_2: "",
    send_post_url_3: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("gowa_auth");
      if (!auth) {
        router.replace("/login");
      }
    }
    fetchHooks();
    // eslint-disable-next-line
  }, [router]);

  const fetchHooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hook");
      const data = await res.json();
      setHooks(data);
    } catch (e) {
      setHooks({});
    }
    setLoading(false);
  };

  const handleLogoff = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("gowa_auth");
      router.replace("/login");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setForm({ id, ...hooks[id] });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este registro?")) return;
    await fetch("/api/hook", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchHooks();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/hook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setEditingId(null);
    setForm({
      id: "",
      verify_token: "",
      chat_api_url: "",
      chat_api_key: "",
      send_post_url_1: "",
      send_post_url_2: "",
      send_post_url_3: ""
    });
    fetchHooks();
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

      <h1 className="text-2xl font-bold mb-6">Gowa Platform | Devices and Hooks Dashboard</h1>
      <h3 className="text-1xl mb-6">Sua Webhook URL para API Oficial: <spam id="webhookUrl" name="webhookUrl">https://dsfdsfd.com.br/webhook/2323</spam></h3>
      
      {/* CRUD HOOKS */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Manage Webhooks</h2>
        <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <Label>ID</Label>
            <Input name="id" value={form.id} onChange={handleChange} required disabled={!!editingId} />
          </div>
          <div>
            <Label>Verify Token</Label>
            <Input name="verify_token" value={form.verify_token} onChange={handleChange} required />
          </div>
          <div>
            <Label>Chat API URL</Label>
            <Input name="chat_api_url" value={form.chat_api_url} onChange={handleChange} required />
          </div>
          <div>
            <Label>Chat API Key</Label>
            <Input name="chat_api_key" value={form.chat_api_key} onChange={handleChange} required />
          </div>
          <div>
            <Label>Send Post URL 1</Label>
            <Input name="send_post_url_1" value={form.send_post_url_1} onChange={handleChange} />
          </div>
          <div>
            <Label>Send Post URL 2</Label>
            <Input name="send_post_url_2" value={form.send_post_url_2} onChange={handleChange} />
          </div>
          <div>
            <Label>Send Post URL 3</Label>
            <Input name="send_post_url_3" value={form.send_post_url_3} onChange={handleChange} />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">{editingId ? "Salvar" : "Adicionar"}</Button>
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-zinc-800">
                <th className="border px-2 py-1">Account ID</th>
                <th className="border px-2 py-1">Token API</th>
                <th className="border px-2 py-1">Chat API URL</th>
                <th className="border px-2 py-1">Chat API Key</th>
                <th className="border px-2 py-1">Send Post URL 1</th>
                <th className="border px-2 py-1">Send Post URL 2</th>
                <th className="border px-2 py-1">Send Post URL 3</th>
                <th className="border px-2 py-1">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center p-2">Carregando...</td></tr>
              ) : (
                Object.keys(hooks).length === 0 ? (
                  <tr><td colSpan={8} className="text-center p-2">Nenhum registro</td></tr>
                ) : (
                  Object.entries(hooks).map(([id, hook]: any) => (
                    <tr key={id} className="border-b">
                      <td className="border px-2 py-1 font-mono">{id}</td>
                      <td className="border px-2 py-1">{hook.verify_token}</td>
                      <td className="border px-2 py-1">{hook.chat_api_url}</td>
                      <td className="border px-2 py-1">{hook.chat_api_key}</td>
                      <td className="border px-2 py-1">{hook.send_post_url_1}</td>
                      <td className="border px-2 py-1">{hook.send_post_url_2}</td>
                      <td className="border px-2 py-1">{hook.send_post_url_3}</td>
                      <td className="border px-2 py-1 flex gap-2">
                        <Button type="button" size="sm" onClick={() => handleEdit(id)}>Editar</Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(id)}>Excluir</Button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
  <div className="mb-8">
    <hr></hr>
  </div>
      <InstanceManager />
    </div>
  );
}

