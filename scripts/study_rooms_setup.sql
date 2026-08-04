-- AlgoViz+ Study Rooms — run in Supabase SQL Editor (docs/08_SUPABASE_SETUP.md)

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

alter table study_rooms enable row level security;
alter table study_room_members enable row level security;
alter table study_room_messages enable row level security;

create policy "read_active_rooms" on study_rooms for select using (is_active = true);
create policy "create_room" on study_rooms for insert with check (auth.uid() = created_by);
create policy "creator_delete_room" on study_rooms for update using (auth.uid() = created_by);

create policy "read_members" on study_room_members for select using (true);
create policy "join_room" on study_room_members for insert with check (auth.uid() = user_id);
create policy "leave_room" on study_room_members for delete using (auth.uid() = user_id);
create policy "update_own_member" on study_room_members for update using (auth.uid() = user_id);

create policy "read_messages" on study_room_messages for select using (true);
create policy "send_message" on study_room_messages for insert with check (auth.uid() = user_id);
create policy "delete_own_message" on study_room_messages for delete using (auth.uid() = user_id);
create policy "edit_own_message" on study_room_messages for update using (auth.uid() = user_id);
