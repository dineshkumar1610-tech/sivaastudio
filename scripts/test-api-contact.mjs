async function testContactApi() {
  console.log("Testing POST to http://localhost:3000/api/contact...");
  const startTime = Date.now();
  try {
    const res = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Sivaa Studio VIP Client",
        phone: "+91 73309 15802",
        email: "sivaastudio2010@gmail.com",
        category1: "Wedding Shoot",
        category2: "Drone, Candid photos, Traditional video",
        message: "Testing 5-second transfer speed and Google Sheet webhook integration.",
      }),
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const data = await res.json();
    console.log(`Response received in ${duration}s! Status:`, res.status, data);
  } catch (err) {
    console.error("Test error:", err.message);
  }
}

testContactApi();
