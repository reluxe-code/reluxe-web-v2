import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path') || '';

  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  const normalizedPath = decodeURIComponent(path)
    .replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/(?:public|sign)\/form-captures\//, '')
    .replace(/\?.*$/, '');

  const { data: signed, error: signError } = await supabase.storage
    .from('form-captures')
    .createSignedUrl(normalizedPath, 120);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json(
      {
        error: signError?.message || 'Failed to create signed URL',
        path: normalizedPath,
      },
      { status: 404 }
    );
  }

  return NextResponse.redirect(signed.signedUrl, {
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}
