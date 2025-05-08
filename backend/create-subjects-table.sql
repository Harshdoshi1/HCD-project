-- Drop the existing table if it exists
DROP TABLE IF EXISTS subjects;

-- Create the subjects table
CREATE TABLE subjects (
    id VARCHAR(50) PRIMARY KEY,
    subjectName VARCHAR(255) NOT NULL,
    semesterId INTEGER NOT NULL,
    batchId INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_subjects_semester ON subjects(semesterId);
CREATE INDEX idx_subjects_batch ON subjects(batchId);

-- Insert a test record
INSERT INTO subjects (id, subjectName, semesterId, batchId)
VALUES ('TEST101', 'Test Subject', 1, 1); 