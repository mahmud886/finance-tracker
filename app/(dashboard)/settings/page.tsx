import { Topbar } from "@/components/layout/topbar";
import { Card, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/forms/profile-form";
import { getProfile } from "@/lib/data";

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <>
      <Topbar title="Settings" />
      <div className="p-4 md:p-6">
        <Card className="max-w-xl">
          <CardTitle>User Profile</CardTitle>
          <div className="mt-4">
            <ProfileForm profile={profile} />
          </div>
        </Card>
      </div>
    </>
  );
}

