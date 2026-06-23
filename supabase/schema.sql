-- ============================================================================
-- MODULA · SCHEMA MULTI-TENANT (canonico)
-- ----------------------------------------------------------------------------
-- UNA sola app, UN solo database Supabase, TANTE aziende (tenant).
--   · ogni azienda = una riga in `tenants` (nome, logo, accento, moduli attivi)
--   · ogni riga dati ha `tenant_id`, stampato in automatico da un trigger
--   · RLS: ogni azienda vede solo i SUOI dati; il super-admin (tu) vede tutto
--   · gli account si creano col sistema di inviti gia' esistente nell'app
--
-- COME USARLO:
--   1. Crea UN progetto Supabase (uno solo, per sempre).
--   2. SQL Editor → incolla TUTTO questo file → Run.
--   3. Copia Project URL + anon key in core/config.js.
--   4. Registrati nell'app, poi esegui  select bootstrap_super_admin();  (vedi in fondo)
--      → diventi il super-admin. Da li' crei le aziende.
--
-- Idempotente: si puo' ri-eseguire senza rompere nulla.
-- ============================================================================

-- ───────────────────────── 1. TENANT (le aziende) ─────────────────────────
create table if not exists tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  tagline     text default '',
  logo        text default '',
  accent      text default '#34D399',
  modules     jsonb not null default '["hub","cal","notes","notif"]'::jsonb,  -- moduli attivi per questa azienda
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ───────────────────── 2. SUPER-ADMIN (tu, il creatore) ────────────────────
create table if not exists super_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─────────────────────────── 3. FUNZIONI CHIAVE ───────────────────────────
-- tenant dell'utente loggato (letto dal suo record in employees). SECURITY DEFINER
-- per poter leggere employees ignorando la RLS (evita ricorsione infinita).
create or replace function current_tenant() returns uuid
  language sql stable security definer set search_path = public as $$
  select tenant_id from employees where user_id = auth.uid() limit 1;
$$;

create or replace function is_super_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists(select 1 from super_admins where user_id = auth.uid());
$$;

-- trigger: stampa tenant_id automaticamente su ogni insert (l'app non lo invia)
create or replace function set_tenant_id() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.tenant_id is null then
    new.tenant_id := current_tenant();
  end if;
  return new;
end;
$$;

-- ─────────────────── 4. TABELLE DATI (tutte con tenant_id) ──────────────────
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  role text default '',
  phone text default '',
  perms jsonb default '[]'::jsonb,
  is_owner boolean default false,
  active boolean default true,
  invite_code text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index if not exists employees_invite_code_key on employees(invite_code) where invite_code is not null;
create unique index if not exists employees_user_tenant_key on employees(user_id) where user_id is not null;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text, phone text default '', zone text default '', "group" text default '',
  address text default '', plant text default '', pellet text default '', maintenance text default '',
  notes text default '', blocked boolean default false,
  first_name text default '', last_name text default '', street text default '', street_no text default '',
  cap text default '', town text default '', email text default '',
  lat double precision, lng double precision, geo_src text,
  created_at timestamptz not null default now()
);

create table if not exists maintenances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text, client_id uuid, client_raw text, employee_id uuid, employees jsonb default '[]'::jsonb,
  date date, time text, status text default 'da_fare', notes text default '',
  recur int default 0, price numeric, type text, report jsonb, via text default 'manuale',
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text, client_id uuid, client_raw text, employee_id uuid, employees jsonb default '[]'::jsonb,
  date date, time text, done boolean default false, via text default 'manuale',
  created_at timestamptz not null default now()
);

create table if not exists pellet (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  client_id uuid, client_raw text, employee_id uuid, employees jsonb default '[]'::jsonb,
  qty numeric, unit text, kind text, date date, time text, status text default 'da_consegnare',
  price numeric, signature text, signed_name text default '', notes text default '', via text default 'manuale',
  created_at timestamptz not null default now()
);

create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text, client_id uuid, client_raw text, status text default 'aperto', employees jsonb default '[]'::jsonb,
  est_hours numeric, amount numeric, start_date date, due_date date, closed_date date,
  notes text default '', via text default 'manuale',
  created_at timestamptz not null default now()
);

create table if not exists site_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  date date, text text, hours numeric, emp_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  name text, type text, storage_path text, date date,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  text text, client_id uuid, group_id uuid, employees jsonb default '[]'::jsonb,
  date date, pinned boolean default false, archived boolean default false, via text default 'manuale',
  created_at timestamptz not null default now()
);

create table if not exists note_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text, members jsonb default '[]'::jsonb
);

create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text, via text default 'manuale',
  created_at timestamptz not null default now()
);

create table if not exists list_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  list_id uuid references lists(id) on delete cascade,
  text text, done boolean default false, position int default 0
);

create table if not exists chat (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  emp_id uuid, text text, sys boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists call_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  client_id uuid, year int, called boolean default false, outcome text default '', note text default '', maint_id uuid
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  date date, category text default '', amount numeric, note text default '', site_id uuid, recur int default 0,
  created_at timestamptz not null default now()
);

create table if not exists maint_prices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  kind text, price numeric
);

-- settings: UNA riga per azienda (non piu' id=1 globale)
create table if not exists settings (
  tenant_id uuid primary key references tenants(id) on delete cascade,
  company_name text default '', bags_per_pallet int default 70, price_per_ton numeric, price_per_bag numeric
);

create table if not exists push_subs (
  endpoint text primary key,
  tenant_id uuid not null references tenants(id) on delete cascade,
  p256dh text, auth text, emp_id uuid, ua text,
  created_at timestamptz not null default now()
);

-- ──────────────── 5. TRIGGER tenant_id + INDICI su tenant_id ────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'employees','clients','maintenances','appointments','pellet','sites','site_logs',
    'attachments','notes','note_groups','lists','list_items','chat','call_log',
    'expenses','maint_prices','push_subs'
  ] loop
    execute format('drop trigger if exists trg_tenant on %I', t);
    execute format('create trigger trg_tenant before insert on %I for each row execute function set_tenant_id()', t);
    execute format('create index if not exists %I on %I(tenant_id)', t||'_tenant_idx', t);
  end loop;
