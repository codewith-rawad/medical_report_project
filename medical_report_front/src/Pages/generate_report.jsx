import React, { useEffect, useState } from 'react';
import '../Styles/generate_report.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GenerateKeywords = () => {
  const [image, setImage] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [prompt, setPrompt] = useState('');
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
      prev.includes(value)
        ? prev.filter((model) => model !== value)
        : [...prev, value]
    );
  };

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!image || selectedModels.length === 0) {
      toast.error('Please upload an image and select at least one model.',{ position: 'top-center',
        theme: 'colored',})
      
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
        toast.success('Keywords extracted successfully!',{
             position: 'top-center',
        theme: 'colored',
        })
      } else {
        toast.error(data.error || 'Error extracting keywords',{
             position: 'top-center',
        theme: 'colored',
        })
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection failed',{
         position: 'top-center',
        theme: 'colored',
      })
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (keywords.length === 0) {
      toast.error('No keywords extracted',{
         position: 'top-center',
        theme: 'colored',
      })
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          keywords: keywords,
          prompt: prompt
        })
      });

      const data = await response.json();
      if (response.ok) {
        setReport(data.report);
        toast.success('Report generated successfully!',{
             position: 'top-center',
        theme: 'colored',
        })
      } else {
        toast.error(data.error || 'Failed to generate report',{
             position: 'top-center',
        theme: 'colored',
        })
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to server',{
         position: 'top-center',
        theme: 'colored',
      })
    }
  };

  return (
    <div className="gen-container">
      <ToastContainer />

      <h2 className="gen-title">Extract Medical Keywords</h2>

      <form className="gen-form" onSubmit={handleExtract}>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

        <div className="checkbox-group">
          <label><input type="checkbox" value="yolo" onChange={handleModelChange} /> YOLO</label>
          <label><input type="checkbox" value="resnet" onChange={handleModelChange} /> ResNet</label>
          <label><input type="checkbox" value="mobilenet" onChange={handleModelChange} /> MobileNet</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Extract Keywords'}
        </button>
      </form>

      {keywords.length > 0 && (
        <div className="keywords-box">
          <button onClick={() => setShowPopup(true)} className="keyword-btn">
            Show Extracted Keywords ({keywords.length})
          </button>

          <textarea
            placeholder="Optional: Write your own prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          ></textarea>

          <button onClick={handleGenerateReport}>Generate Report</button>
        </div>
      )}

      {report && (
        <div className="keywords-box">
          <h3>Generated Report:</h3>
          <p>{report}</p>
        </div>
      )}

      {/* Popup on demand */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Extracted Keywords</h3>
            <ul>{keywords.map((kw, i) => <li key={i}>{kw}</li>)}</ul>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateKeywords;
