import Link from "next/link";

import { AuthForm } from "@/components/forms/auth-form";
import { signUpAction } from "@/lib/actions/auth";

export default function SignUpPage() {
  return (
    <AuthForm
      title="Create account"
      action={signUpAction}
      submitLabel="Sign up"
      fields={[
        { name: "name", label: "Full name", type: "text", placeholder: "Snigdho" },
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
        { name: "password", label: "Password", type: "password", placeholder: "********" },
      ]}
      footer={
        <>
          Already have an account? <Link href="/login" className="underline">Sign in</Link>
        </>
      }
    />
  );
}

