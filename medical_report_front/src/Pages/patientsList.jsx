// PatientsList.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PatientsList = () => {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem('doctorId');
    if (!storedId) {
      toast.error('Doctor ID is missing!', { position: 'top-center' });
      setLoading(false);
      return;
    }
    setDoctorId(storedId);


    fetch(`http://127.0.0.1:5000/api/patients?doctor_id=${storedId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch patients');
        return res.json();
      })
      .then(data => {
        setPatients(data);
      })
      .catch(err => {
        toast.error(err.message, { position: 'top-center' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePatientClick = (patient) => {
    
    localStorage.setItem('currentPatient', JSON.stringify(patient));
    navigate(`/patient/${patient._id}`);
  };

  if (loading) return <p>Loading patients...</p>;

  return (
    <div className="page-container">
      <h2>Patients List</h2>
      {patients.length === 0 && <p>No patients found.</p>}
      <ul className="patients-list">
        {patients.map(patient => (
          <li
            key={patient._id}
            className="patient-item"
            onClick={() => handlePatientClick(patient)}
            style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '10px', marginBottom: '8px' }}
          >
            <b>{patient.name}</b> - Age: {patient.age}
          </li>
        ))}
      </ul>
      <ToastContainer />
    </div>
  );
};

export default PatientsList;
