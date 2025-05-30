export default async function handler(req, res) {
  try {
    const UMAMI_API_KEY = process.env.UMAMI_API_KEY;
    const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;

    if (!UMAMI_API_KEY || !WEBSITE_ID) {
      return res.status(500).json({ error: "Missing API key or Website ID" });
    }

    const startAt = 0;
    const endAt = Math.floor(Date.now() / 1000);

    const statsRes = await fetch(`https://cloud.umami.is/api/websites/${WEBSITE_ID}/stats?start_at=${startAt}&end_at=${endAt}`, {
      headers: { 'Authorization': `Bearer ${UMAMI_API_KEY}` }
    });
    const statsText = await statsRes.text();

    // Gebe die rohe API-Antwort zurück, damit wir sie sehen!
    return res.status(200).json({ statsText });

  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
