import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { report, recipientEmail } = body;

    if (!report || !report.url) {
      return NextResponse.json({ error: "Missing audit report data." }, { status: 400 });
    }

    const ownerEmail = process.env.OWNER_GMAIL || "alokkumar13762@gmail.com";
    const targetRecipient = (recipientEmail && typeof recipientEmail === "string" && recipientEmail.includes("@"))
      ? recipientEmail.trim()
      : ownerEmail;

    const gmailUser = process.env.GMAIL_USER || "alokkumar13762@gmail.com";
    const rawPassword = process.env.GMAIL_APP_PASSWORD || "zjwu aagj vttx zinc";
    const cleanPassword = rawPassword.replace(/\s+/g, "");

    if (!gmailUser || !cleanPassword) {
      return NextResponse.json(
        { error: "Gmail SMTP credentials not configured." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: cleanPassword,
      },
    });

    const pillars = report.pillars || [];
    const pillarRows = pillars
      .map(
        (p: any) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #23252a; color: #f7f8f8; font-weight: 500;">${p.name || p.title}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #23252a; color: #5e6ad2; font-weight: bold; font-family: monospace;">${p.score}/100</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #23252a; color: #8a8f98; font-size: 12px;">${p.summary || p.status || ""}</td>
        </tr>
      `
      )
      .join("");

    const actionItems = (report.actionItems || []).slice(0, 5);
    const actionList = actionItems
      .map(
        (a: any, i: number) => `
        <li style="margin-bottom: 10px; color: #d0d6e0; font-size: 13px;">
          <strong style="color: #f7f8f8;">#${i + 1} ${a.title || a.action}:</strong> ${a.description || a.impact || ""}
          <span style="display: inline-block; background: #23252a; color: #828fff; font-size: 10px; font-family: monospace; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Priority: ${a.priority || "High"}</span>
        </li>
      `
      )
      .join("");

    const mailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0d0e; color: #f7f8f8; padding: 24px; border-radius: 12px; max-width: 640px; margin: 0 auto; border: 1px solid #23252a;">
        <div style="border-bottom: 1px solid #23252a; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="background: #5e6ad2; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: bold; letter-spacing: 0.05em;">AUDITAI COMPREHENSIVE REPORT</span>
          <h2 style="color: #ffffff; margin: 10px 0 4px 0; font-size: 22px; letter-spacing: -0.02em;">Website Audit: ${report.url}</h2>
          <div style="color: #8a8f98; font-size: 12px;">Generated at: ${new Date().toLocaleString()}</div>
        </div>

        <!-- Overall Score Card -->
        <div style="background: #141516; border: 1px solid #23252a; border-radius: 8px; padding: 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 12px; font-mono; color: #8a8f98; text-transform: uppercase;">Overall Health Score</div>
            <div style="font-size: 36px; font-weight: 800; color: #5e6ad2; font-family: monospace; line-height: 1.1;">
              ${report.overallScore ?? report.score ?? "N/A"}<span style="font-size: 18px; color: #62666d;">/100</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="display: inline-block; background: #27a644; color: #ffffff; font-weight: bold; padding: 6px 14px; border-radius: 20px; font-size: 14px;">
              Grade ${report.grade || "A"}
            </div>
          </div>
        </div>

        <!-- Executive Summary -->
        ${
          report.summary
            ? `<div style="margin-bottom: 20px; padding: 14px; background: #111213; border-left: 3px solid #5e6ad2; border-radius: 4px; font-size: 13px; color: #d0d6e0; line-height: 1.6;">
                ${report.summary}
              </div>`
            : ""
        }

        <!-- 7-Pillar Scores Table -->
        <h3 style="color: #f7f8f8; font-size: 15px; margin-bottom: 10px; border-bottom: 1px solid #23252a; padding-bottom: 6px;">7-Pillar Performance Scores</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; background: #111213; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background: #18191a; text-align: left; color: #8a8f98; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 8px 12px;">Pillar</th>
              <th style="padding: 8px 12px;">Score</th>
              <th style="padding: 8px 12px;">Assessment</th>
            </tr>
          </thead>
          <tbody>
            ${pillarRows}
          </tbody>
        </table>

        <!-- Top Priority Action Items -->
        ${
          actionList
            ? `<h3 style="color: #f7f8f8; font-size: 15px; margin-bottom: 10px; border-bottom: 1px solid #23252a; padding-bottom: 6px;">Top Priority Fixes</h3>
               <ul style="padding-left: 18px; margin-bottom: 24px;">
                 ${actionList}
               </ul>`
            : ""
        }

        <div style="background: #141516; border: 1px solid #23252a; padding: 12px; border-radius: 6px; font-size: 11px; color: #8a8f98; text-align: center;">
          Sent directly from AuditAI Engine to <strong style="color: #f7f8f8;">${targetRecipient}</strong>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"AuditAI Reports" <${gmailUser}>`,
      to: targetRecipient,
      priority: "high",
      subject: `📊 [AUDITAI REPORT] ${report.url} — Score ${report.overallScore ?? report.score}/100 (Grade ${report.grade || "A"})`,
      text: `Audit Report for ${report.url}\nOverall Score: ${report.overallScore ?? report.score}/100\nGrade: ${report.grade || "A"}\n\nGenerated by AuditAI.`,
      html: mailHtml,
    });

    return NextResponse.json({
      success: true,
      deliveredTo: targetRecipient,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Report Email Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to dispatch report to Gmail." },
      { status: 500 }
    );
  }
}