end $$;

-- ─────────────────────────────── 6. RLS ───────────────────────────────────
-- Una policy "for all": ogni azienda vede/scrive solo le SUE righe; il super-admin tutto.
do $$
declare t text;
begin
  foreach t in array array[
    'tenants','employees','clients','maintenances','appointments','pellet','sites','site_logs',
    'attachments','notes','note_groups','lists','list_items','chat','call_log',
    'expenses','maint_prices','settings','push_subs'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_isolation on %I', t);
  end loop;
end $$;

-- tenants: leggibile dal proprio tenant; gestibile solo dal super-admin
create policy tenant_isolation on tenants for all
  using (id = current_tenant() or is_super_admin())
  with check (is_super_admin());

-- tabelle dati: isolamento per tenant_id (+ super-admin)
do $$
declare t text;
begin
  foreach t in array array[
    'employees','clients','maintenances','appointments','pellet','sites','site_logs',
    'attachments','notes','note_groups','lists','list_items','chat','call_log',
    'expenses','maint_prices','settings','push_subs'
  ] loop
    execute format($p$create policy tenant_isolation on %I for all
      using (tenant_id = current_tenant() or is_super_admin())
      with check (tenant_id = current_tenant() or is_super_admin())$p$, t);
  end loop;
end $$;

-- super_admins: ognuno vede solo se' stesso (e i super-admin tra loro)
alter table super_admins enable row level security;
drop policy if exists sa_self on super_admins;
create policy sa_self on super_admins for select using (user_id = auth.uid() or is_super_admin());

-- ──────────────── 7. ONBOARDING: creare aziende e account ──────────────────
-- Il super-admin crea l'azienda + il record "titolare" e ottiene un CODICE INVITO.
-- Il titolare si registra nell'app (email+password) e inserisce il codice → e' dentro.
create or replace function create_tenant(
  p_name text, p_slug text, p_modules jsonb, p_owner_name text
) returns jsonb
  language plpgsql security definer set search_path = public as $$
declare v_tenant uuid; v_code text;
begin
  if not is_super_admin() then raise exception 'Solo il super-admin puo creare aziende'; end if;
  insert into tenants(slug,name,modules) values (p_slug, p_name, coalesce(p_modules,'["hub","cal","notes","notif"]'::jsonb))
    returning id into v_tenant;
  v_code := upper(regexp_replace(p_owner_name,'[^a-zA-Z]','','g'));
  v_code := left(coalesce(nullif(v_code,''),'OWNER'),5) || '-' || upper(substr(md5(gen_random_uuid()::text),1,5));
  insert into employees(tenant_id,name,is_owner,active,invite_code)
    values (v_tenant, p_owner_name, true, true, v_code);
  insert into settings(tenant_id,company_name) values (v_tenant, p_name);
  return jsonb_build_object('tenant_id', v_tenant, 'invite_code', v_code);
end;
$$;

-- Un utente collega il proprio login a un record employee tramite il codice invito.
create or replace function claim_invite(code text) returns boolean
  language plpgsql security definer set search_path = public as $$
declare v_emp employees%rowtype;
begin
  select * into v_emp from employees where invite_code = upper(code) and user_id is null limit 1;
  if not found then return false; end if;
  update employees set user_id = auth.uid(), invite_code = null where id = v_emp.id;
  return true;
end;
$$;

-- Il titolare genera inviti per i propri dipendenti (resta dentro al suo tenant via RLS).
create or replace function create_invite(p_name text, p_perms jsonb) returns text
  language plpgsql security definer set search_path = public as $$
declare v_tenant uuid; v_code text;
begin
  select tenant_id into v_tenant from employees where user_id = auth.uid() and is_owner = true limit 1;
  if v_tenant is null then raise exception 'Solo il titolare puo invitare dipendenti'; end if;
  v_code := upper(regexp_replace(p_name,'[^a-zA-Z]','','g'));
  v_code := left(coalesce(nullif(v_code,''),'USER'),5) || '-' || upper(substr(md5(gen_random_uuid()::text),1,5));
  insert into employees(tenant_id,name,active,invite_code,perms)
    values (v_tenant, p_name, true, v_code, coalesce(p_perms,'[]'::jsonb));
  return v_code;
end;
$$;

-- Il PRIMO che lo chiama (se la tabella e' vuota) diventa super-admin. Esegui una volta DOPO esserti registrato.
create or replace function bootstrap_super_admin() returns boolean
  language plpgsql security definer set search_path = public as $$
begin
  if exists(select 1 from super_admins) then return false; end if;
  insert into super_admins(user_id) values (auth.uid());
  return true;
end;
$$;

-- ─────────────────────────── 8. REALTIME ─────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'clients','maintenances','appointments','pellet','sites','site_logs','attachments',
    'notes','note_groups','lists','list_items','chat','call_log','expenses','maint_prices',
    'employees','settings'
  ] loop
    begin execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null; end;
  end loop;
end $$;

-- ============================================================================
-- FATTO. Prossimo passo lato app: core/config.js con URL + anon key.
-- Per diventare super-admin: registrati nell'app, poi qui esegui
--     select bootstrap_super_admin();
-- ============================================================================
