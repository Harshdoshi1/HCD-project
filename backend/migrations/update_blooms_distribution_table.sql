-- Migration script to update student_blooms_distribution table structure
-- This script removes redundant columns and simplifies the table as requested

-- First, create a backup of the existing table
CREATE TABLE IF NOT EXISTS student_blooms_distribution_backup AS 
SELECT * FROM student_blooms_distribution;

-- Drop the existing table
DROP TABLE IF EXISTS student_blooms_distribution;

-- Create the new simplified table structure
CREATE TABLE student_blooms_distribution (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER NOT NULL,
    semesterNumber INTEGER NOT NULL,
    subjectId VARCHAR(255) NOT NULL,
    bloomsTaxonomyId INTEGER NOT NULL,
    assignedMarks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    
    -- Create unique constraint to prevent duplicates
    UNIQUE(studentId, subjectId, semesterNumber, bloomsTaxonomyId)
);

-- Create indexes for better performance
CREATE INDEX idx_student_semester ON student_blooms_distribution(studentId, semesterNumber);
CREATE INDEX idx_subject_semester ON student_blooms_distribution(subjectId, semesterNumber);

-- Update subject_component_cos table to add new columns for subcomponent tracking
-- Check if columns exist before adding them
ALTER TABLE subject_component_cos ADD COLUMN sub_component_id INTEGER NULL;
ALTER TABLE subject_component_cos ADD COLUMN sub_component_name VARCHAR(100) NULL;

-- Update the unique constraint to include the new columns
DROP INDEX IF EXISTS uniq_subcomp_co;
CREATE UNIQUE INDEX uniq_subcomp_co ON subject_component_cos(subject_component_id, course_outcome_id, component, sub_component_id);

-- Add comment to indicate the migration was completed
INSERT INTO migrations_log (migration_name, executed_at) 
VALUES ('update_blooms_distribution_table', datetime('now'))
ON CONFLICT DO NOTHING;

-- Create migrations_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migrations_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    executed_at DATETIME NOT NULL
);
