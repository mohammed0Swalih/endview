interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  positionId?: string;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
  isAdmin?: boolean;
}

interface Position {
  id: string;
  title: string;
  description: string;
  department: string;
  level: string;
  type: string;
  techstack: string[];
  questions: string[];
  isOpen: boolean;
  createdAt: string;
  logoUrl?: string;
  visibility: "public" | "invite";
  invitedEmails: string[];
}

interface CreatePositionParams {
  title: string;
  description: string;
  department: string;
  level: string;
  type: string;
  techstack: string[];
  questions: string[];
  logoUrl?: string;
  visibility: "public" | "invite";
  invitedEmails: string[];
}

interface GetCandidatesByPositionParams {
  positionId: string;
}

interface CandidateResult {
  interviewId: string;
  userId: string;
  userName: string;
  totalScore: number;
  createdAt: string;
  feedbackId: string;
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
  role?: string;
  level?: string;
  interviewType?: string;
  techstack?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}
