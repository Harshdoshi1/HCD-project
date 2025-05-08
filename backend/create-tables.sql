-- Drop existing tables if they exist
DROP TABLE IF EXISTS unique_sub_degrees;
DROP TABLE IF EXISTS unique_sub_diplomas;

-- Create unique_sub_degrees table
CREATE TABLE unique_sub_degrees (
    sub_code text PRIMARY KEY,
    sub_name text NOT NULL,
    sub_credit integer NOT NULL,
    sub_level text NOT NULL CHECK (sub_level IN ('central', 'department')),
    semester integer NOT NULL CHECK (semester BETWEEN 1 AND 8),
    program text NOT NULL DEFAULT 'Degree'
);

-- Create unique_sub_diplomas table
CREATE TABLE unique_sub_diplomas (
    sub_code text PRIMARY KEY,
    sub_name text NOT NULL,
    sub_credit integer NOT NULL,
    sub_level text NOT NULL CHECK (sub_level IN ('central', 'department'))
);

-- Insert test data
INSERT INTO unique_sub_degrees (sub_code, sub_name, sub_credit, sub_level, semester)
VALUES ('TEST101', 'Test Degree Subject', 3, 'central', 1);

INSERT INTO unique_sub_diplomas (sub_code, sub_name, sub_credit, sub_level)
VALUES ('TEST102', 'Test Diploma Subject', 3, 'central'); 