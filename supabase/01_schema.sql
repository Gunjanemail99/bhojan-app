-- Households: one row per family
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Members: the people who eat
create table members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  life_stage text not null default 'adult',
  is_vegetarian boolean not null default false,
  eats_egg boolean not null default true,
  portion_factor numeric(3,2) not null default 1.0,
  created_at timestamptz default now()
);

-- Meals: your real library
create table meals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  code text,
  name text not null,
  slot text not null,
  effort text not null default 'moderate',
  freq_days int not null default 7,
  is_vegetarian boolean not null default true,
  needs_soak boolean not null default false,
  calories int, protein int, carbs int, fat int, fiber int,
  notes text,
  created_at timestamptz default now()
);

-- Ratings: the learning substrate
create table meal_ratings (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid references meals(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  rating int check (rating between 1 and 5),
  eaten_on date not null default current_date,
  comment text,
  created_at timestamptz default now()
);