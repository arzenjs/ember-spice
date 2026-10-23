"use client";
import { useActionState } from "react";
import { acceptInvitationAction } from "@/app/staff/auth-actions";
import Alert from "@/components/ui/Alert";
import { TextField } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";

export default function AcceptInvitationForm({ token, email, minPasswordLength }) {
  const [state, formAction] = useActionState(acceptInvitationAction, null);
  const errors = state?.errors ?? {};

  if (state?.invalid) {
    return (
      <Alert variant="error">
        This invitation is no longer valid. Please ask the restaurant owner to send you a new one.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state?.message && <Alert variant="error">{state.message}</Alert>}
      <input type="hidden" name="token" value={token} />
      <TextField label="Email address" name="invitedEmail" type="email" value={email} readOnly
        hint="This is the address your invitation was sent to." />
      <TextField label="Your full name" name="name" autoComplete="name" required maxLength={80}
        defaultValue={state?.name ?? ""} error={errors.name} />
      <TextField label="Choose a password" name="password" type="password" autoComplete="new-password" required
        minLength={minPasswordLength} error={errors.password} hint={`At least ${minPasswordLength} characters.`} />
      <TextField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" required
        error={errors.confirmPassword} />
      <SubmitButton pendingLabel="Activating…" className="w-full">Activate account</SubmitButton>
    </form>
  );
}
