const webhookUrl = "https://script.google.com/macros/s/AKfycbyFjknqPXWMl6_g1tVrIDFEmKONvFEDdi4LIXJ73LQ2GD9flnBsk0Fc1CMRNN6YPpBL/exec";

async function testFetchModes() {
  console.log("1. Testing GET request...");
  try {
    const resGet = await fetch(webhookUrl, { redirect: "follow" });
    console.log("GET Status:", resGet.status);
    const text = await resGet.text();
    console.log("GET Response preview:", text.slice(0, 150));
  } catch (e) {
    console.log("GET error:", e.message);
  }

  console.log("\n2. Testing POST JSON...");
  try {
    const resPost = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ name: "Test User", phone: "1234567890" }),
      redirect: "follow",
    });
    console.log("POST Status:", resPost.status);
    const text = await resPost.text();
    console.log("POST Response preview:", text.slice(0, 150));
  } catch (e) {
    console.log("POST error:", e.message);
  }
}

testFetchModes();
