-- Elimina la tabella e le policy esistenti
drop policy if exists "Enable all operations for all users" on public.levels;
drop table if exists public.levels;

-- Creazione della tabella levels
create table public.levels (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamptz default now(),
    ruolo text,
    step text,
    execution integer,
    soft integer,
    strategy integer,
    standard text
);

-- Imposta le policy RLS per la tabella levels
alter table public.levels enable row level security;

-- Policy che permette tutte le operazioni a tutti gli utenti (per test)
create policy "Enable all operations for all users" on public.levels
    for all
    using (true)
    with check (true);

-- Funzione per ricaricare la cache dello schema
create or replace function public.reload_schema_cache()
returns void
language plpgsql
security definer
as $$
begin
  -- Forza un refresh della cache dello schema
  perform pg_notify('reload_schema', '');
end;
$$; 