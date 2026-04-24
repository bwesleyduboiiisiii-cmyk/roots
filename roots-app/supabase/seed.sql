-- =============================================
-- OPTIONAL: SAMPLE FAMILY DATA
-- Run this AFTER schema.sql if you want a test family to see the tree working
-- Delete these rows before adding your real family
-- =============================================

-- Grandparents (generation -2)
insert into people (id, first_name, last_name, nickname, birth_date, death_date, generation, sort_order, bio) values
  ('11111111-1111-1111-1111-111111111111', 'Harold', 'Smith', 'Harry', '1935-03-12', '2018-11-04', -2, 1, 'Loved fishing and telling the same stories over and over.'),
  ('22222222-2222-2222-2222-222222222222', 'Margaret', 'Smith', 'Peggy', '1938-07-22', '2020-02-15', -2, 2, 'Made the world''s best apple pie. Never shared the recipe.'),
  ('33333333-3333-3333-3333-333333333333', 'Robert', 'Johnson', 'Bob', '1940-01-05', null, -2, 3, 'Still plays bridge every Thursday.'),
  ('44444444-4444-4444-4444-444444444444', 'Eleanor', 'Johnson', 'Ellie', '1942-09-30', null, -2, 4, 'Retired nurse, endless kindness.');

-- Parents (generation -1)
insert into people (id, first_name, last_name, maiden_name, birth_date, generation, sort_order, bio) values
  ('55555555-5555-5555-5555-555555555555', 'Linda', 'Johnson', 'Smith', '1965-06-10', -1, 1, 'Kindergarten teacher for 30 years.'),
  ('66666666-6666-6666-6666-666666666666', 'David', 'Johnson', null, '1963-11-22', -1, 2, 'Engineer. Fixes everything in the house.');

-- Kids (generation 0 — you and siblings)
insert into people (id, first_name, last_name, birth_date, generation, sort_order, bio) values
  ('77777777-7777-7777-7777-777777777777', 'Sarah', 'Johnson', '1992-04-18', 0, 1, 'Older sister. Lives in Seattle now.'),
  ('88888888-8888-8888-8888-888888888888', 'Alex', 'Johnson', '1995-08-09', 0, 2, 'The one building this website.'),
  ('99999999-9999-9999-9999-999999999999', 'Ben', 'Johnson', '1998-12-03', 0, 3, 'Youngest. Still thinks he''s the favorite.');

-- Relationships
-- Harold + Margaret (spouses)
insert into relationships (person_id, related_person_id, relationship_type) values
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'spouse'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'spouse');

-- Robert + Eleanor (spouses)
insert into relationships (person_id, related_person_id, relationship_type) values
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'spouse'),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'spouse');

-- Linda + David (spouses)
insert into relationships (person_id, related_person_id, relationship_type) values
  ('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'spouse'),
  ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'spouse');

-- Linda is child of Robert + Eleanor
insert into relationships (person_id, related_person_id, relationship_type) values
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'parent'),
  ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'parent');

-- David is child of Harold + Margaret
insert into relationships (person_id, related_person_id, relationship_type) values
  ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'parent'),
  ('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'parent');

-- Sarah, Alex, Ben are children of Linda + David
insert into relationships (person_id, related_person_id, relationship_type) values
  ('55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'parent'),
  ('66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 'parent'),
  ('55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'parent'),
  ('66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 'parent'),
  ('55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', 'parent'),
  ('66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', 'parent');
