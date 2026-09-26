-- Run this in your Supabase project → SQL Editor

create table if not exists challenges (
  id            uuid        default gen_random_uuid() primary key,
  created_by    uuid        references auth.users(id) on delete cascade not null,
  title         text        not null,
  workout_type  text        not null,
  exercise_ids  text[]      not null default '{}',
  exercise_names text[]     not null default '{}',
  status        text        not null default 'active'
                            check (status in ('active', 'complete')),
  invite_code   text        unique not null,
  created_at    timestamptz default now() not null
);

create table if not exists challenge_participants (
  id           uuid        default gen_random_uuid() primary key,
  challenge_id uuid        references challenges(id) on delete cascade not null,
  user_id      uuid        references auth.users(id) on delete cascade not null,
  display_name text        not null default '',
  status       text        not null default 'joined'
                           check (status in ('joined', 'submitted')),
  joined_at    timestamptz default now() not null,
  unique(challenge_id, user_id)
);

create table if not exists challenge_submissions (
  id           uuid        default gen_random_uuid() primary key,
  challenge_id uuid        references challenges(id) on delete cascade not null,
  user_id      uuid        references auth.users(id) on delete cascade not null,
  display_name text        not null default '',
  exercises    jsonb       not null default '[]',
  score        numeric     not null default 1.0,
  submitted_at timestamptz default now() not null,
  unique(challenge_id, user_id)
);

-- RLS
alter table challenges             enable row level security;
alter table challenge_participants enable row level security;
alter table challenge_submissions  enable row level security;

-- challenges: any authenticated user can read (needed to join via invite code)
create policy "auth read challenges"   on challenges for select to authenticated using (true);
create policy "auth insert challenges" on challenges for insert to authenticated with check (auth.uid() = created_by);
create policy "auth update challenges" on challenges for update to authenticated using (true);

-- participants
create policy "auth read participants"   on challenge_participants for select to authenticated using (true);
create policy "auth insert participants" on challenge_participants for insert to authenticated with check (auth.uid() = user_id);
create policy "auth update participants" on challenge_participants for update to authenticated using (auth.uid() = user_id);

-- submissions
create policy "auth read submissions"   on challenge_submissions for select to authenticated using (true);
create policy "auth insert submissions" on challenge_submissions for insert to authenticated with check (auth.uid() = user_id);
