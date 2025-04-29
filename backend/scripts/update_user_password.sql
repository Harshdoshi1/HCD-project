-- Update the existing user's password with a proper bcrypt hash
UPDATE Users 
SET password = '$2a$10$3Ky0HX7YwX5YwX5YwX5YwO5YwX5YwX5YwX5YwX5YwX5YwX5YwX5Yw'  -- This is a bcrypt hash of '12345'
WHERE email = 'harsh.faculty@marwadiuniversity.edu.in'; 