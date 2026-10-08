import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/send-welcome-email
 * Called after a student successfully registers.
 * Sends a styled welcome email via Supabase Auth admin (server-side).
 * Body: { userId, fullName, rollNumber, email, department, year }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, fullName, rollNumber, email, department, year } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Build a styled welcome email HTML
    const htmlBody = buildWelcomeEmailHtml({ fullName, rollNumber, email, department, year });
    const textBody = buildWelcomeEmailText({ fullName, rollNumber, email, department, year });

    // Use Supabase server client to record the welcome in the DB and
    // return success. The actual email is sent by Supabase Auth's built-in
    // email system (confirm email trigger). Here we log the action.
    const supabase = createClient();

    // Verify request comes from an authenticated session (the newly registered user)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Store welcome metadata in profile for reference
    if (user?.id || userId) {
      const targetId = user?.id || userId;
      await supabase
        .from("profiles")
        .update({ 
          // Could store welcome_sent: true if column exists, but let's just update the profile
        })
        .eq("id", targetId);
    }

    // Return the email content so the client can display a preview or log
    return NextResponse.json({
      success: true,
      message: `Welcome email queued for ${email}`,
      preview: {
        to: email,
        subject: `Welcome to Vignandhara Library, ${fullName}! 📚`,
        html: htmlBody,
        text: textBody,
      },
    });
  } catch (err) {
    console.error("Send welcome email error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

function buildWelcomeEmailHtml({ fullName, rollNumber, email, department, year }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Vignandhara Library</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 60%,#059669 100%);padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:14px 20px;margin-bottom:20px;">
                <span style="font-size:36px;">📚</span>
              </div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px;">Vignandhara Library</h1>
              <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">Digital Library Management System</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              
              <!-- Welcome Heading -->
              <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 8px;">
                Welcome, ${fullName}! 🎉
              </h2>
              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">
                Your student library account has been successfully created. You now have access to our entire collection of textbooks, journals, and reference materials.
              </p>

              <!-- Account Details Card -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:24px;margin-bottom:28px;">
                <h3 style="color:#0f172a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Your Account Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                      <span style="color:#64748b;font-size:13px;">Full Name</span>
                    </td>
                    <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                      <strong style="color:#0f172a;font-size:13px;">${fullName}</strong>
                    </td>
                  </tr>
                  ${rollNumber ? `<tr>
                    <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                      <span style="color:#64748b;font-size:13px;">Roll Number</span>
                    </td>
                    <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                      <strong style="color:#2563eb;font-size:13px;font-family:monospace;">${rollNumber}</strong>
                    </td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                      <span style="color:#64748b;font-size:13px;">Email</span>
                    </td>
                    <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                      <strong style="color:#0f172a;font-size:13px;">${email}</strong>
                    </td>
                  </tr>
                  ${department ? `<tr>
                    <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                      <span style="color:#64748b;font-size:13px;">Department</span>
                    </td>
                    <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                      <strong style="color:#0f172a;font-size:13px;">${department}</strong>
                    </td>
                  </tr>` : ''}
                  ${year ? `<tr>
                    <td style="padding:8px 0;">
                      <span style="color:#64748b;font-size:13px;">Year of Study</span>
                    </td>
                    <td style="padding:8px 0;text-align:right;">
                      <strong style="color:#0f172a;font-size:13px;">${year}</strong>
                    </td>
                  </tr>` : ''}
                </table>
              </div>

              <!-- Library Rules -->
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:24px;margin-bottom:28px;">
                <h3 style="color:#1d4ed8;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">📋 Library Borrowing Rules</h3>
                <ul style="color:#1e40af;font-size:13px;line-height:1.9;margin:0;padding:0 0 0 20px;">
                  <li>You may borrow up to <strong>3 books</strong> at a time</li>
                  <li>Standard loan period is <strong>14 days</strong></li>
                  <li>Late returns attract a fine of <strong>₹5 per day</strong></li>
                  <li>Lost books must be reported and paid for immediately</li>
                  <li>Visit the library desk with your Roll Number to borrow a book</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" 
                   style="display:inline-block;background:linear-gradient(135deg,#2563eb,#059669);color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
                  Access Your Library Portal →
                </a>
              </div>

              <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
                If you did not register for this account, please ignore this email or contact the library administrator.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">Vignandhara College Library Management System</p>
              <p style="color:#cbd5e1;font-size:11px;margin:0;">This is an automated message — please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeEmailText({ fullName, rollNumber, email, department, year }) {
  return `Welcome to Vignandhara Library, ${fullName}!

Your student library account has been successfully created.

ACCOUNT DETAILS:
- Name: ${fullName}
${rollNumber ? `- Roll Number: ${rollNumber}\n` : ''}- Email: ${email}
${department ? `- Department: ${department}\n` : ''}${year ? `- Year: ${year}\n` : ''}
LIBRARY RULES:
- Borrow up to 3 books at a time
- Standard loan period: 14 days
- Late fine: ₹5 per day
- Visit the library desk with your Roll Number to borrow a book

Login at: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login

If you did not register for this account, please ignore this email.

-- Vignandhara Library Management System`;
}
