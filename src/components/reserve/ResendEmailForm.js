"use client";
import { useActionState } from "react";
import { resendConfirmationEmailAction } from "@/app/reserve/confirmation/[token]/actions";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";

export default function ResendEmailForm({ token }) {
  const [state, formAction] = useActionState(resendConfirmationEmailAction, null);
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      {state && <Alert variant={state.ok ? "success" : "error"}>{state.message}</Alert>}
      <SubmitButton variant="secondary" pendingLabel="Sending…">Resend confirmation email</SubmitButton>
    </form>
  );
}
