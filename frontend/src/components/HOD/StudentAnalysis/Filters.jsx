import React from 'react';
import './studentAnalysisFilters.css';

const Filters = ({
    selectedBatch,
    setSelectedBatch,
    selectedSemester,
    setSelectedSemester,
    selectedCategory,
    setSelectedCategory
}) => {
    const batches = ["2022-26", "2021-25", "2020-24", "2019-23"];
    const semesters = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];
    const categories = ["Curricular Activity", "Co-curricular Activity", "Extra-curricular Activity"];

    return (
        <div className="filters-container-student-analysis">
            <div className="filter-group-student-analysis">
                <label htmlFor="batch">Batch:</label>
                <select
                    id="batch"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                >
                    {batches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group-student-analysis">
                <label htmlFor="semester">Semester:</label>
                <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                >
                    {semesters.map(semester => (
                        <option key={semester} value={semester}>{semester}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group-student-analysis">
                <label htmlFor="category">Category:</label>
                <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Filters;
