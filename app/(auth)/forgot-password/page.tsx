import Link from "next/link";

import { AuthForm } from "@/components/forms/auth-form";
import { forgotPasswordAction } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthForm
      title="Forgot password"
      action={forgotPasswordAction}
      submitLabel="Send reset link"
      fields={[{ name: "email", label: "Email", type: "email", placeholder: "you@example.com" }]}
      footer={
        <>
          Remembered your password? <Link href="/login" className="underline">Go to login</Link>
        </>
      }
    />
  );
}

