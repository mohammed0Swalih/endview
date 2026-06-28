import { redirect } from "next/navigation";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById, getFeedbackByInterviewId } from "@/lib/actions/general.action";

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  if (feedback) redirect(`/interview/${id}/feedback`);

  return (
    <>
      <h3 className="text-2xl font-semibold">
        {interview.role} Interview
      </h3>
      <Agent
        userName={user?.name!}
        userId={user?.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        role={interview.role}
        level={interview.level}
        interviewType={interview.type}
        techstack={interview.techstack}
      />
    </>
  );
};

export default Page;
