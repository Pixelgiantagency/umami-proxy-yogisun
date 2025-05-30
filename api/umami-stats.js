export default async function handler(req, res) {
  try {
    const UMAMI_API_KEY = process.env.UMAMI_API_KEY;
    const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;

    if (!UMAMI_API_KEY || !WEBSITE_ID) {
      return res.status(500).json({ error: "Missing API key or Website ID" });
    }

    const startAt = 0;
    const endAt = Math.floor(Date.now() / 1000);

    // Pageviews
    const statsRes = await fetch(`https://cloud.umami.is/api/websites/${WEBSITE_ID}/stats?start_at=${startAt}&end_at=${endAt}`, {
      headers: { 'Authorization': `Bearer ${UMAMI_API_KEY}` }
    });
    const statsText = await statsRes.text(); // Nur für Debugging
    let statsData;
    try {
      statsData = JSON.parse(statsText);
    } catch {
      statsData = null;
    }

    // Debug-Log der API-Antwort
    console.log("Umami statsRes status:", statsRes.status);
    console.log("Umami statsData:", statsData);

    if (!statsRes.ok || !statsData || !statsData.pageviews || typeof statsData.pageviews.value !== "number") {
      return res.status(500).json({ error: "Stats API did not return pageviews", apiResponse: statsData });
    }

    // Events (PDF Downloads)
    const eventsRes = await fetch(`https://cloud.umami.is/api/websites/${WEBSITE_ID}/events?start_at=${startAt}&end_at=${endAt}`, {
      headers: { 'Authorization': `Bearer ${UMAMI_API_KEY}` }
    });
    const eventsText = await eventsRes.text();
    let eventsData;
    try {
      eventsData = JSON.parse(eventsText);
    } catch {
      eventsData = null;
    }
    console.log("Umami eventsRes status:", eventsRes.status);
    console.log("Umami eventsData:", eventsData);

    // PDF Download Events zählen
    let pdfDownloads = 0;
    if (eventsData && eventsData.data) {
      const pdfEvent = eventsData.data.find(e => e.event_name === "PDF Download");
      pdfDownloads = pdfEvent ? pdfEvent.total : 0;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      pageviews: statsData.pageviews.value,
      pdfDownloads: pdfDownloads
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}

