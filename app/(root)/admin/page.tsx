import Link from "next/link";
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
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <p className="text-light-400 mt-1">Manage job positions and review candidates</p>
        </div>
        <Button className="btn-primary">
          <Link href="/admin/positions/new">+ New Position</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="flex flex-row gap-4 flex-wrap">
        <div className="card-border px-6 py-4 min-w-[140px]">
          <p className="text-3xl font-bold text-primary-200">{positions.length}</p>
          <p className="text-light-400 text-sm mt-1">Total Positions</p>
        </div>
        <div className="card-border px-6 py-4 min-w-[140px]">
          <p className="text-3xl font-bold text-green-400">{openCount}</p>
          <p className="text-light-400 text-sm mt-1">Open</p>
        </div>
        <div className="card-border px-6 py-4 min-w-[140px]">
          <p className="text-3xl font-bold text-light-400">{closedCount}</p>
          <p className="text-light-400 text-sm mt-1">Closed</p>
        </div>
      </div>

      {/* Positions Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Positions</h2>
        {positions.length > 0 ? (
          <div className="interviews-section">
            {positions.map((position) => (
              <PositionCard key={position.id} position={position} isAdmin />
            ))}
          </div>
        ) : (
          <div className="card-border p-8 text-center">
            <p className="text-light-400">No positions yet.</p>
            <Button className="btn-primary mt-4">
              <Link href="/admin/positions/new">Create your first position</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
