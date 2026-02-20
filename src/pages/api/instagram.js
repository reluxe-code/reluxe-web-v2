// Instagram Basic Display API — pulls latest posts from @reluxemedspa
// Setup: Add INSTAGRAM_ACCESS_TOKEN to .env.local
// Get a long-lived token from: https://developers.facebook.com/docs/instagram-basic-display-api/getting-started

export default async function handler(req, res) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return res.status(404).json({ error: 'INSTAGRAM_ACCESS_TOKEN not configured' });
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=8&access_token=${token}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API returned ${response.status}`);
    }

    const data = await response.json();

    // Filter to images and carousels (skip videos for grid display)
    const posts = (data.data || [])
      .filter((p) => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM')
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        caption: p.caption,
        media_url: p.media_url,
        permalink: p.permalink,
        timestamp: p.timestamp,
      }));

    // Cache for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ posts });
  } catch (err) {
    console.error('Instagram fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch Instagram posts' });
  }
}
