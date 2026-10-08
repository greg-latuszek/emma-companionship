-- Migration: 002_couples_drop_unused_columns.sql
-- Purpose: Couples table only stores the two spouses; wedding/children are out of product.
-- Safe on empty couples table (current Docker DBs).

ALTER TABLE couples DROP COLUMN IF EXISTS wedding_date;
ALTER TABLE couples DROP COLUMN IF EXISTS number_of_children;
