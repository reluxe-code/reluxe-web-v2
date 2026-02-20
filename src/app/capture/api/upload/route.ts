import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const safeName = String(file.name || 'capture.png').replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from('form-captures')
    .upload(fileName, file);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: signed, error: signError } = await supabase.storage
    .from('form-captures')
    .createSignedUrl(fileName, 60);

  if (signError) return NextResponse.json({ error: signError.message }, { status: 500 });

  return NextResponse.json({
    filePath: fileName,
    signedUrl: signed.signedUrl,
    mimeType: file.type || 'application/octet-stream',
  });
}
