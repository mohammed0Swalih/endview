import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(request: Request) {
  const { title, level, type, techstack, amount = 8 } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Generate interview questions for a job position.
        Job title: ${title}
        Experience level: ${level}
        Interview focus: ${type} (Technical, Behavioral, or Mixed)
        Tech stack: ${techstack}
        Number of questions: ${amount}

        Return ONLY a JSON array of question strings. No extra text, no numbering, no markdown.
        The questions will be read aloud by a voice AI — avoid special characters like /, *, #, or bullet points.

        Example format:
        ["Question one", "Question two", "Question three"]
      `,
    });

    const parsed = JSON.parse(questions);
    return Response.json({ success: true, questions: parsed }, { status: 200 });
  } catch (error) {
    console.error("Error generating questions:", error);
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
