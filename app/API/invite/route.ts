import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { emails, positionTitle, positionId, level, type } = await request.json();

  if (!emails || emails.length === 0) {
    return Response.json({ success: false, error: "No emails provided" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const jobLink = `${appUrl}/jobs/${positionId}`;

  try {
    const results = await Promise.allSettled(
      emails.map((email: string) =>
        resend.emails.send({
          from: "e&view <onboarding@resend.dev>",
          to: email,
          subject: `You're invited to interview for ${positionTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              </head>
              <body style="margin:0;padding:0;background-color:#08090D;font-family:'Segoe UI',sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#08090D;padding:40px 20px;">
                  <tr>
                    <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                        <!-- Header -->
                        <tr>
                          <td style="background:linear-gradient(to bottom,#171532,#08090D);border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#cac5fe;letter-spacing:-0.5px;">e&view</h1>
                            <p style="margin:8px 0 0;color:#6870a6;font-size:14px;">AI Interview Platform</p>
                          </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                          <td style="background:#1A1C20;padding:40px;">
                            <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#ffffff;">
                              You've been invited! 🎉
                            </h2>
                            <p style="margin:0 0 24px;color:#d6e0ff;font-size:15px;line-height:1.6;">
                              You have been selected to interview for a position on our AI-powered platform. Here are the details:
                            </p>

                            <!-- Position Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#27282f;border-radius:12px;padding:24px;margin-bottom:32px;">
                              <tr>
                                <td>
                                  <p style="margin:0 0 4px;color:#6870a6;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Position</p>
                                  <h3 style="margin:0 0 16px;color:#ffffff;font-size:20px;font-weight:700;">${positionTitle}</h3>
                                  <table cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="padding-right:16px;">
                                        <span style="background:#4f557d;color:#d6e0ff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${level}</span>
                                      </td>
                                      <td>
                                        <span style="background:#4f557d;color:#d6e0ff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${type}</span>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            <p style="margin:0 0 24px;color:#d6e0ff;font-size:15px;line-height:1.6;">
                              Click the button below to view the position and start your AI voice interview when you're ready.
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center">
                                  <a href="${jobLink}"
                                    style="display:inline-block;background:#cac5fe;color:#020408;padding:14px 40px;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none;">
                                    View Position & Start Interview
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="background:#08090D;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
                            <p style="margin:0;color:#4f557d;font-size:12px;">
                              This invitation was sent by e&view. If you weren't expecting this, you can ignore this email.
                            </p>
                          </td>
                        </tr>

                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        })
      )
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    const sent = results.length - failed;

    return Response.json({ success: true, sent, failed }, { status: 200 });
  } catch (error) {
    console.error("Email error:", error);
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
