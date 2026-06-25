import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getPositionById,
  getFeedbackByInterviewId,
  getInterviewsByUserId,
} from "@/lib/actions/general.action";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import StartInterviewButton from "@/components/StartInterviewButton";

const JobDetailPage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const position = await getPositionById(id);
  if (!position || !position.isOpen) redirect("/");

  // Check if user already has an interview for this position
  const existingInterviewSnap = await db
    .collection("interviews")
    .where("positionId", "==", id)
    .where("userId", "==", user.id)
    .limit(1)
    .get();

  let existingInterviewId: string | null = null;
  let existingFeedback = null;

  if (!existingInterviewSnap.empty) {
    existingInterviewId = existingInterviewSnap.docs[0].id;
    existingFeedback = await getFeedbackByInterviewId({
      interviewId: existingInterviewId,
      userId: user.id,
    });
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="card-border p-8 flex flex-col gap-4">
        <div className="flex flex-row gap-6 items-start">
          <Image
            src={getRandomInterviewCover()}
            alt="cover"
            width={90}
            height={90}
            className="rounded-full object-cover size-[90px]"
          />
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{position.title}</h1>
            <p className="text-light-400">{position.department} · {position.level}</p>
            <span className="w-fit px-3 py-1 rounded-full text-xs font-semibold bg-light-600">
              {position.type}
            </span>
          </div>
        </div>

        {position.description && (
          <p className="text-light-400">{position.description}</p>
        )}

        <div className="flex flex-row gap-2 items-center">
          <span className="text-sm text-light-400">Tech Stack:</span>
          <DisplayTechIcons techStack={position.techstack} />
        </div>
      </div>

      {/* What to expect */}
      <div className="card-border p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-lg">What to Expect</h2>
        <ul className="flex flex-col gap-2 text-sm text-light-400">
          <li>• {position.questions.length} questions covering {position.type.toLowerCase()} topics</li>
          <li>• AI voice interviewer — speak your answers naturally</li>
          <li>• Detailed feedback report with scores across 5 categories</li>
          <li>• Takes approximately {Math.ceil(position.questions.length * 2.5)} minutes</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="card-border p-6 flex flex-col gap-4 items-center text-center">
        {existingFeedback ? (
          <>
            <p className="text-light-400">You&apos;ve already completed this interview.</p>
            <p className="text-2xl font-bold text-primary-200">Score: {existingFeedback.totalScore}/100</p>
            <Button className="btn-primary">
              <Link href={`/interview/${existingInterviewId}/feedback`}>View Your Report</Link>
            </Button>
          </>
        ) : existingInterviewId ? (
          <>
            <p className="text-light-400">You started this interview but didn&apos;t finish. Continue where you left off.</p>
            <Button className="btn-primary">
              <Link href={`/interview/${existingInterviewId}`}>Continue Interview</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="text-light-400">Ready? The AI interviewer will ask you {position.questions.length} questions.</p>
            <StartInterviewButton
              positionId={id}
              userId={user.id}
              role={position.title}
              level={position.level}
              type={position.type}
              techstack={position.techstack}
              questions={position.questions}
            />
          </>
        )}
      </div>

      <Button className="btn-secondary self-start">
        <Link href="/">← Back to Positions</Link>
      </Button>
    </div>
  );
};

export default JobDetailPage;
