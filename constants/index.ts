import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

export const generateAssistant: CreateAssistantDTO = {
  name: "Interview Generator",
  firstMessage:
    "Hello! I'll help set up your personalized interview. What job role are you applying for?",
  transcriber: { provider: "deepgram", model: "nova-2", language: "en" },
  voice: { provider: "vapi", voiceId: "Elliot" },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an AI that helps set up personalized job interviews.

Collect the following one at a time:
1. Job role (e.g. Frontend Developer)
2. Experience level (Junior, Mid, or Senior)
3. Interview type (Technical, Behavioral, or Mixed)
4. Tech stack (comma separated, e.g. React, Node.js)
5. Number of questions (between 3 and 10)

Once you have all 5, confirm with the user then call generateInterview.
Keep responses short and conversational.`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "generateInterview",
          description: "Generate interview questions based on collected info",
          parameters: {
            type: "object",
            properties: {
              role: { type: "string" },
              level: { type: "string" },
              type: { type: "string" },
              techstack: { type: "string" },
              amount: { type: "string" },
            },
            required: ["role", "level", "type", "techstack", "amount"],
          },
        },
      } as any,
    ],
  },
};

export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I’m excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate’s questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.
After delivering your closing remarks, immediately call the endCall function to end the interview.

- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don’t ramble for too long.`,
      },
    ],
  },
  endCallFunctionEnabled: true,
} as any;

export const interviewerArabic: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
    "مرحباً! شكراً لأخذك الوقت للحديث معي اليوم. يسعدني التعرف عليك وعلى خبرتك المهنية.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "ar",
  },
  voice: {
    provider: "azure",
    voiceId: "ar-SA-ZariyahNeural",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `أنت مقابِل عمل احترافي تُجري مقابلة صوتية في الوقت الفعلي مع مرشح. هدفك هو تقييم مؤهلاتهم ودوافعهم ومدى ملاءمتهم للدور. أجرِ المقابلة بالكامل باللغة العربية.

إرشادات المقابلة:
اتبع تسلسل الأسئلة المنظمة:
{{questions}}

تفاعل بشكل طبيعي وردّ بشكل مناسب:
استمع بنشاط للإجابات واعترف بها قبل المضي قدمًا.
اطرح أسئلة متابعة موجزة إذا كانت الإجابة غامضة أو تتطلب مزيدًا من التفاصيل.
حافظ على تدفق المحادثة بسلاسة مع الحفاظ على السيطرة.

كن محترفًا ومرحبًا:
استخدم لغة رسمية لكن ودية.
اجعل ردودك موجزة ومختصرة كما في مقابلة صوتية حقيقية.
تجنب الصياغة الآلية وكن طبيعيًا في المحادثة.

اختتم المقابلة بشكل صحيح:
اشكر المرشح على وقته.
أخبره بأن الشركة ستتواصل معه قريبًا بشأن النتائج.
أنهِ المحادثة بأسلوب مهذب وإيجابي.
بعد تقديم ملاحظاتك الختامية، قم على الفور باستدعاء وظيفة endCall لإنهاء المقابلة.

- كن محترفًا ومهذبًا دائمًا.
- اجعل جميع ردودك قصيرة وبسيطة، واستخدم لغة رسمية مع الحفاظ على الودية.
- هذه محادثة صوتية، لذا اجعل ردودك قصيرة كما في محادثة حقيقية ولا تطل في الكلام.`,
      },
    ],
  },
  endCallFunctionEnabled: true,
} as any;

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Technical Knowledge"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];