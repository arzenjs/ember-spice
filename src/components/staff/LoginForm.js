"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/staff/auth-actions";
import Alert from "@/components/ui/Alert";
import { TextField } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";

export default function LoginForm({ defaultEmail = "", next = "" }) {
  const [state, formAction] = useActionState(loginAction, null);
  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <Alert variant="error">{state.error}</Alert>}
      <input type="hidden" name="next" value={next} />
      <TextField label="Email address" name="email" type="email" autoComplete="username" required
        defaultValue={state?.email ?? defaultEmail} />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required />
      <SubmitButton pendingLabel="Signing in…" className="w-full">Sign In</SubmitButton>
    </form>
  );
}
