"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { togglePositionStatus } from "@/lib/actions/general.action";

interface Props {
  positionId: string;
  isOpen: boolean;
}

const TogglePositionButton = ({ positionId, isOpen }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await togglePositionStatus(positionId, !isOpen);
      toast.success(isOpen ? "Position closed." : "Position opened.");
      router.refresh();
    } catch {
      toast.error("Failed to update position.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className={isOpen ? "btn-secondary" : "btn-primary"}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? "Updating..." : isOpen ? "Close Position" : "Reopen Position"}
    </Button>
  );
};

export default TogglePositionButton;
