-- Verify table structure
select 
    column_name, 
    data_type, 
    is_nullable,
    column_default
from information_schema.columns 
where table_name = 'subjects'
order by ordinal_position;

-- Verify test data
select * from subjects; 