import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, updateProfile } from "@/services/authService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import { formatShortDate } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/profile")({
  head: () => ({
    meta: [
      { title: "My profile — SmartBus" },
      { name: "description", content: "Update your SmartBus contact details and password." },
      { property: "og:title", content: "My profile — SmartBus" },
      { property: "og:description", content: "Manage your name, mobile number and password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user)!;
  const [fullName, setFullName] = useState(user.fullName);
  const [mobile, setMobile] = useState(user.mobile);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Enter a valid 10 digit mobile number.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({ ...user, fullName: fullName.trim(), mobile });
      dispatch(updateUser(updated));
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    try {
      const result = await changePassword(current, next);
      toast.success(result.message);
      setCurrent("");
      setNext("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change your password.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">My profile</h1>

      <form onSubmit={saveProfile} className="surface-card space-y-4 p-5">
        <h2 className="font-bold">Personal details</h2>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} readOnly disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mobile">Mobile number</Label>
          <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
        </div>
        <p className="text-xs text-muted-foreground">
          Member since {formatShortDate(user.createdAt)} • Role {user.role}
        </p>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <form onSubmit={savePassword} className="surface-card space-y-4 p-5">
        <h2 className="font-bold">Change password</h2>
        <div className="space-y-1.5">
          <Label htmlFor="current">Current password</Label>
          <Input
            id="current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="next">New password</Label>
          <Input
            id="next"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="outline">
          Update password
        </Button>
      </form>
    </div>
  );
}
