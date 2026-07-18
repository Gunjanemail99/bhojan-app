-- Small catalogs: all follow the same shape
create table if not exists tiffin_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  code text, name text not null,
  calories int, protein int, carbs int, fat int, fiber int,
  created_at timestamptz default now()
);

create table if not exists snacks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  code text, name text not null, is_egg boolean default false,
  calories int, protein int, carbs int, fat int, fiber int,
  created_at timestamptz default now()
);

create table if not exists fruits (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  code text, name text not null,
  calories int, protein int, carbs int, fat int, fiber int,
  created_at timestamptz default now()
);

create table if not exists staples (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  code text, name text not null, emoji text,
  calories int, protein int, carbs int, fat int, fiber int,
  created_at timestamptz default now()
);

-- Cooks: who cooks which slots, and their weekly off
create table if not exists cooks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  slots text[] default '{}',        -- e.g. {B,L} or {D}
  off_day int,                      -- 0=Sun ... 6=Sat, null = no fixed off
  phone text,
  created_at timestamptz default now()
);

-- Rules: the household's food logic
create table if not exists rules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  code text,
  description text not null,
  is_hard boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz default now()
);


-- Helper: your household id, used throughout
-- Tiffin (10 items)
insert into tiffin_items (household_id, code, name, calories, protein, carbs, fat, fiber)
select (select id from households where name='Bhojan Household'), *
from (values
  ('T01','Pancakes',300,8,45,10,2), ('T02','Paneer Bhurji + Roti',380,16,38,16,4),
  ('T03','Paneer Roll',360,14,42,14,3), ('T04','Fried Rice',320,7,52,9,3),
  ('T05','Gobi Paratha',340,9,48,12,5), ('T06','Bhindi + Roti',300,8,42,10,6),
  ('T07','Noodles',330,7,50,10,3), ('T08','Pasta',350,10,52,10,3),
  ('T09','Burger',420,15,55,15,5), ('T10','Mix Veg Paratha',360,10,52,13,6)
) as v;

-- Snacks (8)
insert into snacks (household_id, code, name, is_egg, calories, protein, carbs, fat, fiber)
select (select id from households where name='Bhojan Household'), *
from (values
  ('S01','Ragi Dosa',false,220,6,38,4,4), ('S02','Paneer Paratha',false,380,15,45,15,4),
  ('S03','Aloo Paratha (snack)',false,350,8,50,12,4), ('S04','Cold Coffee',false,180,6,24,6,0),
  ('S05','Beetroot-Carrot-Pomegranate Juice',false,120,2,26,0,3), ('S06','Banana',false,105,1,27,0,3),
  ('S07','Protein Bar',false,220,20,22,7,3), ('S08','Bread Omelette',true,280,14,26,14,2)
) as v;

-- Fruits (6)
insert into fruits (household_id, code, name, calories, protein, carbs, fat, fiber)
select (select id from households where name='Bhojan Household'), *
from (values
  ('F01','Apple',95,0,25,0,4), ('F02','Banana',105,1,27,0,3),
  ('F03','Pomegranate',105,2,24,1,4), ('F04','Papaya',60,1,15,0,3),
  ('F05','Orange',62,1,15,0,3), ('F06','Seasonal fruit',80,1,20,0,3)
) as v;

-- Daily staples (8)
insert into staples (household_id, code, name, emoji, calories, protein, carbs, fat, fiber)
select (select id from households where name='Bhojan Household'), *
from (values
  ('ST1','Tea','☕',60,2,8,2,0), ('ST2','Popcorn','🍿',120,3,20,4,3),
  ('ST3','Raita','🥣',90,4,8,4,1), ('ST4','Curd','🥛',100,5,6,5,0),
  ('ST5','Mango','🥭',100,1,25,0,3), ('ST6','Cucumber','🥒',20,1,4,0,1),
  ('ST7','Makhana','🥜',110,4,20,1,2), ('ST8','Dry Fruits','🌰',160,5,12,12,3)
) as v;

-- Your 12 rules
insert into rules (household_id, code, description, is_hard)
select (select id from households where name='Bhojan Household'), *
from (values
  ('R1','Idli day → Dosa within 2 days (uses the batter)',true),
  ('R2','Someone sick → Khichdi + Curd tonight',true),
  ('R3','Return from travel → Arhar Dal + Rice for first lunch',true),
  ('R4','Office day → office-friendly lunch preferred',false),
  ('R5','Soak-required meals create a prep task the evening before',true),
  ('R6','At most 2 elaborate meals per week',true),
  ('R7','Weekend → weekend-tagged meals preferred',false),
  ('R8','Guests tonight → guest-worthy meals preferred',false),
  ('R9','Cook''s weekly off → prefer quick meals in their slots',false),
  ('R10','Monday & Wednesday snack is always Ragi Dosa',true),
  ('R11','Chickpea Burger dinner → Burger in next day''s tiffin',true),
  ('R12','Mix Veg Paratha dinner → Mix Veg Paratha in next day''s tiffin',true)
) as v;
