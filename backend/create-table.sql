-- Drop the existing table if it exists
drop table if exists subjects;

-- Create the subjects table with the correct structure
create table subjects (
    id uuid default gen_random_uuid() primary key,
    name varchar(255) not null,
    code varchar(50) not null unique,
    course_type varchar(50) not null,
    credits integer not null,
    subject_type varchar(50) not null,
    created_at timestamptz default now()
);

-- Create an index on the code column for faster lookups
create index idx_subjects_code on subjects(code);

-- Insert a test record
insert into subjects (name, code, course_type, credits, subject_type)
values ('Test Subject', 'TEST101', 'degree', 3, 'central')
returning *; 