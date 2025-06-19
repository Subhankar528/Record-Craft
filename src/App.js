import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';
import outrLogo from './assets/images/outr-logo.png';

function App() {
    // --- State Management ---
    const [formData, setFormData] = useState({
        faculty1: '', // Changed to empty string to be optional initially
        faculty2: '', // Changed to empty string to be optional initially
        studentName: '',
        regdNo: '',
        branch: '',
        section: '',
        semester: '',
        group: '',
        department: 'SCHOOL OF COMPUTER SCIENCES', // Initial value for department
        labName: 'INTERNET AND WEB TECHNOLOGY' // Initial value for lab name
    });
    const [isReady, setIsReady] = useState(false); // Indicates if assets are loaded and PDF generation is possible
    const pdfContentRef = useRef(null); // Ref to the content element to be captured for PDF

    // --- Data Definitions ---
    const semesters = [
        { value: '', label: 'Select Semester' },
        { value: '1', label: '1st' }, // Changed from '1st Semester'
        { value: '2', label: '2nd' }, // Changed from '2nd Semester'
        { value: '3', label: '3rd' }, // Changed from '3rd Semester'
        { value: '4', label: '4th' }, // Changed from '4th Semester'
        { value: '5', label: '5th' }, // Changed from '5th Semester'
        { value: '6', label: '6th' }, // Changed from '6th Semester'
        { value: '7', label: '7th' }, // Changed from '7th Semester'
        { value: '8', label: '8th' }  // Changed from '8th Semester'
    ];

    // --- Effects ---
    // Sets isReady to true once the component mounts, signifying assets are ready
    useEffect(() => {
        setIsReady(true);
    }, []);

    // --- Event Handlers ---
    const handleChange = useCallback((e) => {
        const { id, value, name } = e.target;
        const fieldKey = id || name; 
        if (fieldKey) {
            setFormData(prev => ({ ...prev, [fieldKey]: value }));
        } else {
            console.warn("Input element missing id or name attribute for change handler", e.target);
        }
    }, []);

    // --- PDF and Print Logic ---
    const downloadPDF = useCallback(async () => {
        const elementToCapture = pdfContentRef.current;

        if (!elementToCapture) {
            console.error("Error: PDF content element not found.");
            alert("Error: Could not find content to generate PDF.");
            return;
        }
        if (!isReady) {
            alert("Please wait for assets to load before generating the PDF.");
            return;
        }
        // Required fields for PDF generation (excluding faculty1 and faculty2)
        const requiredFields = ['studentName', 'regdNo', 'branch', 'group', 'semester', 'department', 'labName'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.map(f => {
                // Nicer names for alerts
                if (f === 'regdNo') return 'Registration Number';
                if (f === 'labName') return 'Lab Name';
                return f.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase());
            }).join(', ')}.`);
            return;
        }

        console.log("Attempting PDF generation...");

        try {
            const elementClone = elementToCapture.cloneNode(true);
            elementClone.style.position = 'absolute';
            elementClone.style.left = '-9999px';
            elementClone.style.width = '210mm';
            document.body.appendChild(elementClone);

            const canvas = await html2canvas(elementClone, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                letterRendering: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 210 * 3.78,
                windowHeight: 297 * 3.78,
                width: 210 * 3.78,
                height: 297 * 3.78
            });

            document.body.removeChild(elementClone);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(
                canvas.toDataURL('image/png', 1.0),
                'PNG',
                0,
                0,
                pdfWidth,
                pdfHeight
            );

            pdf.save(`${formData.labName.replace(/ /g, '_')}_Lab_Record.pdf`);

        } catch (error) {
            console.error("Error during PDF generation:", error);
            alert(`An error occurred while generating the PDF: ${error.message || error}`);
        }
    }, [formData, isReady]);

    const printDocument = useCallback(() => {
        if (!pdfContentRef.current) {
            console.error("Error: Print content element not found.");
            alert("Error: Could not find content to print.");
            return;
        }
        if (!isReady) {
            alert("Please wait for assets to load before printing.");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const content = pdfContentRef.current.outerHTML;
            const styles = `
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Times New Roman', Times, serif;
                        -webkit-print-color-adjust: exact;
                    }
                    .pdf-preview {
                        width: 210mm;
                        height: 297mm;
                        padding: 20mm 25mm;
                        box-sizing: border-box;
                    }
                    /* Ensure all preview styles are explicitly included for print */
                    .university-header { text-align: center; margin-bottom: 18mm; }
                    .university-header h1 { font-size: 20pt; font-weight: bold; text-transform: uppercase; margin: 0 0 5pt 0; line-height: 1.2; color: #000; }
                    .university-header h2 { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0 0 10pt 0; line-height: 1.2; color: #000; }
                    .university-header h3 { font-size: 18pt; font-weight: bold; text-transform: uppercase; color: #0056b3; margin: 15pt 0 0 0; line-height: 1.3; }
                    .logo-container { display: flex; justify-content: center; align-items: center; margin: 20mm auto; height: auto; max-height: 50mm; }
                    .logo-container img { display: block; max-height: 100%; width: auto; max-width: 60mm; }
                    .lab-title { text-align: center; margin: 0 auto 30mm auto; }
                    .lab-title h4 { font-size: 18pt; font-weight: bold; text-transform: uppercase; color: #0056b3; margin: 0 0 8pt 0; line-height: 1.3; }
                    .lab-title h5 { font-size: 16pt; font-weight: bold; text-transform: uppercase; color: #0056b3; margin: 0; line-height: 1.3; }
                    .submission-info { display: flex; justify-content: space-between; margin-top: 40mm; }
                    .submitted-to, .submitted-by { width: 48%; }
                    .section-label { font-size: 14pt; font-weight: bold; text-transform: uppercase; text-decoration: underline; color: #e74c3c; margin-bottom: 8mm; display: block; }
                    .submitted-to p, .submitted-by p { font-size: 12pt; margin: 0 0 6mm 0; line-height: 1.5; color: #000; word-wrap: break-word; }
                    .submitted-by p strong { font-weight: bold; margin-right: 5px; }
                </style>
            `;
            printWindow.document.write(`<html><head><title>Print Lab Record</title>${styles}</head><body>${content}</body></html>`);
            printWindow.document.close();
            printWindow.print();
        }
    }, [isReady]);

    // --- Render JSX ---
    return (
        <div className="app-container">
            <header className="app-header">
                <h1>RECORDCRAFT</h1>
                <p className="tagline">Elevating Lab Documentation</p>
                <p className="app-description">
                    Generate professional-looking lab records effortlessly. Say goodbye to formatting hassles!
                </p>
            </header>

            <div className="form-container">
                <div className="form-columns">
                    <div className="form-column">
                        <h2 className="section-title">Student Information</h2>
                        <div className="form-group">
                            <label htmlFor="studentName">Full Name</label>
                            <input
                                type="text"
                                id="studentName"
                                name="studentName"
                                value={formData.studentName}
                                onChange={handleChange}
                                placeholder="Your full name"
                                autoComplete="name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="regdNo">Registration Number</label>
                            <input
                                type="text"
                                id="regdNo"
                                name="regdNo"
                                value={formData.regdNo}
                                onChange={handleChange}
                                placeholder="e.g., 202401001"
                                autoComplete="off"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="branch">Branch</label>
                                <input
                                    type="text"
                                    id="branch"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    placeholder="e.g., IT, CSE, ECE"
                                    autoComplete="off"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="section">Section (Optional)</label>
                                <input
                                    type="text"
                                    id="section"
                                    name="section"
                                    value={formData.section}
                                    onChange={handleChange}
                                    placeholder="e.g., A, B1"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="group">Group</label>
                            <input
                                type="text"
                                id="group"
                                name="group"
                                value={formData.group}
                                onChange={handleChange}
                                placeholder="e.g., Group 1, Lab Group C"
                                autoComplete="off"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-column">
                        <h2 className="section-title">Course Details</h2>
                        <div className="form-group">
                            <label htmlFor="department">Department/School</label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="e.g., School of Engg., Dept. of CS"
                                autoComplete="organization"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="labName">Lab Name</label>
                            <input
                                type="text"
                                id="labName"
                                name="labName"
                                value={formData.labName}
                                onChange={handleChange}
                                placeholder="e.g., Data Structures Lab"
                                autoComplete="off"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="semester">Semester</label>
                            <select
                                id="semester"
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                required
                            >
                                {semesters.map(sem => (
                                    <option key={sem.value} value={sem.value}>
                                        {sem.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-column">
                        <h2 className="section-title">Faculty Information (Optional)</h2>
                        <div className="form-group">
                            <label htmlFor="faculty1">Faculty 1</label>
                            <input
                                type="text"
                                id="faculty1"
                                name="faculty1"
                                value={formData.faculty1}
                                onChange={handleChange}
                                placeholder="Name of Faculty 1"
                                autoComplete="off"
                                /* No 'required' here, as it's now optional */
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="faculty2">Faculty 2</label>
                            <input
                                type="text"
                                id="faculty2"
                                name="faculty2"
                                value={formData.faculty2}
                                onChange={handleChange}
                                placeholder="Name of Faculty 2 (Optional)"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        className="primary-btn"
                        onClick={downloadPDF}
                        disabled={
                            !isReady ||
                            !formData.studentName ||
                            !formData.regdNo ||
                            !formData.branch ||
                            !formData.group ||
                            !formData.semester ||
                            !formData.department ||
                            !formData.labName
                            // Faculty fields are now optional, removed from disable logic
                        }
                    >
                        {isReady ? 'Download PDF' : 'Loading...'}
                    </button>
                    <button className="secondary-btn" onClick={printDocument} disabled={!isReady}>
                        Print
                    </button>
                </div>
            </div>

            <div className="preview-container">
                <h2 className="preview-title">Document Preview</h2>
                <div className="preview-wrapper">
                    <div className="pdf-preview" id="pdf-content" ref={pdfContentRef}>
                        <div className="university-header">
                            <h1>ODISHA UNIVERSITY OF TECHNOLOGY AND RESEARCH,</h1>
                            <h2>GHATIKIA, BHUBANESWAR – 751003</h2>
                            <h3>{formData.department}</h3>
                        </div>

                        <div className="logo-container">
                            <img src={outrLogo} alt="University Logo" id="preview-logo" />
                        </div>

                        <div className="lab-title">
                            <h4>{formData.labName}</h4>
                            <h5>LAB RECORD</h5>
                        </div>

                        <div className="submission-info">
                            <div className="submitted-to">
                                {/* Render 'SUBMITTED TO:' and faculty names only if at least one faculty is entered */}
                                {(formData.faculty1 || formData.faculty2) && (
                                    <>
                                        <p className="section-label submitted-label">SUBMITTED TO:</p>
                                        {formData.faculty1 && <p>{formData.faculty1}</p>}
                                        {formData.faculty2 && <p>{formData.faculty2}</p>}
                                    </>
                                )}
                            </div>

                            <div className="submitted-by">
                                <p className="section-label submitted-label">SUBMITTED BY:</p>
                                <p><strong>NAME:</strong> {formData.studentName || '_____________________'}</p>
                                <p><strong>REGD. NO:</strong> {formData.regdNo || '_____________________'}</p>
                                <p><strong>BRANCH:</strong> {formData.branch || '_____________________'}</p>
                                {formData.section && <p><strong>SECTION:</strong> {formData.section}</p>}
                                <p><strong>GROUP:</strong> {formData.group || '_____'}</p>
                                <p><strong>SEMESTER:</strong> {semesters.find(s => s.value === formData.semester)?.label || `____`}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="preview-note">Note: This is a visual preview. The actual PDF will match this layout exactly.</p>
            </div>

            <footer className="app-footer">
                <p>&copy; 2025 RECORDCRAFT. All rights reserved.</p>
                <p className="funny-line">Making academic life a tad bit easier, one lab record at a time!</p>
            </footer>
        </div>
    );
}

export default App;