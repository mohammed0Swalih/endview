import { db } from "@/firebase/admin";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { feedbackSchema } from "@/constants";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    console.log("Webhook received type:", message?.type);

    if (!message || message.type !== "end-of-call-report") {
      return Response.json({ received: true }, { status: 200 });
    }

    const { call, transcript, messages: callMessages } = message;

    const metadata =
      call?.assistantOverrides?.metadata ??
      message.assistant?.metadata ??
      call?.metadata ??
      {};

    const { interviewId, userId } = metadata;

    console.log("Webhook metadata:", JSON.stringify(metadata));
    console.log("interviewId:", interviewId, "userId:", userId);

    if (!interviewId || !userId) {
      console.log("Webhook: missing interviewId or userId — skipping");
      return Response.json({ received: true }, { status: 200 });
    }

    const existingFeedback = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .limit(1)
      .get();

    if (!existingFeedback.empty) {
      console.log("Webhook: feedback already exists for", interviewId);
      return Response.json({ received: true }, { status: 200 });
    }

    const transcriptArray: { role: string; content: string }[] = (callMessages ?? [])
      .filter((m: any) => m.role === "user" || m.role === "bot" || m.role === "assistant")
      .map((m: any) => ({
        role: m.role === "bot" ? "assistant" : m.role,
        content: m.message || m.content || "",
      }))
      .filter((m: { role: string; content: string }) => m.content.trim().length > 0);

    if (transcriptArray.length === 0 && transcript) {
      transcriptArray.push({ role: "assistant", content: transcript });
    }

    console.log("Webhook: transcript length:", transcriptArray.length);

    if (transcriptArray.length < 2) {
      console.log("Webhook: transcript too short, skipping");
      return Response.json({ received: true }, { status: 200 });
    }

    const formattedTranscript = transcriptArray
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    console.log("Webhook: calling Groq...");

    const { object: feedbackData } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: feedbackSchema,
      prompt: `
        You are an expert interviewer. Analyze this interview transcript and provide structured feedback.

        Transcript:
        ${formattedTranscript}

        Evaluate the candidate across all categories and provide scores, strengths, areas for improvement, and a final assessment.
      `,
    });

    console.log("Webhook: Groq done, saving to Firestore...");

    const userDoc = await db.collection("users").doc(userId).get();
    const userName = userDoc.data()?.name ?? "Unknown";

    const feedbackRef = await db.collection("feedback").add({
      interviewId,
      userId,
      userName,
      ...feedbackData,
      createdAt: new Date().toISOString(),
      generatedBy: "webhook",
    });

    await db.collection("interviews").doc(interviewId).update({
      finalized: true,
    });

    console.log("Webhook: feedback saved!", feedbackRef.id);
    return Response.json({ received: true, feedbackId: feedbackRef.id }, { status: 200 });

  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ received: true }, { status: 200 });
  }
}
