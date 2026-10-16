import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Fire-and-forget: sends to Google Sheet in background, never blocks the user response
function sendToGoogleSheet(webhookUrl: string, payload: Record<string, string>) {
  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  })
    .then((res) => {
      if (!res.ok) console.warn("Google Sheet returned status:", res.status);
      else console.log("Google Sheet: row added successfully");
    })
    .catch((err) => console.warn("Google Sheet background post failed:", err?.message));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, category1, category2, message } = body;

    if (!name || (!email && !phone)) {
      return NextResponse.json(
        { error: "Name and at least one contact method (phone or email) are required." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

    // 1. Fire-and-forget to Google Sheet — does NOT block the response
    if (webhookUrl) {
      // In Google Sheets, a leading '+' is parsed as an arithmetic formula which results in #ERROR!
      // Prefixing with a single quote (') forces Google Sheets to treat it as plain text.
      const sheetPhone = phone ? (phone.startsWith("'") ? phone : `'${phone}`) : "";

      sendToGoogleSheet(webhookUrl, {
        name: name || "",
        phone: sheetPhone,
        email: email || "",
        category1: category1 || "",
        category2: category2 || "",
        message: message || "",
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
    }

    // 2. Optionally store in Supabase inquiries table if exists
    try {
      await supabase.from("inquiries").insert([
        {
          name,
          email,
          phone,
          category1,
          category2,
          message,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // Ignored if table does not exist
    }

    // Respond immediately — no waiting for Google Sheet
    return NextResponse.json({ success: true, message: "Inquiry submitted successfully!" });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your message." },
      { status: 500 }
    );
  }
}
