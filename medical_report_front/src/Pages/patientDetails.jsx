import React, { useEffect, useState } from 'react';
import '../Styles/generate_report.css';
import { useNavigate, useParams } from 'react-router-dom'; // useParams لاستقبال patientId من رابط URL
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const GenerateKeywords = () => {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [report, setReport] = useState('');
  const [docxBase64, setDocxBase64] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [clinicalCase, setClinicalCase] = useState('');

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const navigate = useNavigate();
  const { patientId } = useParams();  // استلام patientId من رابط URL

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Your browser does not support speech recognition.');
    }

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/'); 
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser._id) {
        navigate('/');
      } else {
        setUserId(parsedUser._id);
      }
    } catch (err) {
      navigate('/');
    }
  }, [navigate, browserSupportsSpeechRecognition]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        setImageBase64(base64data);
      };
      reader.readAsDataURL(file);
    } else {
      setImageBase64('');
    }
  };

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
  };

  const stopListening = async () => {
    SpeechRecognition.stopListening();
    if (!transcript.trim()) {
      toast.error('No speech detected to parse.');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:5000/api/parse_patient_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();
      if (response.ok) {
        setClinicalCase(data.clinical_case || transcript);
        setPatientName(data.patient_name || patientName);
        setAge(data.age || age);
        toast.success('Patient info extracted successfully!', { position: 'top-center' });
      } else {
        toast.error(data.message || 'Failed to parse transcript.', { position: 'top-center' });
      }
    } catch {
      toast.error('Error connecting to NLP backend.', { position: 'top-center' });
    }
  };

  const handleModelChange = (e) => {
    const value = e.target.value;
    setSelectedModels((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  };

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Please upload an image.', { position: 'top-center' });
      return;
    }
    if (selectedModels.length === 0) {
      toast.error('Please select at least one model.', { position: 'top-center' });
      return;
    }
    if (!userId) {
      toast.error('User not authenticated. Please login again.', { position: 'top-center' });
      navigate('/');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('user_id', userId);
    selectedModels.forEach((model) => formData.append('models', model));

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/extract_keywords', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setKeywords(data.keywords || []);
        toast.success('Keywords extracted successfully!', { position: 'top-center' });
      } else {
        toast.error(data.error || 'Failed to extract keywords.', { position: 'top-center' });
      }
    } catch {
      toast.error('Server connection failed.', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (keywords.length === 0) {
      toast.error('No keywords extracted yet.', { position: 'top-center' });
      return;
    }
    if (!patientName.trim() || !age || !clinicalCase.trim()) {
      toast.error('Please fill patient info and clinical case.', { position: 'top-center' });
      return;
    }
    if (!userId) {
      toast.error('User not authenticated. Please login again.', { position: 'top-center' });
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          patient_id: patientId,  // إرسال patientId هنا
          keywords,
          transcript,
          patient_name: patientName,
          age,
          clinical_case: clinicalCase,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setReport(data.report);
        setDocxBase64(data.docx_base64 || null);
        setPdfBase64(data.pdf_base64 || null);
        toast.success('Report generated successfully!', { position: 'top-center' });
      } else {
        toast.error(data.error || 'Failed to generate report.', { position: 'top-center' });
      }
    } catch {
      toast.error('Server connection failed.', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const downloadDocxFromBase64 = (base64String, filename) => {
    if (!base64String) {
      toast.error('No Word document available for download.', { position: 'top-center' });
      return;
    }
    const linkSource = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64String}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = filename;
    downloadLink.click();
  };

  const downloadPdfFromBase64 = (base64String, filename) => {
    if (!base64String) {
      toast.error('No PDF document available for download.', { position: 'top-center' });
      return;
    }
    const linkSource = `data:application/pdf;base64,${base64String}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = filename;
    downloadLink.click();
  };

  const handleSaveCase = async () => {
    if (!patientId) {
      toast.error('Patient ID is required to save.', { position: 'top-center' });
      return;
    }
    if (!report) {
      toast.error('Generate report before saving.', { position: 'top-center' });
      return;
    }
    if (!imageBase64) {
      toast.error('Image is required to save.', { position: 'top-center' });
      return;
    }
    if (!userId) {
      toast.error('User not authenticated. Please login again.', { position: 'top-center' });
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,  // استخدم patientId هنا
          patient_name: patientName,
          age,
          clinical_case: clinicalCase,
          report,
          image_base64: imageBase64,
          user_id: userId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Medical case saved successfully!', { position: 'top-center' });
      } else {
        toast.error(data.error || 'Failed to save medical case.', { position: 'top-center' });
      }
    } catch {
      toast.error('Server connection failed.', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return <div>Loading or Redirecting...</div>;
  }

  return (
    <div className="generate-report-container">
      <ToastContainer />
      <h2>Generate Medical Report</h2>

      <form onSubmit={handleExtract}>
        <label>
          Upload Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        <fieldset>
          <legend>Select Models:</legend>
          <label>
            <input
              type="checkbox"
              value="yolo"
              checked={selectedModels.includes('yolo')}
              onChange={handleModelChange}
            />
            YOLO
          </label>
          <label>
            <input
              type="checkbox"
              value="resnet"
              checked={selectedModels.includes('resnet')}
              onChange={handleModelChange}
            />
            ResNet
          </label>
          <label>
            <input
              type="checkbox"
              value="densenet"
              checked={selectedModels.includes('densenet')}
              onChange={handleModelChange}
            />
            DenseNet
          </label>
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? 'Extracting Keywords...' : 'Extract Keywords'}
        </button>
      </form>

      <div className="patient-info-section">
        <h3>Patient Information</h3>
        <label>
          Patient ID (from URL): <strong>{patientId || 'N/A'}</strong>
        </label>
        <label>
          Name:
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Enter patient name"
            required
          />
        </label>
        <label>
          Age:
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            required
          />
        </label>
        <label>
          Clinical Case:
          <textarea
            value={clinicalCase}
            onChange={(e) => setClinicalCase(e.target.value)}
            placeholder="Enter clinical case or use voice input"
            rows={4}
          />
        </label>

        <div className="voice-control-buttons">
          <button type="button" onClick={startListening} disabled={listening}>
            Start Voice Input
          </button>
          <button type="button" onClick={stopListening} disabled={!listening}>
            Stop Voice Input
          </button>
        </div>
      </div>

      <div className="keywords-section">
        <h3>Extracted Keywords</h3>
        {keywords.length === 0 ? (
          <p>No keywords extracted yet.</p>
        ) : (
          <ul>
            {keywords.map((kw, idx) => (
              <li key={idx}>{kw}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="report-section">
        <button onClick={handleGenerateReport} disabled={loading}>
          {loading ? 'Generating Report...' : 'Generate Report'}
        </button>

        {report && (
          <>
            <h3>Medical Report</h3>
            <textarea value={report} readOnly rows={10} />
            <div className="download-buttons">
              <button
                onClick={() => downloadDocxFromBase64(docxBase64, `${patientId}_report.docx`)}
              >
                Download Word (.docx)
              </button>
              <button
                onClick={() => downloadPdfFromBase64(pdfBase64, `${patientId}_report.pdf`)}
              >
                Download PDF
              </button>
            </div>

            <button onClick={handleSaveCase} disabled={loading}>
              {loading ? 'Saving...' : 'Save Medical Case'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerateKeywords;
