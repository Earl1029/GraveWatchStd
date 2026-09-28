create table games(slug text primary key,title text,status text,tagline text,description text,version text,release_date date,genre text,engine text,itch_url text,steam_url text,logo text,credits text[] default '{}');
create table members(slug text primary key,name text,role text,former boolean default false,bio text,photo text,cv_url text,links jsonb default '{}');
create table audio_tracks(id bigint generated always as identity primary key,title text,artist text,kind text check(kind in('song','sound','sfx')),file_url text);
alter table games enable row level security;alter table members enable row level security;alter table audio_tracks enable row level security;
create policy "public read" on games for select using(true);
create policy "public read" on members for select using(true);
create policy "public read" on audio_tracks for select using(true);
-- Import the rows from data/data.json via the Table Editor, then paste project URL + anon key into js/app.js.
