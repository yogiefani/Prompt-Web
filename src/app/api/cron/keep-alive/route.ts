import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Kita gunakan service role key jika ada (lebih aman), atau anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  // Vercel Cron secara otomatis menyisipkan header Authorization
  const authHeader = request.headers.get('authorization');
  
  // Keamanan: Pastikan hanya Vercel Cron atau pengakses yang punya secret yang bisa hit endpoint ini
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Lakukan query sederhana untuk "membangunkan" database
    // Mengambil 1 ID dari tabel profiles (tabel pasti ada karena digunakan untuk auth)
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Cron Keep-Alive Error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase keep-alive ping successful!',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
