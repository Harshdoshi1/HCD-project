-- Drop the table if it exists
DROP TABLE IF EXISTS batches;

-- Create the batches table
CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    batch_name VARCHAR(50) NOT NULL,
    batch_start DATE NOT NULL,
    batch_end DATE NOT NULL,
    course_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX idx_batch_name ON batches(batch_name);
CREATE INDEX idx_course_type ON batches(course_type);

-- Insert a test record
INSERT INTO batches (batch_name, batch_start, batch_end, course_type)
VALUES ('2023-2024', '2023-08-01', '2024-05-31', 'Degree'); 