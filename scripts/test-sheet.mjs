const webhookUrl = "https://script.google.com/macros/s/AKfycbyFjknqPXWMl6_g1tVrIDFEmKONvFEDdi4LIXJ73LQ2GD9flnBsk0Fc1CMRNN6YPpBL/exec";

async function testSheet() {
  console.log("Testing Google Sheet webhook submission...");
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        name: "Test User (Antigravity)",
        phone: "+91 98765 43210",
        email: "sivaastudio2010@gmail.com",
        category1: "Wedding Shoot",
        category2: "Candid photos",
        message: "This is a test submission from Sivaa Studio contact connection test.",
      }),
      redirect: "follow",
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response from Google Apps Script:", text);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testSheet();
