import React, { useEffect, useState } from 'react';
import '../Styles/generate_report.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Back1 from '../assets/about1.avif';
import Back2 from '../assets/about2.jpg';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const GenerateKeywords = () => {
  // حالات State
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [report, setReport] = useState('');
  const [docxBase64, setDocxBase64] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [clinicalCase, setClinicalCase] = useState('');

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const navigate = useNavigate();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Your browser does not support speech recognition.');
    }

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
    } else {
      const parsed = JSON.parse(storedUser);
      if (!parsed._id) navigate('/');
      else setUserId(parsed._id);
    }
  }, [navigate, browserSupportsSpeechRecognition]);

  // لتحويل الصورة المرفوعة إلى Base64 فور اختيارها
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result.split(',')[1]); // خزن فقط بيانات base64 بدون data:image/...
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

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
    if (!patientName || !age || !clinicalCase) {
      toast.error('Please fill patient info and clinical case.', { position: 'top-center' });
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

  // دوال تحميل الملفات من base64 (كما في كودك الأصلي)
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

  // هنا نرسل بيانات الحالة كاملة كـ JSON مع صورة مرفوعة مسبقاً بصيغة base64
  const handleSaveCase = async () => {
    if (!patientName) {
      toast.error('Patient name is required to save.', { position: 'top-center' });
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

    try {
      const response = await fetch('http://127.0.0.1:5000/api/conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
    }
  };

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
          {/* أضف المزيد حسب الحاجة */}
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? 'Extracting...' : 'Extract Keywords'}
        </button>
      </form>

      <div>
        <h3>Extracted Keywords:</h3>
        <ul>
          {keywords.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Patient Information</h3>
        <label>
          Name:
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
        </label>
        <label>
          Age:
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </label>
        <label>
          Clinical Case:
          <textarea
            value={clinicalCase}
            onChange={(e) => setClinicalCase(e.target.value)}
            required
          />
        </label>

        <div>
          <button type="button" onClick={startListening} disabled={listening}>
            Start Recording Clinical Case
          </button>
          <button type="button" onClick={stopListening} disabled={!listening}>
            Stop Recording
          </button>
          <p>Transcript: {transcript}</p>
        </div>
      </div>

      <button onClick={handleGenerateReport} disabled={loading || keywords.length === 0}>
        {loading ? 'Generating Report...' : 'Generate Report'}
      </button>

      {report && (
        <div>
          <h3>Generated Report:</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{report}</pre>
          <button onClick={() => downloadDocxFromBase64(docxBase64, 'report.docx')}>Download Word</button>
          <button onClick={() => downloadPdfFromBase64(pdfBase64, 'report.pdf')}>Download PDF</button>
        </div>
      )}

      <button onClick={handleSaveCase} disabled={loading}>
        Save Case
      </button>
    </div>
  );
};

export default GenerateKeywords;
