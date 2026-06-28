import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getPositionById, getCandidatesByPosition } from "@/lib/actions/general.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import TogglePositionButton from "@/components/TogglePositionButton";
import ManageInvites from "@/components/ManageInvites";

const AdminPositionPage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/");

  const position = await getPositionById(id);
  if (!position) redirect("/admin");

  const candidates = await getCandidatesByPosition(id);

  const avgScore = candidates.length
    ? Math.round(candidates.reduce((sum, c) => sum + c.totalScore, 0) / candidates.length)
    : null;

  return (
    <section className="flex flex-col gap-8">

      {/* Header card — same card-cta feel */}
      <div className="card-cta">
        <div className="flex flex-col gap-4 max-w-lg">
          <div className="flex flex-row gap-3 items-center">
            <h2>{position.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              position.isOpen ? "bg-success-100/20 text-success-100" : "bg-light-800 text-light-400"
            }`}>
              {position.isOpen ? "● Open" : "● Closed"}
            </span>
          </div>
          <p className="text-light-400">{position.department} · {position.level} · {position.type}</p>
          {position.description && <p>{position.description}</p>}
          <DisplayTechIcons techStack={position.techstack} />
          <div className="flex flex-row gap-3">
            <TogglePositionButton positionId={id} isOpen={position.isOpen} />
            <Button asChild className="btn-secondary">
              <Link href="/admin">← Back</Link>
            </Button>
          </div>
        </div>
        <Image src="/robot.png" alt="robot" width={300} height={300} className="max-sm:hidden opacity-80" />
      </div>

      {/* Stats row */}
      <div className="flex flex-row gap-4 flex-wrap">
        <div className="card-border">
          <div className="dark-gradient rounded-2xl px-8 py-6 flex flex-col gap-1 min-w-[160px]">
            <p className="text-4xl font-bold text-primary-200">{candidates.length}</p>
            <p className="text-light-400">Candidates</p>
          </div>
        </div>
        <div className="card-border">
          <div className="dark-gradient rounded-2xl px-8 py-6 flex flex-col gap-1 min-w-[160px]">
            <p className="text-4xl font-bold text-primary-200">{avgScore ?? "—"}</p>
            <p className="text-light-400">Avg Score</p>
          </div>
        </div>
        <div className="card-border">
          <div className="dark-gradient rounded-2xl px-8 py-6 flex flex-col gap-1 min-w-[160px]">
            <p className="text-4xl font-bold text-primary-200">{position.questions.length}</p>
            <p className="text-light-400">Questions</p>
          </div>
        </div>
      </div>

      {/* Visibility / Invites */}
      <ManageInvites
        positionId={id}
        positionTitle={position.title}
        positionLevel={position.level}
        positionType={position.type}
        initialVisibility={position.visibility ?? "public"}
        initialEmails={position.invitedEmails ?? []}
      />

      {/* Questions */}
      <div className="card-border w-full">
        <div className="dark-gradient rounded-2xl p-6 flex flex-col gap-4">
          <h3>Interview Questions</h3>
          {position.questions.length === 0 ? (
            <p className="text-light-400">AI will generate questions on the fly during each interview.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {position.questions.map((q, i) => (
                <li key={i} className="flex flex-row gap-3 text-sm">
                  <span className="text-primary-200 font-bold min-w-[20px]">{i + 1}.</span>
                  <span className="text-light-100">{q}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Candidates */}
      <div className="flex flex-col gap-4">
        <h2>Candidates ({candidates.length})</h2>

        {candidates.length === 0 ? (
          <div className="card-border w-full">
            <div className="dark-gradient rounded-2xl p-12 flex flex-col items-center gap-4">
              <Image src="/robot.png" alt="empty" width={100} height={100} className="opacity-30" />
              <p className="text-light-400">No candidates have completed this interview yet.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {candidates
              .sort((a, b) => b.totalScore - a.totalScore)
              .map((candidate, index) => (
                <div key={candidate.interviewId} className="card-border w-full">
                  <div className="dark-gradient rounded-2xl p-5 flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-5 items-center">
                      {/* Rank */}
                      <span className={`text-lg font-bold min-w-[32px] ${
                        index === 0 ? "text-yellow-400" :
                        index === 1 ? "text-light-100" :
                        index === 2 ? "text-orange-400" :
                        "text-light-400"
                      }`}>
                        #{index + 1}
                      </span>

                      {/* Avatar placeholder */}
                      <div className="blue-gradient rounded-full size-10 flex items-center justify-center text-dark-100 font-bold text-sm">
                        {candidate.userName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-white">{candidate.userName}</p>
                        <p className="text-light-400 text-sm flex flex-row gap-1 items-center">
                          <Image src="/calendar.svg" width={14} height={14} alt="date" />
                          {dayjs(candidate.createdAt).format("MMM D, YYYY")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row gap-8 items-center">
                      {/* Score bar */}
                      <div className="flex flex-col gap-1 items-end max-sm:hidden">
                        <div className="w-32 bg-dark-300 rounded-full h-2">
                          <div
                            className="bg-primary-200 h-2 rounded-full"
                            style={{ width: `${candidate.totalScore}%` }}
                          />
                        </div>
                        <p className="text-xs text-light-400">{candidate.totalScore}/100</p>
                      </div>

                      {/* Score badge */}
                      <div className="flex flex-row gap-2 items-center">
                        <Image src="/star.svg" width={20} height={20} alt="score" />
                        <p className="text-2xl font-bold text-primary-200">{candidate.totalScore}</p>
                      </div>

                      <Button asChild className="btn-primary">
                        <Link href={`/interview/${candidate.interviewId}/feedback`}>
                          View Report
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPositionPage;
