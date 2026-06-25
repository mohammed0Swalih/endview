import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import CreatePositionForm from "@/components/CreatePositionForm";

const NewPositionPage = async () => {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/");

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Create New Position</h1>
        <p className="text-light-400 mt-1">
          Fill in the details and AI will generate interview questions for candidates.
        </p>
      </div>
      <CreatePositionForm />
    </div>
  );
};

export default NewPositionPage;
