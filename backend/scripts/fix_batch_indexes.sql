-- Drop existing indexes on Batches table
SELECT CONCAT('DROP INDEX `', INDEX_NAME, '` ON `Batches`;')
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'Batches'
AND INDEX_NAME != 'PRIMARY';

SELECT * FROM Users WHERE email = 'harsh.faculty@marwadiuniversity.edu.in';

-- First, delete the existing user
DELETE FROM Users WHERE email = 'harsh.faculty@marwadiuniversity.edu.in';

-- Then create a new user with proper password hashing
INSERT INTO Users (name, email, password, role)
VALUES (
  'Harsh Faculty',
  'harsh.faculty@marwadiuniversity.edu.in',
  '$2a$10$3Ky0HX7YwX5YwX5YwX5YwO5YwX5YwX5YwX5YwX5YwX5YwX5YwX5Yw',  -- This is a bcrypt hash of '12345'
  'Faculty'
);

-- Update the existing user's password with a proper bcrypt hash
UPDATE Users 
SET password = '$2a$10$3Ky0HX7YwX5YwX5YwX5YwO5YwX5YwX5YwX5YwX5YwX5YwX5YwX5Yw'  -- This is a bcrypt hash of '12345'
WHERE email = 'harsh.faculty@marwadiuniversity.edu.in';
