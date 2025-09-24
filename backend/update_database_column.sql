-- SQL script to rename 'ca' column to 'cse' in ComponentWeightages table
-- Run this in your MySQL database to update the existing table structure

-- Check if the table exists and has the 'ca' column
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'ComponentWeightages' 
AND COLUMN_NAME = 'ca';

-- Rename the column from 'ca' to 'cse'
ALTER TABLE ComponentWeightages 
CHANGE COLUMN ca cse INT NOT NULL DEFAULT 0;

-- Verify the change
DESCRIBE ComponentWeightages;
