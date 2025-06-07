import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import "../Styles/patientlist.css";
import Background from '../Components/Background';
import img1 from "../assets/background2.jpg"
import img2 from "../assets/background.jpg"

const PatientsList = () => {
  const arr=[img1,img2]
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 3;
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // For modal confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const fetchPatients = (doctorId, page, limit) => {
    setLoading(true);
    fetch(`http://127.0.0.1:5000/api/patients?doctor_id=${doctorId}&page=${page}&limit=${limit}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch patients');
        return res.json();
      })
      .then(data => {
        setPatients(data.patients || []);
        setTotalPages(data.total_pages || 1);
      })
      .catch(err => toast.error(err.message, { position: 'top-center' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const storedId = localStorage.getItem('doctorId');
    if (!storedId) {
      toast.error('Doctor ID is missing!', { position: 'top-center' });
      setLoading(false);
      return;
    }
    setDoctorId(storedId);
    fetchPatients(storedId, page, limit);
  }, [page]);

  // Show modal and set patient to delete
  const confirmDeletePatient = (id) => {
    setPatientToDelete(id);
    setShowDeleteModal(true);
  };

  // Actually delete patient
  const handleDeletePatient = () => {
    fetch(`http://127.0.0.1:5000/api/patients/${patientToDelete}`, {
      method: "DELETE"
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to delete patient");
        }
        return res.json();
      })
      .then(data => {
        toast.success(data.message || "Patient deleted successfully", { position: 'top-center' });
        fetchPatients(doctorId, page, limit);
      })
      .catch(err => toast.error(err.message, { position: 'top-center' }))
      .finally(() => {
        setShowDeleteModal(false);
        setPatientToDelete(null);
      });
  };

  const handlePatientClick = (patient) => {
    localStorage.setItem('currentPatient', JSON.stringify(patient));
    navigate(`/patient/${patient._id}`);
  };

  const handleAddCase = (patientId) => {
    navigate(`/add-case/${patientId}`);
  };

  const handleViewCases = (patientId) => {
    navigate(`/patient-cases/${patientId}`);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="loading-text">Loading patients...</p>;

  return (
    <div className="patientlist-container">
      <h2 className="patientlist-title">Patients List</h2>

      <input
        type="text"
        className="search-input"
        placeholder="Search patients by name..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {filteredPatients.length === 0 ? (
        <p className="no-patients-text">No patients found.</p>
      ) : (
        <>
          <ul className="patientlist-ul">
            {filteredPatients.map(patient => (
              <li key={patient._id} className="patientlist-item">
                <div onClick={() => handlePatientClick(patient)} style={{ cursor: 'pointer' }}>
                  <b>{patient.name}</b> — Age: {patient.age}
                </div>
                <div className="patient-actions">
                  <button onClick={() => handleViewCases(patient._id)}>👁 View Cases</button>
                  <button onClick={() => handleAddCase(patient._id)}>➕ Add Case</button>
                  <button
                    onClick={() => confirmDeletePatient(patient._id)}
                    className="delete-btn"
                  >
                    🗑 Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="pagination-controls">
            <button onClick={handlePrevPage} disabled={page === 1}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={handleNextPage} disabled={page === totalPages}>Next</button>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this patient?</p>
            <div className="modal-buttons">
              <button onClick={handleDeletePatient} className="confirm-btn">Yes, Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
   <Background images={arr}/>
      <ToastContainer />
    </div>
  );
};

export default PatientsList;
