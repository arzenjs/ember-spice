import { securityConfig } from "@/config/security";
import { listInvitations } from "@/server/invitations";
import { listStaffAccounts } from "@/server/staff";
import { requireUser } from "@/server/session";
import InviteStaffForm from "@/components/admin/InviteStaffForm";
import ManageButton from "@/components/admin/ManageButton";
import InternalShell from "@/components/staff/InternalShell";
import StatusBadge from "@/components/ui/StatusBadge";

export const metadata = { title: "Admin · Staff", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmt = (d) => (d ? new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Never");
const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-sand";
const td = "px-4 py-3 align-top";

export default async function AdminStaffPage() {
  const user = await requireUser(["admin"]);
  const [staff, invitations] = await Promise.all([listStaffAccounts(), listInvitations()]);

  return (
    <InternalShell user={user}>
      <h1 className="font-display text-3xl sm:text-4xl">Staff &amp; invitations</h1>

      <section aria-labelledby="invite" className="mt-10 max-w-xl rounded-xl bg-ember-charcoal p-6 sm:p-8">
        <h2 id="invite" className="font-display text-2xl">Invite staff</h2>
        <p className="mb-5 mt-2 text-sm text-sand">Invitations expire after {securityConfig.invitationValidHours} hours and can be used once.</p>
        <InviteStaffForm />
      </section>

      <section aria-labelledby="accounts" className="mt-12">
        <h2 id="accounts" className="font-display text-2xl">Accounts</h2>
        <div className="mt-4 overflow-x-auto rounded-xl bg-ember-charcoal">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="border-b border-ivory/10"><tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Role</th><th className={th}>Status</th><th className={th}>Last sign-in</th><th className={th}><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-ivory/5 last:border-0">
                  <td className={td}>{s.name}</td>
                  <td className={`${td} break-all`}>{s.email}</td>
                  <td className={`${td} capitalize`}>{s.role}</td>
                  <td className={td}><StatusBadge status={s.status} /></td>
                  <td className={td}>{fmt(s.lastLoginAt)}</td>
                  <td className={td}>
                    {s.role === "staff" && (s.status === "active"
                      ? <ManageButton id={s.id} intent="deactivate" label="Deactivate" confirm={`Deactivate ${s.name}? They will lose access immediately.`} />
                      : <ManageButton id={s.id} intent="reactivate" label="Reactivate" />)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="invitations" className="mt-12">
        <h2 id="invitations" className="font-display text-2xl">Invitations</h2>
        {invitations.length === 0 ? (
          <p className="mt-4 rounded-xl bg-ember-charcoal px-6 py-8 text-center text-sand">No invitations yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl bg-ember-charcoal">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="border-b border-ivory/10"><tr><th className={th}>Email</th><th className={th}>Status</th><th className={th}>Expires</th><th className={th}>Invited by</th><th className={th}><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {invitations.map((i) => (
                  <tr key={i.id} className="border-b border-ivory/5 last:border-0">
                    <td className={`${td} break-all`}>{i.email}{i.emailStatus === "failed" && i.status === "pending" && <span className="ml-2 text-xs text-red-300">(email not sent)</span>}</td>
                    <td className={td}><StatusBadge status={i.status} /></td>
                    <td className={td}>{fmt(i.expiresAt)}</td>
                    <td className={td}>{i.invitedBy}</td>
                    <td className={td}>
                      {(i.status === "pending" || i.status === "expired") && (
                        <div className="flex flex-wrap gap-2">
                          <ManageButton id={i.id} intent="resend" label={i.status === "expired" ? "Send new link" : "Resend"} />
                          <ManageButton id={i.id} intent="revoke" label="Revoke" confirm="Revoke this invitation?" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </InternalShell>
  );
}
