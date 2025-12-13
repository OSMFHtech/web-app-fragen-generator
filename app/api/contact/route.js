import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    // Create a transporter using Gmail SMTP
    // NOTE: For Gmail, you need to:
    // 1. Enable 2-factor authentication
    // 2. Generate an App Password at: https://myaccount.google.com/apppasswords
    // 3. Use that App Password in EMAIL_PASS (not your regular password)
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email to your address
    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`, // Use your email as sender
      to: "wi22b047@technikum-wien.at",
      replyTo: email, // User's email for replies
      subject: `QuestionForge Contact: ${subject}`,
      text: `From: ${name} (${email})\n\nSubject: ${subject}\n\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    console.log("Email sent successfully to wi22b047@technikum-wien.at");

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send message. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
