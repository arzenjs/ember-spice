"use client";
import { useActionState } from "react";
import { inviteStaffAction } from "@/app/admin/staff/actions";
import Alert from "@/components/ui/Alert";
import { TextField } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";

export default function InviteStaffForm() {
  const [state, formAction] = useActionState(inviteStaffAction, null);
  return (
    <form action={formAction} className="space-y-4" key={state?.ok && !state.warning ? "sent" : "form"}>
      {state && <Alert variant={!state.ok ? "error" : state.warning ? "warning" : "success"}>{state.message}</Alert>}
      <TextField label="Staff email address" name="email" type="email" required autoComplete="off" maxLength={254}
        hint="They will receive a single-use link to set a password. New accounts are created with the Staff role." />
      <SubmitButton pendingLabel="Sending…">Invite staff</SubmitButton>
    </form>
  );
}
