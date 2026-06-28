"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { deletePosition } from "@/lib/actions/general.action";

const DeletePositionButton = ({ positionId }: { positionId: string }) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const { success } = await deletePosition(positionId);
    if (success) {
      router.push("/admin");
      router.refresh();
    } else {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex flex-row gap-2">
        <Button
          className="btn-primary bg-red-600 hover:bg-red-700"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Confirm Delete"}
        </Button>
        <Button className="btn-secondary" onClick={() => setConfirming(false)} disabled={loading}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button className="btn-secondary border-red-500 text-red-400 hover:bg-red-600 hover:text-white" onClick={() => setConfirming(true)}>
      Delete Position
    </Button>
  );
};

export default DeletePositionButton;
