import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getPositionById,
  getCandidatesByPosition,
  togglePositionStatus,
} from "@/lib/actions/general.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import TogglePositionButton from "@/components/TogglePositionButton";

const AdminPositionPage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/");

  const position = await getPositionById(id);
  if (!position) redirect("/admin");

  const candidates = await getCandidatesByPosition(id);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-row justify-between items-start">
        <div>
          <div className="flex flex-row gap-3 items-center">
            <h1 className="text-3xl font-bold">{position.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                position.isOpen
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-white"
              }`}
            >
              {position.isOpen ? "Open" : "Closed"}
            </span>
          </div>
          <p className="text-light-400 mt-1">
            {position.department} · {position.level} · {position.type}
          </p>
          {position.description && (
            <p className="text-sm mt-2 max-w-xl">{position.description}</p>
          )}
          <div className="mt-3">
            <DisplayTechIcons techStack={position.techstack} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <TogglePositionButton
            positionId={id}
            isOpen={position.isOpen}
          />
          <Button className="btn-secondary">
            <Link href="/admin">← Back</Link>
          </Button>
        </div>
      </div>

      {/* Interview Questions */}
      <div className="card-border p-6">
        <h2 className="font-semibold text-lg mb-3">Interview Questions ({position.questions.length})</h2>
        <ol className="flex flex-col gap-2">
          {position.questions.map((q, i) => (
            <li key={i} className="text-sm text-light-400">
              <span className="text-white font-medium">{i + 1}. </span>{q}
            </li>
          ))}
        </ol>
      </div>

      {/* Candidates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Candidates ({candidates.length})
        </h2>

        {candidates.length === 0 ? (
          <div className="card-border p-8 text-center">
            <p className="text-light-400">No candidates have completed this interview yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.interviewId}
                className="card-border p-5 flex flex-row justify-between items-center"
              >
                <div className="flex flex-row gap-4 items-center">
                  <span className="text-light-400 text-sm w-6">#{index + 1}</span>
                  <div>
                    <p className="font-semibold">{candidate.userName}</p>
                    <p className="text-light-400 text-sm">
                      {dayjs(candidate.createdAt).format("MMM D, YYYY")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row gap-6 items-center">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-200">
                      {candidate.totalScore}
                      <span className="text-light-400 text-sm font-normal">/100</span>
                    </p>
                    <p className="text-light-400 text-xs">Score</p>
                  </div>
                  <Button className="btn-primary">
                    <Link href={`/interview/${candidate.interviewId}/feedback`}>
                      View Report
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPositionPage;
