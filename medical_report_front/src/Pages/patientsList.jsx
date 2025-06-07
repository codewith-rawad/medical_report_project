// PatientsList.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import "../Styles/patientList.css";

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
      .then(data => setPatients(data))
      .catch(err => {
        toast.error(err.message, { position: 'top-center' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePatientClick = (patient) => {
    localStorage.setItem('currentPatient', JSON.stringify(patient));
    navigate(`/patient/${patient._id}`);
  };

  if (loading) return <p className="loading-text">Loading patients...</p>;

  return (
    <div className="patientlist-container">
      <h2 className="patientlist-title">Patients List</h2>
      {patients.length === 0 ? (
        <p className="no-patients-text">No patients found.</p>
      ) : (
        <ul className="patientlist-ul">
          {patients.map(patient => (
            <li
              key={patient._id}
              className="patientlist-item"
              onClick={() => handlePatientClick(patient)}
            >
              <b>{patient.name}</b> — Age: {patient.age}
            </li>
          ))}
        </ul>
      )}
      <ToastContainer />
    </div>
  );
};

export default PatientsList;
