"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { createInterviewForPosition } from "@/lib/actions/general.action";

interface Props {
  positionId: string;
  userId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  questions: string[];
}

const StartInterviewButton = ({ positionId, userId, role, level, type, techstack, questions }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const { success, interviewId } = await createInterviewForPosition({
        positionId,
        userId,
        role,
        level,
        type,
        techstack,
        questions,
      });

      if (success && interviewId) {
        router.push(`/interview/${interviewId}`);
      } else {
        toast.error("Failed to start interview. Try again.");
        setLoading(false);
      }
    } catch {
      toast.error("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <Button className="btn-primary px-8 py-3 text-lg" onClick={handleStart} disabled={loading}>
      {loading ? "Setting up interview..." : "Start Interview"}
    </Button>
  );
};

export default StartInterviewButton;
