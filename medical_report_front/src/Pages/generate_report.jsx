import React, { useState } from 'react';
import '../Styles/generate_report.css'

const GenerateKeywords = () => {
  const [image, setImage] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleModelChange = (e) => {
    const value = e.target.value;
    setSelectedModels((prev) =>
      prev.includes(value)
        ? prev.filter((model) => model !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || selectedModels.length === 0 || !userId) {
      alert('يرجى رفع صورة وتحديد نموذج ومعرف المستخدم');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('user_id', userId);
    selectedModels.forEach((model) => formData.append('models', model));

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/models/extract_keywords', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setKeywords(data.keywords || []);
      } else {
        alert(data.error || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gen-container">
      <h2 className="gen-title">استخراج الكلمات المفتاحية</h2>

      <form className="gen-form" onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

        <input
          type="text"
          placeholder="معرف المستخدم (User ID)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

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
          <ul>
            {keywords.map((kw, index) => (
              <li key={index}>{kw}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GenerateKeywords;
