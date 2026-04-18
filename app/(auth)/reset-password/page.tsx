import Link from "next/link";

import { AuthForm } from "@/components/forms/auth-form";
import { resetPasswordAction } from "@/lib/actions/auth";

export default function ResetPasswordPage() {
  return (
    <AuthForm
      title="Reset password"
      action={resetPasswordAction}
      submitLabel="Update password"
      fields={[
        { name: "password", label: "New password", type: "password", placeholder: "********" },
        {
          name: "confirmPassword",
          label: "Confirm password",
          type: "password",
          placeholder: "********",
        },
      ]}
      footer={
        <>
          Back to <Link href="/login" className="underline">Sign in</Link>
        </>
      }
    />
  );
}

