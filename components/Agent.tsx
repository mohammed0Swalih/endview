"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer, generateAssistant } from "@/constants";
import { cn } from "@/lib/utils";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({ userName, userId, type, interviewId, questions, role, level, interviewType, techstack }: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const messagesRef = useRef<SavedMessage[]>([]);
  const feedbackTriggered = useRef(false);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {//stroing messages in state for feedback generation
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => {
          const updated = [...prev, newMessage];
          messagesRef.current = updated;
          return updated;
        });
      }

      // Handle function tool call for generate flow
      if (message.type === "tool-calls" || message.type === "function-call") {
        const toolCall = message.toolCallList?.[0] || message.functionCall; //toolcall containes the function request and parameters
        if (toolCall) {
          const name = toolCall.function?.name || toolCall.name;
          if (name === "generateInterview") {
            const args = //gets the args vapi sent.. that is role, type, techstack....
              typeof toolCall.function?.arguments === "string"
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.function?.arguments || toolCall.parameters || {};

            fetch("/API/vapi/generate", { //sending the args to the backend for generating interview questions
              method: "POST", //sending the data to the backend for generating interview questions
              headers: { "Content-Type": "application/json" }, // The data I'm sending is JSON.
              body: JSON.stringify({ ...args, userid: userId }), //till now the userid wasnt there in the args.. so now this line adds userid to args 
            });
          }
        }
      }
    };
    const onError = (error: any) => {
      // Call is over — set FINISHED so UI cleans up
      // Don't force feedback generation here; the server webhook handles it reliably
      console.error("Vapi error:", JSON.stringify(error));
      setCallStatus(CallStatus.FINISHED);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);

    return () => { //cleaning up the event listeners when the component unmounts
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId: undefined,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED && !feedbackTriggered.current) {
      feedbackTriggered.current = true;
      if (type === "generate") {
        router.push("/");
      } else {
        // Wait 2s for any final transcripts to finish arriving before generating feedback
        setTimeout(() => {
          const finalMessages = messagesRef.current;
          if (finalMessages.length >= 2) {
            handleGenerateFeedback(finalMessages);
          } else {
            // Too little transcript — webhook will handle it server-side
            router.push("/");
          }
        }, 2000);
      }
    }
  }, [callStatus, messages]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(generateAssistant);
    } else {
      const hasQuestions = questions && questions.length > 0;
      await vapi.start(interviewer, {
        variableValues: {
          questions: hasQuestions
            ? questions!.join("\n")
            : `Generate 8 relevant interview questions for a ${level ?? ""} ${role ?? "Software Engineer"} position. Focus on ${interviewType ?? "Mixed"} topics. Tech stack: ${techstack?.join(", ") ?? "general"}. Ask them one by one naturally.`,
        },
        metadata: {
          interviewId: interviewId ?? "",
          userId: userId ?? "",
        },
      });
    }
  };

  const handleDisconnect = () => {
    vapi.stop();
    setCallStatus(CallStatus.FINISHED);
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {lastMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
            <span className="relative">
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
