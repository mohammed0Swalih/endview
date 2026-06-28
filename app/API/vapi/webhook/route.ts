import { db } from "@/firebase/admin";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { feedbackSchema } from "@/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || message.type !== "end-of-call-report") {
      return Response.json({ received: true }, { status: 200 });
    }

    const { call, transcript, messages: callMessages } = message;
    // Vapi puts metadata in assistantOverrides.metadata (and mirrors it in assistant.metadata)
    const metadata =
      call?.assistantOverrides?.metadata ??
      message.assistant?.metadata ??
      call?.metadata ??
      {};
    const { interviewId, userId } = metadata;

    if (!interviewId || !userId) {
      console.log("Webhook: missing interviewId or userId in metadata", metadata);
      return Response.json({ received: true }, { status: 200 });
    }

    // Check if feedback already exists (client-side may have already generated it)
    const existingFeedback = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .limit(1)
      .get();

    if (!existingFeedback.empty) {
      console.log("Webhook: feedback already exists for", interviewId);
      return Response.json({ received: true }, { status: 200 });
    }

    // Build transcript array from Vapi's messages array
    // Note: Vapi uses "bot" for the AI role, not "assistant"
    const transcriptArray: { role: string; content: string }[] = (callMessages ?? [])
      .filter((m: any) => m.role === "user" || m.role === "bot" || m.role === "assistant")
      .map((m: any) => ({
        role: m.role === "bot" ? "assistant" : m.role,
        content: m.message || m.content || "",
      }))
      .filter((m: { role: string; content: string }) => m.content.trim().length > 0);

    // Fall back to raw transcript string if no messages array
    if (transcriptArray.length === 0 && transcript) {
      transcriptArray.push({ role: "assistant", content: transcript });
    }

    if (transcriptArray.length < 2) {
      console.log("Webhook: transcript too short, skipping feedback generation");
      return Response.json({ received: true }, { status: 200 });
    }

    // Generate feedback with Groq
    const formattedTranscript = transcriptArray
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

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

    // Fetch user name
    const userDoc = await db.collection("users").doc(userId).get();
    const userName = userDoc.data()?.name ?? "Unknown";

    // Save feedback to Firestore
    const feedbackRef = await db.collection("feedback").add({
      interviewId,
      userId,
      userName,
      ...feedbackData,
      createdAt: new Date().toISOString(),
      generatedBy: "webhook",
    });

    // Mark interview as finalized
    await db.collection("interviews").doc(interviewId).update({
      finalized: true,
    });

    console.log("Webhook: feedback saved", feedbackRef.id, "for interview", interviewId);
    return Response.json({ received: true, feedbackId: feedbackRef.id }, { status: 200 });

  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ received: true }, { status: 200 }); // always 200 to Vapi
  }
}
