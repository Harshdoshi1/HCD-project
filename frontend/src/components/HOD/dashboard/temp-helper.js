// Temporary helper function - DO NOT INCLUDE IN FINAL CODE
// This is just for reference to see what we need to add to the existing code

const addAbbreviationsToReport = (doc, yPos, pageWidth) => {
    // Add abbreviation explanations for the academic details section
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('ESE: End Semester Exam | CSE: Continuous Semester Evaluation | IA: Internal Assessment | TW: Term Work | Viva: Viva Voce', pageWidth / 2, yPos, { align: 'center' });
    return yPos + 10;
};