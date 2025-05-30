export default async function handler(req, res) {
  // ENV-Variablen auslesen
  const UMAMI_API_KEY = process.env.UMAMI_API_KEY;
  const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;

  const startAt = 0;
  const endAt = Math.floor(Date.now() / 1000);

  // Umami API abfragen
  const statsRes = await fetch(`https://cloud.umami.is/api/websites/${WEBSITE_ID}/stats?start_at=${startAt}&end_at=${endAt}`, {
    headers: { 'Authorization': `Bearer ${UMAMI_API_KEY}` }
  });
  const statsData = await statsRes.json();

  const eventsRes = await fetch(`https://cloud.umami.is/api/websites/${WEBSITE_ID}/events?start_at=${startAt}&end_at=${endAt}`, {
    headers: { 'Authorization': `Bearer ${UMAMI_API_KEY}` }
  });
  const eventsData = await eventsRes.json();

  // PDF Download Events zählen
  let pdfDownloads = 0;
  if (eventsData && eventsData.data) {
    const pdfEvent = eventsData.data.find(e => e.event_name === "PDF Download");
    pdfDownloads = pdfEvent ? pdfEvent.total : 0;
  }

  // CORS erlauben
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    pageviews: statsData.pageviews.value,
    pdfDownloads: pdfDownloads
  });
}
