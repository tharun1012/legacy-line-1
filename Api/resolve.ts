import fetch from "node-fetch";

export default async function handler(req: any, res: any) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' query parameter" });
  }

  try {
    // Follow redirects to get the final URL
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status(200).json({ finalUrl: response.url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
