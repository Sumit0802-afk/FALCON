import { FormEvent, useEffect, useState } from "react";
import AccountShell, { FIELD, LABEL, Notice, PRIMARY_BUTTON, Panel } from "@/components/AccountShell";
import { Avatar } from "@/components/UserMenu";
import { ApiError } from "@/services/api";
import { AuthUser, changePassword, updateProfile } from "@/services/authService";

type Status = { kind: "ok" | "error"; text: string } | null;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

function errorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return "Too many attempts. Please wait a few minutes and try again.";
    if (err.status === 401) return "Your session has ended. Please sign in again.";
    if (err.status === 400) return err.message.replace(/^[a-zA-Z.0-9]+: /, "");
    return fallback;
  }
  return "We couldn't reach Falcon. Check your connection and try again.";
}

function ProfileForm({ user, onSaved }: { user: AuthUser | null; onSaved: (user: AuthUser) => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => { if (user) setName(user.name); }, [user]);

  const trimmed = name.trim();
  const unchanged = !user || trimmed === user.name;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return setStatus({ kind: "error", text: "Please enter your name." });
    setSaving(true);
    setStatus(null);
    try {
      onSaved(await updateProfile(trimmed));
      setStatus({ kind: "ok", text: "Your profile has been updated." });
    } catch (err) {
      setStatus({ kind: "error", text: errorText(err, "We couldn't save your profile. Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar user={user} size={56} />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-medium text-white">{user?.name || "Loading…"}</div>
          <div className="truncate text-[12.5px] text-zinc-500">{user?.email}</div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="account-name" className={LABEL}>Full name</label>
          <input id="account-name" type="text" value={name} maxLength={100} disabled={!user} onChange={(e) => setName(e.target.value)} className={FIELD} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="account-email" className={LABEL}>Email</label>
          <input id="account-email" type="email" value={user?.email || ""} disabled readOnly className={FIELD} />
        </div>
      </div>
      <p className="text-[12px] text-zinc-500">Your email is used to sign in and receive verification codes, so it can't be changed here.</p>
      <div className="grid gap-3 text-[12.5px] sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] p-3"><div className="text-zinc-600">Member since</div><div className="mt-0.5 text-zinc-300">{formatDate(user?.createdAt ?? null)}</div></div>
        <div className="rounded-xl border border-white/[0.06] p-3"><div className="text-zinc-600">Last sign-in</div><div className="mt-0.5 text-zinc-300">{formatDate(user?.lastLogin ?? null)}</div></div>
        <div className="rounded-xl border border-white/[0.06] p-3"><div className="text-zinc-600">Email status</div><div className="mt-0.5 text-zinc-300">{user ? (user.isVerified ? "Verified" : "Not verified") : "—"}</div></div>
      </div>
      {status && <Notice kind={status.kind}>{status.text}</Notice>}
      <button type="submit" disabled={saving || unchanged} className={PRIMARY_BUTTON}>{saving ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!current || !next || !confirm) return setStatus({ kind: "error", text: "Please fill in all three fields." });
    if (next.length < 8 || !/[A-Z]/.test(next) || !/[0-9]/.test(next)) {
      return setStatus({ kind: "error", text: "Your new password needs at least 8 characters, one uppercase letter and one number." });
    }
    if (next !== confirm) return setStatus({ kind: "error", text: "The new passwords do not match." });
    setSaving(true);
    setStatus(null);
    try {
      await changePassword(current, next, confirm);
      setCurrent(""); setNext(""); setConfirm("");
      setStatus({ kind: "ok", text: "Your password has been changed. Other devices have been signed out." });
    } catch (err) {
      const wrong = err instanceof ApiError && err.code === "WRONG_PASSWORD";
      setStatus({ kind: "error", text: wrong ? "Your current password is incorrect." : errorText(err, "We couldn't change your password. Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="max-w-sm">
        <label htmlFor="pw-current" className={LABEL}>Current password</label>
        <input id="pw-current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={FIELD} autoComplete="current-password" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="pw-new" className={LABEL}>New password</label>
          <input id="pw-new" type="password" value={next} onChange={(e) => setNext(e.target.value)} className={FIELD} autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="pw-confirm" className={LABEL}>Confirm new password</label>
          <input id="pw-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={FIELD} autoComplete="new-password" />
        </div>
      </div>
      {status && <Notice kind={status.kind}>{status.text}</Notice>}
      <button type="submit" disabled={saving} className={PRIMARY_BUTTON}>{saving ? "Changing…" : "Change password"}</button>
    </form>
  );
}

export default function AccountPage() {
  return (
    <AccountShell title="My account" description="Your profile and sign-in details.">
      {({ user, setUser }) => (
        <>
          <Panel title="Profile">
            <ProfileForm user={user} onSaved={setUser} />
          </Panel>
          <Panel title="Password" hint="At least 8 characters, with one uppercase letter and one number. Changing it signs out your other devices.">
            <PasswordForm />
          </Panel>
        </>
      )}
    </AccountShell>
  );
}
