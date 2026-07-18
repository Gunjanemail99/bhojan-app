-- Create your household
insert into households (name) values ('Bhojan Household');

-- Add Papi, Sonu, Heeru — linked to that household
insert into members (household_id, name, life_stage, is_vegetarian, eats_egg, portion_factor)
values
  ((select id from households where name = 'Bhojan Household'), 'Papi',  'adult', false, true,  1.0),
  ((select id from households where name = 'Bhojan Household'), 'Sonu',  'adult', true,  false, 1.0),
  ((select id from households where name = 'Bhojan Household'), 'Heeru', 'child', false, true,  0.6);