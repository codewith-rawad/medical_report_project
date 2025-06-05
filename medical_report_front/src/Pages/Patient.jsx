// AddPatient.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AddPatient = () => {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState(null);
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    address: '',
    medicalCases: [],
  });
  const [patientCreated, setPatientCreated] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('doctorId');
    if (storedId) {
      setDoctorId(storedId);
    } else {
      toast.error("Doctor ID is missing!", { position: "top-center" });
    }
  }, []);

  const handleChange = e => {
    setPatientData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!patientData.name.trim() || !patientData.age.trim()) {
      toast.error("Name and Age are required", { position: "top-center" });
      return;
    }

    if (!doctorId) {
      toast.error("Doctor ID is missing!", { position: "top-center" });
      return;
    }

    const payload = {
      doctor_id: doctorId,
      name: patientData.name,
      age: patientData.age,
      address: patientData.address,
      medical_cases: patientData.medicalCases,
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.text();
        toast.error(`Failed to add patient: ${error}`, { position: "top-center" });
        return;
      }

      const result = await res.json(); // assuming backend returns created patient
      toast.success('Patient added successfully!', { position: "top-center" });

      // حفظ بيانات المريض المضافة لاستخدامها في توليد التقرير
      localStorage.setItem('currentPatient', JSON.stringify(result));
      setPatientCreated(true); // إظهار الزر بعد النجاح
      setPatientData({ name: '', age: '', address: '', medicalCases: [] });

    } catch (error) {
      toast.error('Error adding patient.', { position: "top-center" });
      console.error(error);
    }
  };

  const handleGenerateReport = () => {
    navigate('/generate-keywords');
  };

  return (
    <div className="page-container">
      <h2>Add New Patient</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={patientData.name}
          onChange={handleChange}
          required
        />

        <label>Age:</label>
        <input
          type="number"
          name="age"
          value={patientData.age}
          onChange={handleChange}
          required
        />

        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={patientData.address}
          onChange={handleChange}
        />

        <button type="submit" className="save-btn">Add Patient</button>
      </form>


      {patientCreated && (
        <div style={{ marginTop: '20px', textAlign: 'center', color:"black" }}>
          <button className="generate_report" onClick={handleGenerateReport}>
            Generate Report messi
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AddPatient;
