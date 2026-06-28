import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
import { cn } from "@/lib/utils";

interface PositionCardProps {
  position: Position;
  isAdmin?: boolean;
}

const PositionCard = ({ position, isAdmin = false }: PositionCardProps) => {
  const { id, title, department, level, type, techstack, createdAt, isOpen, logoUrl } = position;
  const logo = logoUrl || "/robot.png";

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(createdAt).format("MMM D, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div className={cn("absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg", badgeColor)}>
            <p className="badge-text">{normalizedType}</p>
          </div>

          {/* Status dot for admin */}
          {isAdmin && (
            <div className={cn(
              "absolute top-0 left-0 w-fit px-3 py-2 rounded-br-lg text-xs font-semibold",
              isOpen ? "bg-green-600 text-white" : "bg-gray-500 text-white"
            )}>
              {isOpen ? "Open" : "Closed"}
            </div>
          )}

          {/* Logo */}
          <Image
            src={logo}
            alt="company logo"
            width={90}
            height={90}
            className="rounded-full object-cover size-[90px]"
          />

          {/* Title */}
          <h3 className="mt-5 capitalize">{title}</h3>

          {/* Dept + Date */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2 items-center">
              <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
              <p>{formattedDate}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <p className="text-light-400 text-sm">{level}</p>
            </div>
          </div>

          {/* Department */}
          <p className="mt-2 text-sm text-light-400">{department}</p>
        </div>

        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />

          {isAdmin ? (
            <Button className="btn-primary">
              <Link href={`/admin/positions/${id}`}>View Candidates</Link>
            </Button>
          ) : (
            <Button className="btn-primary">
              <Link href={`/jobs/${id}`}>Apply Now</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionCard;
