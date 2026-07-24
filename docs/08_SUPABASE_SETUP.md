# Supabase Setup Guide — AlgoViz+

## Overview

AlgoViz+ uses Supabase for: **Auth**, **PostgreSQL** (via PostgREST), **Realtime**, and **Storage**.

---

## Step 1 — Environment Variables

Create `.env` in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

> **Where to find these:**
> - Supabase Dashboard → Settings → API → Project URL & anon public key
> - Google Cloud Console → Credentials → OAuth 2.0 Client IDs (Web)

---

## Step 2 — Database Tables (SQL)

Run this in **Supabase Dashboard → SQL Editor**:

```sql
-- =============================================
-- STUDY ROOMS
-- =============================================
create table if not exists study_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  category text not null,
  created_by uuid references auth.users(id),
  created_at bigint default extract(epoch from now()) * 1000,
  member_count int default 0,
  max_members int default 50,
  is_private boolean default false,
  is_active boolean default true,
  last_message text,
  last_message_at bigint
);

-- =============================================
-- STUDY ROOM MEMBERS (composite PK)
-- =============================================
create table if not exists study_room_members (
  room_id uuid references study_rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  joined_at bigint default extract(epoch from now()) * 1000,
  is_online boolean default false,
  last_seen_at bigint,
  unread_count int default 0,
  is_typing boolean default false,
  typing_at bigint,
  primary key (room_id, user_id)
);

-- =============================================
-- STUDY ROOM MESSAGES
-- =============================================
create table if not exists study_room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references study_rooms(id) on delete cascade,
  user_id uuid references auth.users(id),
  user_name text not null,
  content text not null,
  type text default 'TEXT',
  timestamp bigint default extract(epoch from now()) * 1000,
  edited boolean default false,
  edited_at bigint,
  code_language text,
  reply_to_id uuid references study_room_messages(id),
  reply_to_content text
);

-- =============================================
-- USER PROFILES
-- =============================================
create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text default '',
  username text unique default '',
  email text default '',
  phone_no text default '',
  avatar_url text,
  avatar_color_index int default 0,
  updated_at bigint default extract(epoch from now()) * 1000
);

-- =============================================
-- USER PRESENCE
-- =============================================
create table if not exists user_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_online boolean default false,
  last_seen_at bigint
);

-- =============================================
-- USER PROGRESS (algorithm learning tracking)
-- =============================================
create table if not exists user_progress (
  user_id uuid references auth.users(id) on delete cascade,
  algorithm_id text not null,
  viewed boolean default false,
  completed boolean default false,
  view_count int default 0,
  last_viewed_at timestamptz,
  primary key (user_id, algorithm_id)
);```

---

## Step 3 — RLS Policies

```sql
-- Enable RLS on all tables
alter table study_rooms enable row level security;
alter table study_room_members enable row level security;
alter table study_room_messages enable row level security;
alter table user_profiles enable row level security;
alter table user_presence enable row level security;
alter table user_progress enable row level security;

-- study_rooms: anyone can read active rooms; authenticated can create
create policy "read_active_rooms" on study_rooms for select using (is_active = true);
create policy "create_room" on study_rooms for insert with check (auth.uid() = created_by);
create policy "creator_delete_room" on study_rooms for update using (auth.uid() = created_by);

-- study_room_members: members can read; authenticated can insert self; can delete self
create policy "read_members" on study_room_members for select using (true);
create policy "join_room" on study_room_members for insert with check (auth.uid() = user_id);
create policy "leave_room" on study_room_members for delete using (auth.uid() = user_id);
create policy "update_own_member" on study_room_members for update using (auth.uid() = user_id);

-- study_room_messages: all members can read; authenticated members can insert; own messages can be deleted/updated
create policy "read_messages" on study_room_messages for select using (true);
create policy "send_message" on study_room_messages for insert with check (auth.uid() = user_id);
create policy "delete_own_message" on study_room_messages for delete using (auth.uid() = user_id);
create policy "edit_own_message" on study_room_messages for update using (auth.uid() = user_id);

-- user_profiles: each user can only read/write their own profile
create policy "read_own_profile" on user_profiles for select using (auth.uid() = user_id);
create policy "upsert_own_profile" on user_profiles for insert with check (auth.uid() = user_id);
create policy "update_own_profile" on user_profiles for update using (auth.uid() = user_id);

-- user_presence: authenticated users can read all, write own
create policy "read_presence" on user_presence for select using (true);
create policy "upsert_presence" on user_presence for insert with check (auth.uid() = user_id);
create policy "update_presence" on user_presence for update using (auth.uid() = user_id);

-- user_progress: each user can only read/write their own progress
create policy "read_own_progress" on user_progress for select using (auth.uid() = user_id);
create policy "upsert_own_progress" on user_progress for insert with check (auth.uid() = user_id);
create policy "update_own_progress" on user_progress for update using (auth.uid() = user_id);
create policy "delete_own_progress" on user_progress for delete using (auth.uid() = user_id);
```

