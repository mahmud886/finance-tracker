import { signOutAction } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline" size="sm" className="gap-2">
        <LogOut size={14} />
        <span>Sign out</span>
      </Button>
    </form>
  );
}

