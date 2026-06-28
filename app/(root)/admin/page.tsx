import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import PositionCard from "@/components/PositionCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getAllPositions } from "@/lib/actions/general.action";

const AdminPage = async () => {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/");

  const positions = await getAllPositions();
  const openCount = positions.filter((p) => p.isOpen).length;
  const closedCount = positions.length - openCount;

  return (
    <>
      {/* Hero — same style as main page card-cta */}
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Recruiter Dashboard</h2>
          <p className="text-lg">Create positions, review candidates and track interview scores — all in one place.</p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/admin/positions/new">+ Create New Position</Link>
          </Button>
        </div>
        <Image src="/robot.png" alt="Robot" width={400} height={400} className="max-sm:hidden" />
      </section>

      {/* Stats */}
      <section className="flex flex-row gap-4 flex-wrap mt-8">
        <div className="card-border">
          <div className="dark-gradient rounded-2xl px-8 py-6 flex flex-col gap-1 min-w-[160px]">
            <p className="text-4xl font-bold text-primary-200">{positions.length}</p>
            <p className="text-light-400">Total Positions</p>
          </div>
        </div>
        <div className="card-border">
          <div className="dark-gradient rounded-2xl px-8 py-6 flex flex-col gap-1 min-w-[160px]">
            <p className="text-4xl font-bold text-success-100">{openCount}</p>
            <p className="text-light-400">Open</p>
          </div>
        </div>
        <div className="card-border">
          <div className="dark-gradient rounded-2xl px-8 py-6 flex flex-col gap-1 min-w-[160px]">
            <p className="text-4xl font-bold text-light-600">{closedCount}</p>
            <p className="text-light-400">Closed</p>
          </div>
        </div>
      </section>

      {/* Positions */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>All Positions</h2>
        <div className="interviews-section">
          {positions.length > 0 ? (
            positions.map((position) => (
              <PositionCard key={position.id} position={position} isAdmin />
            ))
          ) : (
            <div className="card-border w-full">
              <div className="dark-gradient rounded-2xl p-12 flex flex-col items-center gap-6">
                <Image src="/robot.png" alt="empty" width={120} height={120} className="opacity-40" />
                <p className="text-light-400 text-center">No positions yet. Create your first one to get started.</p>
                <Button asChild className="btn-primary">
                  <Link href="/admin/positions/new">Create Position</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AdminPage;
