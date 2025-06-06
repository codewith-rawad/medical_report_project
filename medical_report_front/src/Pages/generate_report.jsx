import React, { useEffect, useState } from 'react';
import '../Styles/generate_report.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Back1 from '../assets/about1.avif';
import Back2 from '../assets/about2.jpg';
import Background from '../Components/Background';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';


const GenerateKeywords = () => {
  const backgrounds = [Back1, Back2];
  const [image, setImage] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [report, setReport] = useState('');
  const [docxBase64, setDocxBase64] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [clinicalCase, setClinicalCase] = useState('');

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const navigate = useNavigate();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Browser does not support speech recognition.');
    }

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
    } else {
      const parsed = JSON.parse(storedUser);
      if (!parsed._id) navigate('/');
      setUserId(parsed._id);
    }
  }, [navigate, browserSupportsSpeechRecognition]);

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  const stopListening = async () => {
    SpeechRecognition.stopListening();

    try {
      const response = await fetch('http://127.0.0.1:5000/api/parse_patient_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();
      if (response.ok) {
        setPatientName(data.patient_name);
        setAge(data.age);
        setClinicalCase(data.clinical_case);
        toast.success('Patient info extracted successfully!', { position: 'top-center' });
      } else {
        toast.error(data.message || 'Failed to parse transcript', { position: 'top-center' });
      }
    } catch (error) {
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
    if (!image || selectedModels.length === 0) {
      toast.error('Please upload an image and select at least one model.', { position: 'top-center' });
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
    } catch (err) {
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
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          keywords,
          patient_name: patientName,
          age,
          clinical_case: clinicalCase
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
    } catch (err) {
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

  return (
    <div className="gen-container">
      <ToastContainer />
      <h2 className="gen-title">Medical Report Generation</h2>

      <div className="voice-input-section">
        <h3>Patient Info (via Voice) </h3>
        <button className="listen-btn" onClick={startListening}>🎤 Start Speaking</button>
        <button className="stop-btn" onClick={stopListening}>🛑 Stop & Fill</button>
        <p>Transcript: <i>{transcript} </i></p>

        <label>Patient Name:</label>
        <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} />

        <label>Age:</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />

        <label>Clinical Case:</label>
        <textarea value={clinicalCase} onChange={(e) => setClinicalCase(e.target.value)} rows={3} />
      </div>

      <form className="gen-form" onSubmit={handleExtract}>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

        <div className="checkbox-group">
          <label><input type="checkbox" value="yolo" onChange={handleModelChange} /> YOLO</label>
          <label><input type="checkbox" value="resnet" onChange={handleModelChange} /> ResNet</label>
          <label><input type="checkbox" value="mobilenet" onChange={handleModelChange} /> MobileNet</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? <div className="loader" /> : 'Extract Keywords'}
        </button>
      </form>

      {keywords.length > 0 && (
        <div className="keywords-box">
          <button onClick={() => setShowPopup(true)} className="keyword-btn">
            Show Extracted Keywords ({keywords.length})
          </button>
          <button onClick={handleGenerateReport} disabled={loading}>
            {loading ? <div className="loader" /> : 'Generate Report'}
          </button>
        </div>
      )}

      {report && (
        <div className="report-box">
          <h3>Generated Report:</h3>
          <textarea value={report} onChange={(e) => setReport(e.target.value)} rows={6} />
          <div className="download-buttons">
            <button onClick={() => downloadPdfFromBase64(pdfBase64, 'report.pdf')}>Download PDF</button>
            <button onClick={() => downloadDocxFromBase64(docxBase64, 'report.docx')}>Download Word</button>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Extracted Keywords</h3>
            <ul>{keywords.map((kw, i) => <li key={i}>{kw}</li>)}</ul>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}

      <Background images={backgrounds} />
    </div>
  );
};

export default GenerateKeywords;
