import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import PositionCard from "@/components/PositionCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getPositions,
} from "@/lib/actions/general.action";

const Page = async () => {
  const user = await getCurrentUser();

  // Redirect admin to their dashboard
  if (user?.isAdmin) redirect("/admin");

  const [userInterviews, openPositions] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getPositions(),
  ]);

  // Interviews tied to real positions (company interviews)
  const companyInterviews = userInterviews?.filter((i) => i.positionId) ?? [];
  // Mock practice interviews (no positionId)
  const mockInterviews = userInterviews?.filter((i) => !i.positionId) ?? [];

  return (
    <>
      {/* Hero */}
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>AI-Powered Interview Platform</h2>
          <p className="text-lg">
            Browse open positions and complete your AI voice interview — get instant feedback and scores.
          </p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="#positions">View Open Positions</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="Robot"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      {/* Open Positions — main feature */}
      <section id="positions" className="flex flex-col gap-6 mt-8">
        <h2>Open Positions</h2>
        <div className="interviews-section">
          {openPositions.length > 0 ? (
            openPositions.map((position) => (
              <PositionCard key={position.id} position={position} />
            ))
          ) : (
            <p className="text-light-400">No open positions at the moment. Check back soon.</p>
          )}
        </div>
      </section>

      {/* My Company Interviews */}
      {companyInterviews.length > 0 && (
        <section className="flex flex-col gap-6 mt-8">
          <h2>My Interviews</h2>
          <div className="interviews-section">
            {companyInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={user?.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mock Practice — secondary feature */}
      <section className="flex flex-col gap-6 mt-8 border-t border-dark-300 pt-8">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h2>Mock Practice</h2>
            <p className="text-light-400 text-sm mt-1">
              Practice with AI on any role before your real interview.
            </p>
          </div>
          <Button asChild className="btn-secondary">
            <Link href="/interview">Start Mock Interview</Link>
          </Button>
        </div>

        {mockInterviews.length > 0 ? (
          <div className="interviews-section">
            {mockInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={user?.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))}
          </div>
        ) : (
          <p className="text-light-400 text-sm">No mock interviews yet.</p>
        )}
      </section>
    </>
  );
};

export default Page;
