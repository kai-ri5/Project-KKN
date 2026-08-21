-- =========================================================
-- SETUP SUPABASE: KEGIATAN + ADMIN + RLS
-- Jalankan di Supabase > SQL Editor
-- =========================================================

-- 1) Pastikan tabel kegiatan menggunakan RLS
alter table public.kegiatan enable row level security;

-- 2) Tabel daftar admin.
--    user_id diambil dari Authentication > Users > kolom User UID.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Admin hanya boleh membaca baris admin miliknya sendiri.
drop policy if exists "admin_users_read_own" on public.admin_users;
create policy "admin_users_read_own"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

-- Helper pengecekan admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- 3) Hapus policy lama bila ada dengan nama yang sama.
drop policy if exists "kegiatan_public_read" on public.kegiatan;
drop policy if exists "kegiatan_admin_insert" on public.kegiatan;
drop policy if exists "kegiatan_admin_update" on public.kegiatan;
drop policy if exists "kegiatan_admin_delete" on public.kegiatan;

-- 4) Semua pengunjung boleh melihat kegiatan.
create policy "kegiatan_public_read"
on public.kegiatan
for select
to anon, authenticated
using (true);

-- 5) Hanya admin terdaftar yang boleh menambah.
create policy "kegiatan_admin_insert"
on public.kegiatan
for insert
to authenticated
with check (public.is_admin());

-- 6) Hanya admin terdaftar yang boleh mengubah.
create policy "kegiatan_admin_update"
on public.kegiatan
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 7) Hanya admin terdaftar yang boleh menghapus.
create policy "kegiatan_admin_delete"
on public.kegiatan
for delete
to authenticated
using (public.is_admin());

insert into public.admin_users (user_id)
values (1460d81f-f11d-4348-b1bb-851c6f7acd6e);

-- CATATAN ID:
-- admin.js tidak mengirim kolom id ketika insert.
-- Jadi kolom kegiatan.id harus auto increment / Identity.
-- Di Table Editor, edit kolom id dan aktifkan "Is Identity".
