"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function AdminMessagesClient() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load messages");
      setMessages(data.messages);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;
  const unreadCount = messages.filter((m) => !m.isRead).length;

  const markRead = async (id: string, isRead: boolean) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update");
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead } : m)));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update message");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedId === id) setSelectedId(null);
      toast.success("Message deleted");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete message");
    }
  };

  const openMessage = async (message: ContactMessage) => {
    setSelectedId(message.id);
    if (!message.isRead) {
      await markRead(message.id, true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0071CE] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {messages.length} total
        </span>
        {unreadCount > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {unreadCount} unread
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          No contact messages yet. Messages from the contact page will appear here.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="max-h-[520px] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
            {messages.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => openMessage(message)}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  selectedId === message.id
                    ? "border-[#0071CE] bg-white shadow-sm"
                    : "border-transparent bg-white hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{message.name}</p>
                    <p className="truncate text-xs text-slate-500">{message.email}</p>
                  </div>
                  {!message.isRead && (
                    <span className="shrink-0 rounded-full bg-[#02AAA4] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-2 truncate text-sm text-slate-700">
                  {message.subject || "General inquiry"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            {selected ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">From</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{selected.name}</p>
                  <a href={`mailto:${selected.email}`} className="text-sm text-[#0071CE] hover:underline">
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <p className="mt-1 text-sm text-slate-600">{selected.phone}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Subject</p>
                  <p className="mt-1 text-sm text-slate-800">{selected.subject || "General inquiry"}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Message</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    {selected.message}
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  Received {new Date(selected.createdAt).toLocaleString()}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => markRead(selected.id, !selected.isRead)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Mark as {selected.isRead ? "unread" : "read"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMessage(selected.id)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-slate-500">
                Select a message to read it
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
