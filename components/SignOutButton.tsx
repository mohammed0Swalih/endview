"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/lib/actions/auth.action";

const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out.");
    router.push("/sign-in");
  };

  return (
    <button
      onClick={handleSignOut}
      className="btn-secondary !px-4 !min-h-9 text-sm"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
