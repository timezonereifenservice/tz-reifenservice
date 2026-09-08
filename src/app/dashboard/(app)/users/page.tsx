import { UsersPanel } from "@/components/dashboard/users-panel";
import { requireNavAccess } from "@/lib/dashboard-require-nav";
import { listUsers } from "@/lib/dashboard-users/storage";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await requireNavAccess("users");
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Verwaltung
        </p>
        <h2 className="mt-1 text-xl font-extrabold text-brand-dark sm:text-2xl">
          Benutzer
        </h2>
        <p className="mt-1 text-sm text-foreground/55">
          Dashboard-Konten erstellen und verwalten. Nur für Admins.
        </p>
      </div>

      <UsersPanel initialUsers={users} currentUserId={user.id} />
    </div>
  );
}
