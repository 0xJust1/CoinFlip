-- Create the game_records table
create table game_records (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  wallet_address text not null,
  choice text not null check (choice in ('heads', 'tails')),
  result text not null check (result in ('heads', 'tails')),
  won boolean not null,
  bet_amount text not null,
  transaction_hash text not null unique
);

-- Create indexes for better query performance
create index idx_wallet_address on game_records(wallet_address);
create index idx_created_at on game_records(created_at desc);
create index idx_won on game_records(won);

-- Create a view for global statistics
create or replace view global_stats as
select 
  count(*) as total_games,
  sum(case when won then 1 else 0 end) as total_wins,
  sum(case when not won then 1 else 0 end) as total_losses,
  sum(case when result = 'heads' then 1 else 0 end) as heads_count,
  sum(case when result = 'tails' then 1 else 0 end) as tails_count,
  round((sum(case when won then 1 else 0 end)::numeric / count(*)::numeric * 100), 2) as win_rate
from game_records;

-- Create a view for player statistics
create or replace view player_stats as
select 
  wallet_address,
  count(*) as total_games,
  sum(case when won then 1 else 0 end) as total_wins,
  sum(case when not won then 1 else 0 end) as total_losses,
  sum(case when result = 'heads' then 1 else 0 end) as heads_count,
  sum(case when result = 'tails' then 1 else 0 end) as tails_count,
  round((sum(case when won then 1 else 0 end)::numeric / count(*)::numeric * 100), 2) as win_rate
from game_records
group by wallet_address;

-- Create a function to get player statistics
create or replace function get_player_stats(p_wallet_address text)
returns table (
  total_games bigint,
  total_wins bigint,
  total_losses bigint,
  heads_count bigint,
  tails_count bigint,
  win_rate numeric
) as $$
begin
  return query
  select 
    count(*) as total_games,
    sum(case when won then 1 else 0 end) as total_wins,
    sum(case when not won then 1 else 0 end) as total_losses,
    sum(case when result = 'heads' then 1 else 0 end) as heads_count,
    sum(case when result = 'tails' then 1 else 0 end) as tails_count,
    round((sum(case when won then 1 else 0 end)::numeric / count(*)::numeric * 100), 2) as win_rate
  from game_records
  where wallet_address = p_wallet_address;
end;
$$ language plpgsql; 