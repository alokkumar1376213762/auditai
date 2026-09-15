import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, targetUrl, subscribeAlerts, isAnonymous } = body;

    const isAnon = Boolean(isAnonymous) || !email || email.includes("anonymous");
    const formattedEmail = email && typeof email === "string" && !isAnon ? email.trim().toLowerCase() : "anonymous-visitor@auditai.com";
    const formattedName = name?.trim() || (isAnon ? "Anonymous Visitor" : "Visitor");
    const auditedUrl = targetUrl?.trim() || "Unspecified URL";

    const leadEntry = {
      id: `lead_${Date.now()}`,
      name: formattedName,
      email: formattedEmail,
      targetUrl: auditedUrl,
      subscribeAlerts: Boolean(subscribeAlerts),
      isAnonymous: isAnon,
      createdAt: new Date().toISOString(),
    };

    // 1. Save lead to local JSON storage
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "leads.json");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let existingLeads: any[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        existingLeads = JSON.parse(fileContent || "[]");
      } catch (err) {
        existingLeads = [];
      }
    }

    existingLeads.unshift(leadEntry);
    fs.writeFileSync(filePath, JSON.stringify(existingLeads, null, 2), "utf-8");

    // 2. Dispatch email notification directly to owner Gmail (alokkumar13762@gmail.com)
    const ownerEmail = process.env.OWNER_GMAIL || "alokkumar13762@gmail.com";
    const gmailUser = process.env.GMAIL_USER || "alokkumar13762@gmail.com";
    const rawPassword = process.env.GMAIL_APP_PASSWORD || "zjwu aagj vttx zinc";
    const cleanPassword = rawPassword.replace(/\s+/g, "");

    let emailSent = false;
    let emailStatus = "saved_locally";

    if (gmailUser && cleanPassword) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: gmailUser,
            pass: cleanPassword,
          },
        });

        const badgeColor = isAnon ? "#62666d" : "#5e6ad2";
        const badgeText = isAnon ? "ANONYMOUS AUDIT SUBMISSION" : "NEW VERIFIED LEAD";
        const headingText = isAnon
          ? `Visitor Audited: ${auditedUrl}`
          : `New Website Audit Request from ${leadEntry.name}!`;

        const mailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0d0e; color: #f7f8f8; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #23252a;">
            <div style="border-bottom: 1px solid #23252a; padding-bottom: 16px; margin-bottom: 20px;">
              <span style="background: ${badgeColor}; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: bold; letter-spacing: 0.05em;">${badgeText}</span>
              <h2 style="color: #ffffff; margin: 10px 0 0 0; font-size: 20px; letter-spacing: -0.02em;">${headingText}</h2>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px 0; color: #8a8f98; width: 140px; border-bottom: 1px solid #1a1b1e;">Visitor Name:</td>
                <td style="padding: 10px 0; color: #ffffff; font-weight: bold; border-bottom: 1px solid #1a1b1e;">${leadEntry.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8a8f98; border-bottom: 1px solid #1a1b1e;">Visitor Email:</td>
                <td style="padding: 10px 0; color: #38bdf8; font-weight: bold; border-bottom: 1px solid #1a1b1e;">
                  ${isAnon ? '<span style="color: #8a8f98;">(Anonymous / Skipped info)</span>' : `<a href="mailto:${leadEntry.email}" style="color: #38bdf8; text-decoration: none;">${leadEntry.email}</a>`}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8a8f98; border-bottom: 1px solid #1a1b1e;">Target Website:</td>
                <td style="padding: 10px 0; color: #5e6ad2; font-weight: bold; border-bottom: 1px solid #1a1b1e;">
                  <a href="${leadEntry.targetUrl.startsWith('http') ? leadEntry.targetUrl : 'https://' + leadEntry.targetUrl}" target="_blank" style="color: #828fff; text-decoration: none;">${leadEntry.targetUrl}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8a8f98; border-bottom: 1px solid #1a1b1e;">Wants Alerts:</td>
                <td style="padding: 10px 0; color: ${leadEntry.subscribeAlerts ? "#27a644" : "#eb5757"}; font-weight: bold; border-bottom: 1px solid #1a1b1e;">
                  ${leadEntry.subscribeAlerts ? "✅ Yes (Subscribed to Website Improvement Alerts)" : "❌ No"}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8a8f98;">Time Received:</td>
                <td style="padding: 10px 0; color: #d0d6e0; font-family: monospace; font-size: 12px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>

            <div style="background: #141516; border: 1px solid #23252a; padding: 14px; border-radius: 8px; font-size: 12px; color: #8a8f98; line-height: 1.5;">
              ${
                !isAnon
                  ? `💡 <strong>Instant Follow-up:</strong> You can reply directly to this email or click <a href="mailto:${leadEntry.email}?subject=Website%20Optimization%20Report%20for%20${encodeURIComponent(leadEntry.targetUrl)}" style="color: #828fff; font-weight: bold;">Reply to ${leadEntry.name}</a> to contact them!`
                  : `🔍 A visitor just ran an audit on <strong>${leadEntry.targetUrl}</strong>.`
              }
            </div>
          </div>
        `;

        const subjectTitle = isAnon
          ? `🔍 [AUDIT RUN] ${leadEntry.targetUrl}`
          : `🚨 [AUDITAI LEAD] ${leadEntry.name} (${leadEntry.targetUrl})`;

        await transporter.sendMail({
          from: `"AuditAI Alerts" <${gmailUser}>`,
          to: ownerEmail,
          replyTo: !isAnon ? leadEntry.email : undefined,
          priority: "high",
          subject: subjectTitle,
          text: `AuditAI Submission Received!\n\nName: ${leadEntry.name}\nEmail: ${leadEntry.email}\nTarget Website: ${leadEntry.targetUrl}\nAlerts Subscribed: ${leadEntry.subscribeAlerts ? "Yes" : "No"}\nTime: ${new Date().toLocaleString()}`,
          html: mailHtml,
        });

        emailSent = true;
        emailStatus = "delivered_to_owner_gmail";
        console.log(`[Email Dispatched] Lead details successfully delivered to ${ownerEmail}`);
      } catch (mailErr: any) {
        console.error("[Email Error] Failed to send email via Gmail SMTP:", mailErr.message);
        emailStatus = `smtp_error: ${mailErr.message}`;
      }
    } else {
      console.log(`[Lead Captured for ${ownerEmail}]: Name: ${leadEntry.name}, Email: ${leadEntry.email}, URL: ${leadEntry.targetUrl}`);
    }

    return NextResponse.json({
      success: true,
      lead: leadEntry,
      emailSent,
      emailStatus,
      ownerRecipient: ownerEmail,
    });
  } catch (err: any) {
    console.error("Failed to process lead:", err);
    return NextResponse.json({ error: "Failed to record lead." }, { status: 500 });
  }
}
