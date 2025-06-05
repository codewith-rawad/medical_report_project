// PatientDetail.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const PatientDetail = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // الحالة المرضية الجديدة
  const [medicalImage, setMedicalImage] = useState(null);
  const [clinicalStory, setClinicalStory] = useState('');
  const [report, setReport] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    // تحميل بيانات المريض من backend أو localStorage (اختياري)
    const storedPatient = localStorage.getItem('currentPatient');
    if (storedPatient) {
      const p = JSON.parse(storedPatient);
      if (p._id === patientId) {
        setPatient(p);
        setLoading(false);
      } else {
        fetchPatientFromServer(patientId);
      }
    } else {
      fetchPatientFromServer(patientId);
    }
  }, [patientId]);

  const fetchPatientFromServer = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/patients/${id}`);
      if (!res.ok) throw new Error('Failed to fetch patient data');
      const data = await res.json();
      setPatient(data);
    } catch (error) {
      toast.error(error.message, { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  // رفع صورة الحالة المرضية
  const handleFileChange = e => {
    setMedicalImage(e.target.files[0]);
  };

  // إرسال الحالة المرضية مع الصورة والقصة السريرية
  const handleSubmit = async e => {
    e.preventDefault();

    if (!medicalImage) {
      toast.error('Please upload a medical image.', { position: 'top-center' });
      return;
    }

    if (!clinicalStory.trim()) {
      toast.error('Clinical story is required.', { position: 'top-center' });
      return;
    }

    try {
      // إنشاء FormData لإرسال الصورة مع البيانات
      const formData = new FormData();
      formData.append('image', medicalImage);
      formData.append('clinical_story', clinicalStory);

      // إرسال البيانات إلى API إضافة حالة مرضية جديدة
      const res = await fetch(`http://127.0.0.1:5000/api/patients/${patientId}/medical_cases`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.text();
        toast.error(`Failed to add medical case: ${error}`, { position: 'top-center' });
        return;
      }

      const addedCase = await res.json();

      toast.success('Medical case added successfully!', { position: 'top-center' });

      // بعد الإضافة يمكن توليد التقرير بناءً على الحالة الجديدة
      setClinicalStory('');
      setMedicalImage(null);

      // يمكنك هنا تحديث قائمة الحالات المرضية في الواجهة لو أردت

    } catch (error) {
      toast.error('Error adding medical case.', { position: 'top-center' });
      console.error(error);
    }
  };

  // توليد التقرير الطبي (مثال على استدعاء API خارجي لتوليد التقرير بناءً على الصورة والقصة)
  const handleGenerateReport = async () => {
    if (!patient) return;
    setGeneratingReport(true);
    try {
      // استدعاء API لتوليد تقرير طبي - عدلي الرابط والبرومبت حسب النظام لديك
      const res = await fetch(`http://127.0.0.1:5000/api/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient._id,
          clinical_story: clinicalStory,
          // ممكن ترسل معلومات أخرى حسب API لديك
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        toast.error(`Failed to generate report: ${err}`, { position: 'top-center' });
        setGeneratingReport(false);
        return;
      }

      const data = await res.json();
      setReport(data.report); // نص التقرير من السيرفر

      toast.success('Report generated successfully!', { position: 'top-center' });

    } catch (error) {
      toast.error('Error generating report.', { position: 'top-center' });
      console.error(error);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) return <p>Loading patient details...</p>;

  if (!patient) return <p>Patient not found.</p>;

  return (
    <div className="page-container">
      <h2>Patient Detail: {patient.name}</h2>
      <p><b>Age:</b> {patient.age}</p>
      <p><b>Address:</b> {patient.address}</p>

      <hr />

      <form onSubmit={handleSubmit} className="form-container">
        <label>Upload Medical Image:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <label>Clinical Story:</label>
        <textarea
          rows="5"
          value={clinicalStory}
          onChange={e => setClinicalStory(e.target.value)}
          required
        ></textarea>

        <button type="submit" className="save-btn" disabled={generatingReport}>Add Medical Case</button>
      </form>

      <hr />

      <button
        onClick={handleGenerateReport}
        className="generate_report"
        disabled={generatingReport || !clinicalStory.trim()}
      >
        {generatingReport ? 'Generating Report...' : 'Generate Report'}
      </button>

      {report && (
        <div className="report-container" style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
          <h3>Generated Report:</h3>
          <p>{report}</p>
        </div>
      )}

      <button
        style={{ marginTop: '20px' }}
        onClick={() => navigate('/patients')}
      >
        Back to Patients List
      </button>

      <ToastContainer />
    </div>
  );
};

export default PatientDetail;
