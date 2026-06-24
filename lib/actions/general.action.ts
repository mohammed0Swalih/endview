"use server";

// TODO: Wire up Firebase Firestore in the next step of the tutorial

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  // Will be implemented with Firebase
  return null;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  // Will be implemented with Firebase
  return null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  // Will be implemented with Firebase
  return null;
}

export async function createFeedback(params: CreateFeedbackParams) {
  // Will be implemented with Firebase
  return { success: false, feedbackId: null };
}
