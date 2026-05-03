-- ============================================
-- ROOTS — Relationship constraint repair
-- Run this in your Supabase SQL Editor
-- ============================================

-- The bug: relationships table may have a unique constraint that doesn't
-- include relationship_type. That makes (A, B) → "spouse" and (A, B) → "sibling"
-- look like duplicates even though they're different.
--
-- Fix: drop any old unique constraint on (person_id, related_person_id) and
-- replace with one that also includes relationship_type.

-- Step 1: list current constraints (run this first to see what's there)
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
-- WHERE conrelid = 'relationships'::regclass;

-- Step 2: Drop any old unique constraint that doesn't include relationship_type.
-- The constraint name might be different on your db — adjust if needed.
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'relationships'::regclass
    AND contype = 'u'
  LOOP
    EXECUTE 'ALTER TABLE relationships DROP CONSTRAINT IF EXISTS ' || quote_ident(c.conname);
  END LOOP;
END $$;

-- Step 3: Add the correct unique constraint
ALTER TABLE relationships
  ADD CONSTRAINT relationships_unique_pair_type
  UNIQUE (person_id, related_person_id, relationship_type);

-- Verify
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
WHERE conrelid = 'relationships'::regclass;
