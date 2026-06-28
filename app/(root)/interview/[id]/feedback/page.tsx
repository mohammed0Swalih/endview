import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewById,
  getFeedbackByInterviewId,
  getFeedbackByInterviewIdAdmin,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  // Admin can view any candidate's feedback; candidate sees only their own
  const feedback = user?.isAdmin
    ? await getFeedbackByInterviewIdAdmin(id)
    : await getFeedbackByInterviewId({ interviewId: id, userId: user?.id! });

  if (!feedback) redirect(`/interview/${id}`);

  const isAdmin = user?.isAdmin;

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on the{" "}
          <span className="text-primary-200 capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5">
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Score:{" "}
              <span className="text-primary-200 font-bold">{feedback.totalScore}/100</span>
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>{dayjs(feedback.createdAt).format("MMM D, YYYY")}</p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback.finalAssessment}</p>

      {/* Category Scores */}
      <div className="flex flex-col gap-4">
        <h2>Breakdown of the Interview:</h2>
        {feedback.categoryScores?.map((category, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <p className="font-bold capitalize">{category.name}</p>
              <p>{category.score}/100</p>
            </div>
            <div className="w-full bg-dark-300 rounded-full h-2">
              <div
                className="bg-primary-200 h-2 rounded-full"
                style={{ width: `${category.score}%` }}
              />
            </div>
            <p className="text-sm text-light-400">{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h2>Strengths:</h2>
        <ul className="list-disc list-inside">
          {feedback.strengths?.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h2>Areas for Improvement:</h2>
        <ul className="list-disc list-inside">
          {feedback.areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-row gap-4 justify-center">
        {isAdmin ? (
          <Button className="btn-secondary flex-1">
            <Link href={`/admin/positions/${interview.positionId ?? ""}`} className="flex w-full justify-center">
              ← Back to Candidates
            </Link>
          </Button>
        ) : (
          <>
            <Button className="btn-secondary flex-1">
              <Link href="/" className="flex w-full justify-center">
                Back to Dashboard
              </Link>
            </Button>
            <Button className="btn-primary flex-1">
              <Link href={`/interview/${id}`} className="flex w-full justify-center">
                Retake Interview
              </Link>
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default Page;
