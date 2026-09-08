"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CreateUserModal } from "@/components/dashboard/create-user-modal";
import type {
  CreateDashboardUserInput,
  DashboardUser,
} from "@/lib/dashboard-users/types";
import { cn } from "@/lib/utils";

type UsersPanelProps = {
  initialUsers: DashboardUser[];
  currentUserId: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function UsersPanel({ initialUsers, currentUserId }: UsersPanelProps) {
  const [users, setUsers] = useState(initialUsers);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<DashboardUser | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function showMessage(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 4000);
  }

  async function handleCreate(input: CreateDashboardUserInput): Promise<boolean> {
    if (pending) return false;
    setPending(true);
    try {
      const response = await fetch("/api/dashboard/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        user?: DashboardUser;
      };

      if (!response.ok || !data.ok || !data.user) {
        showMessage(data.error || "Benutzer konnte nicht erstellt werden.");
        return false;
      }

      setUsers((prev) => [data.user!, ...prev]);
      showMessage("Benutzer erfolgreich erstellt.");
      return true;
    } catch {
      showMessage("Benutzer konnte nicht erstellt werden.");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function handleEdit(input: CreateDashboardUserInput): Promise<boolean> {
    if (!editUser || pending) return false;
    setPending(true);
    try {
      const response = await fetch(`/api/dashboard/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: input.name,
          role: input.role,
          password: input.password || undefined,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        user?: DashboardUser;
      };

      if (!response.ok || !data.ok || !data.user) {
        showMessage(data.error || "Benutzer konnte nicht aktualisiert werden.");
        return false;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === data.user!.id ? data.user! : u)),
      );
      showMessage("Benutzer aktualisiert.");
      return true;
    } catch {
      showMessage("Benutzer konnte nicht aktualisiert werden.");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function handleToggleActive(user: DashboardUser) {
    if (pending || user.id === currentUserId) return;
    setPending(true);
    try {
      const response = await fetch(`/api/dashboard/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        user?: DashboardUser;
      };

      if (!response.ok || !data.ok || !data.user) {
        showMessage(data.error || "Status konnte nicht geändert werden.");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === data.user!.id ? data.user! : u)),
      );
    } catch {
      showMessage("Status konnte nicht geändert werden.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(user: DashboardUser) {
    if (pending || user.id === currentUserId) return;
    if (!window.confirm(`Benutzer "${user.name}" wirklich löschen?`)) return;

    setPending(true);
    try {
      const response = await fetch(`/api/dashboard/users/${user.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        showMessage(data.error || "Benutzer konnte nicht gelöscht werden.");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showMessage("Benutzer gelöscht.");
    } catch {
      showMessage("Benutzer konnte nicht gelöscht werden.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground/55">{users.length} Benutzer</p>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-dark px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Benutzer erstellen
        </button>
      </div>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.02]">
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Name</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">E-Mail</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Rolle</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Status</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Erstellt</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-black/5">
                  <td className="px-4 py-3 font-medium text-brand-dark">
                    {user.name}
                    {user.id === currentUserId ? (
                      <span className="ml-2 text-xs text-foreground/45">(Sie)</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-black/[0.05] px-2 py-0.5 text-xs font-semibold">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-semibold",
                        user.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800",
                      )}
                    >
                      {user.isActive ? "Aktiv" : "Deaktiviert"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditUser(user)}
                        className="rounded-md border border-black/15 px-2.5 py-1 text-xs font-semibold hover:border-brand-accent/50"
                      >
                        Bearbeiten
                      </button>
                      {user.id !== currentUserId ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(user)}
                            disabled={pending}
                            className="rounded-md border border-black/15 px-2.5 py-1 text-xs font-semibold hover:border-brand-accent/50 disabled:opacity-50"
                          >
                            {user.isActive ? "Deaktivieren" : "Aktivieren"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={pending}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden />
                            Löschen
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        pending={pending}
        onSubmit={handleCreate}
      />

      <CreateUserModal
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        mode="edit"
        submitLabel="Speichern"
        pending={pending}
        initialValues={
          editUser
            ? { name: editUser.name, email: editUser.email, role: editUser.role }
            : undefined
        }
        onSubmit={handleEdit}
      />
    </div>
  );
}
