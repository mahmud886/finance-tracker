import Link from "next/link";

import { AuthForm } from "@/components/forms/auth-form";
import { signInAction } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <AuthForm
      title="Welcome back"
      action={signInAction}
      submitLabel="Sign in"
      fields={[
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
        { name: "password", label: "Password", type: "password", placeholder: "********" },
      ]}
      footer={
        <>
          New here? <Link href="/signup" className="underline">Create account</Link>
        </>
      }
    />
  );
}