---

## Step 4 — Realtime

Enable Realtime on the `study_room_messages` table:

> Supabase Dashboard → Database → Replication → `supabase_realtime` publication → Add table → `study_room_messages`

---

## Step 5 — Storage Bucket

1. Go to **Storage** in the Supabase Dashboard
2. Create a new bucket named **`Algoviz`** (exact name, case-sensitive)
3. Set as **Public** (for avatar URLs to be accessible)
4. Set file size limit: **5MB**
5. Allowed MIME types: `image/jpeg, image/png, image/webp`

```sql
-- Storage RLS policies for avatar uploads (run in SQL Editor)
-- Bucket must exist: Storage → New bucket → name "Algoviz" → Public

create policy "avatar_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'Algoviz'
    and name = 'profile_images/' || auth.uid()::text || '.jpg'
  );

create policy "avatar_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'Algoviz'
    and name = 'profile_images/' || auth.uid()::text || '.jpg'
  );

create policy "avatar_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'Algoviz'
    and name = 'profile_images/' || auth.uid()::text || '.jpg'
  );

create policy "avatar_read" on storage.objects
  for select using (bucket_id = 'Algoviz');
```

---

## Step 6 — Google OAuth

1. Go to **Authentication → Providers → Google** in Supabase Dashboard
2. Enable Google provider
3. Copy the **Callback URL** from Supabase
4. Go to [Google Cloud Console](https://console.cloud.google.com)
5. Create OAuth 2.0 credentials (Web Application)
6. Add the Supabase callback URL to **Authorized redirect URIs**
7. Copy the **Web Client ID** → add to `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

---

## Step 7 — Auto-create Profile (Trigger)

```sql
-- Trigger: create user_profile row on new auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  display_name text;
  color_idx int;
begin
  display_name := coalesce(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  color_idx := floor(random() * 8)::int;

  insert into public.user_profiles (user_id, name, username, email, avatar_url, avatar_color_index, updated_at)
  values (
    new.id,
    display_name,
    lower(replace(display_name, ' ', '_')),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'avatar_url',
    color_idx,
    extract(epoch from now()) * 1000
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Step 8 — Optional: Member Count Helper Function

```sql
-- RPC to safely increment member count
create or replace function increment_member_count(room_id_param uuid)
returns void as $$
begin
  update study_rooms
  set member_count = member_count + 1
  where id = room_id_param;
end;
$$ language plpgsql security definer;
```

---

## Verification Checklist

- [ ] `.env` file has correct `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] All 6 tables created in Supabase (including `user_progress`)
- [ ] RLS enabled on all tables with correct policies
- [ ] `study_room_messages` added to Realtime publication
- [ ] Storage bucket `Algoviz` created (public, with policies)
- [ ] Google OAuth configured in Supabase + Cloud Console
- [ ] `handle_new_user` trigger created
- [ ] Deep link scheme `algovizplus://` registered (password reset)
- [ ] App starts and shows login screen
- [ ] Email/password sign-up and sign-in work
- [ ] Profile loads correctly after sign-in
- [ ] Progress updates when viewing/completing an algorithm
