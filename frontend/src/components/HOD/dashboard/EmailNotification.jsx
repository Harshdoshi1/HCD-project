import React, { useState } from 'react';
import { Mail, FileText } from 'lucide-react';
import './EmailNotification.css';

const EmailNotification = ({ students, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [emailSubject, setEmailSubject] = useState('Semester Performance Report');
  const [emailContent, setEmailContent] = useState('');
  const [includeParents, setIncludeParents] = useState(true);
  const [includeDetailedReport, setIncludeDetailedReport] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [reportFormat, setReportFormat] = useState('pdf');

  const batches = ['all', ...new Set(students.map(student => student.batch))];
  const semesters = ['all', ...new Set(students.map(student => student.semester))];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (e, studentId) => {
    if (e.target.checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const generateIndividualReport = (student) => {
    const totalPoints = student.points.curricular +
      student.points.coCurricular +
      student.points.extraCurricular;
    const avgPoints = totalPoints / 3;

    return `
Performance Report for ${student.name} (${student.rollNo})
Semester: ${student.semester}

Overall Performance Summary:
- Total Points: ${totalPoints}
- Average Points: ${avgPoints.toFixed(2)}

Category Breakdown:
1. Curricular Activities: ${student.points.curricular} points
2. Co-Curricular Activities: ${student.points.coCurricular} points
3. Extra-Curricular Activities: ${student.points.extraCurricular} points

Strengths:
${Object.entries(student.points)
        .sort(([, a], [, b]) => b - a)[0][0] === 'curricular' ? '- Strong academic performance' :
        Object.entries(student.points)
          .sort(([, a], [, b]) => b - a)[0][0] === 'coCurricular' ? '- Excellence in technical activities' :
          '- Active participation in extra-curricular activities'}

Areas for Improvement:
${Object.entries(student.points)
        .sort(([, a], [, b]) => a - b)[0][0] === 'curricular' ? '- Focus on academic performance' :
        Object.entries(student.points)
          .sort(([, a], [, b]) => a - b)[0][0] === 'coCurricular' ? '- Increase participation in technical activities' :
          '- Consider joining more extra-curricular activities'}

Historical Progress:
${student.history ?
        student.history.map(h => `Semester ${h.semester}: 
  - Curricular: ${h.points.curricular}
  - Co-Curricular: ${h.points.coCurricular}
  - Extra-Curricular: ${h.points.extraCurricular}`).join('\n\n') :
        'No historical data available'}
    `;
  };

  const handleSendEmails = () => {
    const emailPromises = selectedStudents.map(studentId => {
      const student = students.find(s => s.id === studentId);
      const individualReport = generateIndividualReport(student);

      console.log('Sending email for:', student.name);
      console.log('Report:', individualReport);
      console.log('Include Parents:', includeParents);
      console.log('Report Format:', reportFormat);
    });

    alert(`Reports would be sent to ${selectedStudents.length} students ${includeParents ? 'and their parents' : ''} in ${reportFormat.toUpperCase()} format.`);
    onClose();
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = selectedBatch === 'all' || student.batch === selectedBatch;
    const matchesSemester = selectedSemester === 'all' || student.semester === selectedSemester;

    return matchesSearch && matchesBatch && matchesSemester;
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-container email-modal">
        <div className="modal-header">
          <h2>Send Performance Reports</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-content">
          <div className="email-form">
            <div className="form-group">
              <label>Email Subject:</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Email Message:</label>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="form-control"
                rows="5"
                placeholder="Enter additional message to include with the report..."
              ></textarea>
            </div>

            <div className="form-options">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="includeParents"
                  checked={includeParents}
                  onChange={(e) => setIncludeParents(e.target.checked)}
                />
                <label htmlFor="includeParents">
                  <Mail className="icon" size={16} />
                  Send copies to parents
                </label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  id="includeDetailedReport"
                  checked={includeDetailedReport}
                  onChange={(e) => setIncludeDetailedReport(e.target.checked)}
                />
                <label htmlFor="includeDetailedReport">
                  <FileText className="icon" size={16} />
                  Include detailed performance analysis
                </label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  id="includeCharts"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                />
                <label htmlFor="includeCharts">Include visual charts</label>
              </div>

              <div className="format-select">
                <label>Report Format:</label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="form-control"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                </select>
              </div>
            </div>
          </div>

          <div className="student-selection">
            <div className="selection-header">
              <h3>Select Students</h3>

              <div className="filter-controls">
                <div className="search-control">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                  />
                </div>

                <div className="filter-group">
                  <select value={selectedBatch} onChange={handleBatchChange}>
                    {batches.map(batch => (
                      <option key={batch} value={batch}>
                        {batch === 'all' ? 'All Batches' : `Batch ${batch}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <select value={selectedSemester} onChange={handleSemesterChange}>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>
                        {semester === 'all' ? 'All Semesters' : `Semester ${semester}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="selection-table">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedStudents.length === students.length && students.length > 0}
                      />
                    </th>
                    <th>Name</th>
                    <th>Roll No.</th>
                    <th>Batch</th>
                    <th>Semester</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => handleSelectStudent(e, student.id)}
                          />
                        </td>
                        <td>{student.name}</td>
                        <td>{student.rollNo}</td>
                        <td>{student.batch}</td>
                        <td>{student.semester}</td>
                        <td>
                          <div className="performance-bar">
                            <div className="bar" style={{ width: `${student.points.curricular / 100 * 100}%` }}></div>
                            <div className="bar" style={{ width: `${student.points.coCurricular / 100 * 100}%` }}></div>
                            <div className="bar" style={{ width: `${student.points.extraCurricular / 100 * 100}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No students match the selected filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="selected-count">
            {selectedStudents.length} students selected
          </div>
          <div className="action-buttons">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className="btn-send"
              onClick={handleSendEmails}
              disabled={selectedStudents.length === 0 || !emailSubject || !emailContent}
            >
              Send Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotification;
