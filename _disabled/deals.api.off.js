// src/pages/api/deals.js
import { getDealsSSR } from '@/lib/deals';

export default async function handler(req, res) {
  try {
    const force = req.method === 'POST' && req.body?.force;
    const data = await getDealsSSR({ force: !!force });
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=240');
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e?.message || 'error' });
  }
}
