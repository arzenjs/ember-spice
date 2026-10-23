"use client";
import { useFormStatus } from "react-dom";
import { buttonStyles } from "./Button";
import { cn } from "@/lib/utils";

// Submit button that disables itself while the surrounding form's server action is running.
export default function SubmitButton({ children, pendingLabel = "Working…", variant = "primary", className, disabled, ...props }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={cn(buttonStyles(variant), "disabled:cursor-not-allowed disabled:opacity-60", className)}
      {...props}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
