import React, { useEffect, useState } from 'react';
import '../Styles/generate_report.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph } from 'docx';
import jsPDF from 'jspdf';
import Back1 from '../assets/about1.avif';
import Back2 from '../assets/about2.jpg';
import Background from '../Components/Background';

const GenerateKeywords = () => {
  const backgrounds = [Back1, Back2];
  const [image, setImage] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [report, setReport] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
    } else {
      const parsed = JSON.parse(storedUser);
      if (!parsed._id) {
        navigate('/');
      }
      setUserId(parsed._id);
    }
  }, []);

  const handleModelChange = (e) => {
    const value = e.target.value;
    setSelectedModels((prev) =>
      prev.includes(value) ? prev.filter((model) => model !== value) : [...prev, value]
    );
  };

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!image || selectedModels.length === 0) {
      toast.error('Please upload an image and select at least one model.', {
        position: 'top-center',
        theme: 'colored',
      });
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
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setKeywords(data.keywords || []);
        toast.success('Keywords extracted successfully!', {
          position: 'top-center',
          theme: 'colored',
        });
      } else {
        toast.error(data.error || 'Failed to extract keywords.', {
          position: 'top-center',
          theme: 'colored',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection failed.', {
        position: 'top-center',
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (keywords.length === 0) {
      toast.error('No keywords extracted yet.', {
        position: 'top-center',
        theme: 'colored',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          keywords: keywords
        })
      });

      const data = await response.json();
      if (response.ok) {
        setReport(data.report);
        toast.success('Report generated successfully!', {
          position: 'top-center',
          theme: 'colored',
        });
      } else {
        toast.error(data.error || 'Failed to generate report.', {
          position: 'top-center',
          theme: 'colored',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection failed.', {
        position: 'top-center',
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadWord = () => {
    const doc = new Document({
      sections: [
        {
          children: [new Paragraph(report)],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'report.docx');
    });
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    pdf.text(report, 10, 10);
    pdf.save('report.pdf');
  };

  return (
    <div className="gen-container">
      <ToastContainer />
      <h2 className="gen-title">Medical Report Generation</h2>

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
            <button onClick={handleDownloadPDF}>Download as PDF</button>
            <button onClick={handleDownloadWord}>Download as Word</button>
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
