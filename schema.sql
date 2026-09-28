create table games(slug text primary key,title text,status text,tagline text,description text,version text,release_date date,genre text,engine text,itch_url text,steam_url text,logo text,credits text[] default '{}');
create table members(slug text primary key,name text,role text,former boolean default false,bio text,photo text,cv_url text,links jsonb default '{}');
create table audio_tracks(id bigint generated always as identity primary key,title text,artist text,kind text check(kind in('song','sound','sfx')),file_url text);
alter table games enable row level security;alter table members enable row level security;alter table audio_tracks enable row level security;
create policy "public read" on games for select using(true);
create policy "public read" on members for select using(true);
create policy "public read" on audio_tracks for select using(true);
-- Import the rows from data/data.json via the Table Editor, then paste project URL + anon key into js/app.js.
create table posts(id bigint generated always as identity primary key,date date,tag text,title text,body text);alter table posts enable row level security;create policy "public read" on posts for select using(true);

-- Coverflow update: cover art for audio, plus films and arts tables (safe to run on an existing project).
alter table audio_tracks add column if not exists cover_url text;
create table if not exists films(id bigint generated always as identity primary key,title text,year int,runtime text,description text,poster_url text,watch_url text);
create table if not exists arts(id bigint generated always as identity primary key,title text,category text,artist text,description text,image_url text);
alter table films enable row level security;alter table arts enable row level security;
create policy "public read" on films for select using(true);
create policy "public read" on arts for select using(true);
