insert into people (first_name, last_name, generation, sort_order, bio)
values
('You', 'Family', 0, 0, 'The anchor generation sits at the grass line.'),
('Parent', 'Family', -1, 0, 'Ancestors are roots below the ground.'),
('Child', 'Family', 1, 0, 'Descendants climb into the branches.')
on conflict do nothing;
