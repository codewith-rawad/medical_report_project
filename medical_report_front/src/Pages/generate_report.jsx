import React, { useEffect, useState } from 'react';
import '../Styles/generate_report.css';
import { useNavigate } from 'react-router-dom';

const GenerateKeywords = () => {
  const [image, setImage] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [report, setReport] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('يجب تسجيل الدخول أولًا');
      navigate('/login'); 
    } else {
      const parsed = JSON.parse(storedUser);
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
      alert('يرجى رفع صورة وتحديد نماذج');
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
      } else {
        alert(data.error || 'حدث خطأ أثناء استخراج الكلمات');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // ✅ توليد التقرير من الكلمات
  const handleGenerateReport = async () => {
    if (keywords.length === 0) {
      alert('لا توجد كلمات مستخرجة');
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
      } else {
        alert(data.error || 'فشل في توليد التقرير');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ أثناء الاتصال بالخادم');
    }
  };

  return (
    <div className="gen-container">
      <h2 className="gen-title">استخراج الكلمات المفتاحية</h2>

      <form className="gen-form" onSubmit={handleExtract}>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

        <div className="checkbox-group">
          <label><input type="checkbox" value="yolo" onChange={handleModelChange} /> YOLO</label>
          <label><input type="checkbox" value="resnet" onChange={handleModelChange} /> ResNet</label>
          <label><input type="checkbox" value="mobilenet" onChange={handleModelChange} /> MobileNet</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'جارٍ التوليد...' : 'استخرج الكلمات'}
        </button>
      </form>

      {keywords.length > 0 && (
        <div className="keywords-box">
          <h3>الكلمات المستخرجة:</h3>
          <ul>{keywords.map((kw, i) => <li key={i}>{kw}</li>)}</ul>

          <textarea
            placeholder="اكتب برومبت مخصص إن أردت"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          ></textarea>

          <button onClick={handleGenerateReport}>ولّد التقرير</button>
        </div>
      )}

      {report && (
        <div className="keywords-box">
          <h3>التقرير الناتج:</h3>
          <p>{report}</p>
        </div>
      )}
    </div>
  );
};

export default GenerateKeywords;
