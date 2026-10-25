'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface AuthResponse {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email dan password wajib diisi.' };
  }

  const supabase = await createClient();

  // If using placeholder, mock successful login for preview
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return { success: true, redirectTo: '/dashboard' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, redirectTo: '/dashboard' };
}

export async function registerAction(formData: FormData): Promise<AuthResponse> {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!fullName || !email || !password) {
    return { success: false, error: 'Semua kolom wajib diisi.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Konfirmasi password tidak cocok.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter.' };
  }

  const supabase = await createClient();

  // If demo placeholder
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return { success: true, redirectTo: '/onboarding' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data?.user) {
    return { success: true, redirectTo: '/onboarding' };
  }

  return { success: true, redirectTo: '/login' };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function socialLoginAction(
  provider: 'google' | 'facebook' | 'twitter'
): Promise<AuthResponse> {
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')) {
    // Demo fallback for development without live Supabase cloud OAuth credentials
    return { success: true, redirectTo: '/dashboard' };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data?.url) {
    return { success: true, redirectTo: data.url };
  }

  return { success: true, redirectTo: '/dashboard' };
}

export async function forgotPasswordAction(email: string): Promise<AuthResponse> {
  if (!email) {
    return { success: false, error: 'Email wajib diisi.' };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')) {
    return { success: true };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?type=recovery`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function createStoreAction(formData: FormData): Promise<AuthResponse> {
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string;
  const timezone = (formData.get('timezone') as string) || 'Asia/Makassar';

  if (!name) {
    return { success: false, error: 'Nama kios/toko wajib diisi.' };
  }

  const supabase = await createClient();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return { success: true, redirectTo: '/dashboard' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sesi pengguna tidak valid. Silakan login kembali.' };
  }

  // 1. Insert store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .insert({
      name,
      address,
      phone,
      timezone,
    })
    .select()
    .single();

  if (storeError || !store) {
    return { success: false, error: storeError?.message || 'Gagal membuat toko baru.' };
  }

  // 2. Add user as owner in store_members
  const { error: memberError } = await supabase.from('store_members').insert({
    store_id: store.id,
    user_id: user.id,
    role: 'owner',
    is_active: true,
  });

  if (memberError) {
    return { success: false, error: memberError.message };
  }

  // 3. Create default categories for this store
  await supabase.from('categories').insert([
    { store_id: store.id, name: 'Sembako & Bahan Pokok', color: '#10b981' },
    { store_id: store.id, name: 'Makanan Instan & Snack', color: '#f59e0b' },
    { store_id: store.id, name: 'Minuman', color: '#3b82f6' },
    { store_id: store.id, name: 'Kebutuhan Rumah Tangga', color: '#8b5cf6' },
  ]);

  return { success: true, redirectTo: '/dashboard' };
}
