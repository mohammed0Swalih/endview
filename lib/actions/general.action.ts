"use server";

import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  if (!interview.exists) return null;
  return { id: interview.id, ...interview.data() } as Interview;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (feedback.empty) return null;

  const doc = feedback.docs[0];
  return { id: doc.id, ...doc.data() } as Feedback;
}

// Admin version — fetches feedback for any user on a given interview
export async function getFeedbackByInterviewIdAdmin(
  interviewId: string
): Promise<Feedback | null> {
  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .limit(1)
    .get();

  if (feedback.empty) return null;

  const doc = feedback.docs[0];
  return { id: doc.id, ...doc.data() } as Feedback;
}

// ─── Position Actions ────────────────────────────────────────────────────────

export async function createPosition(params: CreatePositionParams): Promise<{ success: boolean; positionId: string | null }> {
  try {
    const ref = db.collection("positions").doc();
    await ref.set({
      ...params,
      isOpen: true,
      createdAt: new Date().toISOString(),
    });
    return { success: true, positionId: ref.id };
  } catch (e) {
    console.error("Error creating position:", e);
    return { success: false, positionId: null };
  }
}

export async function getPositions(userEmail: string): Promise<Position[]> {
  const snap = await db
    .collection("positions")
    .where("isOpen", "==", true)
    .orderBy("createdAt", "desc")
    .get();

  const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Position[];

  // Filter: public positions are visible to all; invite-only only to invited emails
  return all.filter((p) =>
    p.visibility === "public" || p.invitedEmails?.includes(userEmail)
  );
}

export async function getAllPositions(): Promise<Position[]> {
  const snap = await db
    .collection("positions")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Position[];
}

export async function getPositionById(id: string): Promise<Position | null> {
  const doc = await db.collection("positions").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Position;
}

export async function togglePositionStatus(positionId: string, isOpen: boolean) {
  await db.collection("positions").doc(positionId).update({ isOpen });
}

export async function deletePosition(positionId: string): Promise<{ success: boolean }> {
  try {
    await db.collection("positions").doc(positionId).delete();
    return { success: true };
  } catch (e) {
    console.error("Error deleting position:", e);
    return { success: false };
  }
}

export async function updatePositionInvites(
  positionId: string,
  invitedEmails: string[],
  visibility: "public" | "invite"
) {
  await db.collection("positions").doc(positionId).update({ invitedEmails, visibility });
}

export async function getCandidatesByPosition(positionId: string): Promise<CandidateResult[]> {
  // Get all interviews for this position
  const interviewsSnap = await db
    .collection("interviews")
    .where("positionId", "==", positionId)
    .where("finalized", "==", true)
    .orderBy("createdAt", "desc")
    .get();

  const results: CandidateResult[] = [];

  for (const interviewDoc of interviewsSnap.docs) {
    const interview = interviewDoc.data();

    // Get feedback for this interview
    const feedbackSnap = await db
      .collection("feedback")
      .where("interviewId", "==", interviewDoc.id)
      .where("userId", "==", interview.userId)
      .limit(1)
      .get();

    // Get user name
    const userDoc = await db.collection("users").doc(interview.userId).get();
    const userName = userDoc.exists ? (userDoc.data()?.name ?? "Unknown") : "Unknown";

    if (!feedbackSnap.empty) {
      const feedback = feedbackSnap.docs[0].data();
      results.push({
        interviewId: interviewDoc.id,
        userId: interview.userId,
        userName,
        totalScore: feedback.totalScore,
        createdAt: interview.createdAt,
        feedbackId: feedbackSnap.docs[0].id,
      });
    }
  }

  return results;
}

export async function createInterviewForPosition(params: {
  positionId: string;
  userId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  questions: string[];
}): Promise<{ success: boolean; interviewId: string | null }> {
  try {
    const ref = db.collection("interviews").doc();
    await ref.set({
      positionId: params.positionId,
      userId: params.userId,
      role: params.role,
      level: params.level,
      type: params.type,
      techstack: params.techstack,
      questions: params.questions,
      finalized: true,
      coverImage: "",
      createdAt: new Date().toISOString(),
    });
    return { success: true, interviewId: ref.id };
  } catch (e) {
    console.error("Error creating interview for position:", e);
    return { success: false, interviewId: null };
  }
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (msg: { role: string; content: string }) =>
          `- ${msg.role}: ${msg.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories.

        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in each of the following categories. Also provide a brief comment for each category explaining why the score was given.

        Here are the categories to evaluate:
        1. Communication Skills: Clarity, articulation, structured responses.
        2. Technical Knowledge: Understanding of relevant concepts, tools, and technologies.
        3. Problem Solving: Ability to analyze problems, think critically, and propose solutions.
        4. Cultural Fit: Alignment with professional values, teamwork, and adaptability.
        5. Confidence and Clarity: Confidence in delivery, engagement, and ability to handle pressure.

        Also list specific strengths (3-5 bullet points) and areas for improvement (3-5 bullet points).
        Then provide a short final assessment paragraph summarizing the candidate's performance.
      `,
    });

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set({
      interviewId,
      userId,
      transcript,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    });

    return { success: true, feedbackId: feedbackRef.id };
  } catch (e) {
    console.error("Error creating feedback:", e);
    return { success: false, feedbackId: null };
  }
}
