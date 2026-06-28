import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import CreatePositionForm from "@/components/CreatePositionForm";

const NewPositionPage = async () => {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/");

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
      <div className="flex flex-row justify-between items-start">
        <div className="flex flex-col gap-2">
          <h2>Create New Position</h2>
          <p className="text-light-400">
            Fill in the details — AI will write the interview questions for you.
          </p>
        </div>
        <Button asChild className="btn-secondary">
          <Link href="/admin">← Back</Link>
        </Button>
      </div>

      <CreatePositionForm />
    </div>
  );
};

export default NewPositionPage;
