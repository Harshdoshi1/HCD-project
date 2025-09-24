-- Fix the unique constraint issue in subject_component_cos table

-- First, drop the existing unique constraint
ALTER TABLE subject_component_cos DROP INDEX IF EXISTS uniq_subcomp_co;

-- Create a new unique constraint that includes all necessary fields
ALTER TABLE subject_component_cos 
ADD UNIQUE KEY uniq_subcomp_co_fixed (
    subject_component_id, 
    course_outcome_id, 
    component, 
    IFNULL(sub_component_id, -1)
);

-- The IFNULL is used because NULL values are not considered equal in MySQL unique constraints
-- So we use -1 as a placeholder for NULL sub_component_id values

-- Update existing CA entries to CSE
UPDATE subject_component_cos 
SET component = 'CSE' 
WHERE component = 'CA';

-- Display the updated structure
SELECT * FROM subject_component_cos;
