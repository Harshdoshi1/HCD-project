import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubjectDetailsModal.css';
import { buildUrl } from '../../../utils/apiConfig';

const SubjectDetailsModal = ({ isOpen, onClose, subject }) => {
    const [marksData, setMarksData] = useState(null);
    const [weightagesData, setWeightagesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && subject && subject.sub_code) {
            const fetchDetails = async () => {
                setLoading(true);
                setError(null); // Clear previous general error
                setMarksData(null);
                setWeightagesData(null);
                
                let marksFetchError = null;
                let weightagesFetchError = null;

                try {
                    const marksResponse = await axios.get(buildUrl(`/components/marksBySubject/${subject.sub_code}`));
                    setMarksData(marksResponse.data);
                } catch (err) {
                    console.error("Error fetching subject marks:", err);
                    marksFetchError = `Marks: ${(err.response?.data?.error || err.message || "Failed to fetch")}`;
                }

                try {
                    const weightagesResponse = await axios.get(buildUrl(`/weightages/weightagesBySubject/${subject.sub_code}`));
                    // API returns an array, typically we expect one weightage set per subject for this view
                    setWeightagesData(weightagesResponse.data && weightagesResponse.data.length > 0 ? weightagesResponse.data[0] : null);
                } catch (err) {
                    console.error("Error fetching subject weightages:", err);
                    weightagesFetchError = `Weightages: ${(err.response?.data?.error || err.message || "Failed to fetch")}`;
                }

                if (marksFetchError || weightagesFetchError) {
                    const combinedErrors = [];
                    if (marksFetchError) combinedErrors.push(marksFetchError);
                    if (weightagesFetchError) combinedErrors.push(weightagesFetchError);
                    setError(combinedErrors.join('; '));
                }
                
                setLoading(false);
            };
            fetchDetails();
        }
    }, [isOpen, subject]);

    if (!isOpen || !subject) {
        return null;
    }

    const renderTableData = () => {
        const components = ['ese', 'cse', 'ia', 'tw', 'viva'];
        return components.map(comp => (
            <tr key={comp}>
                <td>{comp.toUpperCase()}</td>
                <td>{marksData ? marksData[comp] : 'N/A'}</td>
                <td>{weightagesData ? weightagesData[comp] : 'N/A'}</td>
            </tr>
        ));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>{subject.sub_name} ({subject.sub_code})</h2>
                {loading && <p>Loading details...</p>}
                
                {error && <p className="error-message">{error}</p>}
                
                {!loading && (
                    <table className="details-table">
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th>Marks</th>
                                <th>Weightage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderTableData()} {/* This will show N/A for missing parts */}
                        </tbody>
                    </table>
                )}
                
                {!loading && !error && !marksData && !weightagesData && ( /* If no error, and both data sources are truly empty/null after successful fetches */
                    <p>No marks or weightage data currently available for this subject.</p>
                )}
            </div>
        </div>
    );
};

export default SubjectDetailsModal;
