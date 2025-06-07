import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/MedicalCondition.css';
import back1 from "../assets/background.jpg"
import back2 from "../assets/background2.jpg"
import Background from '../Components/Background';
const MedicalConditions = () => {
  const arry=[back1,back2]
  const { patientId } = useParams();
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCase, setSearchCase] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conditionToDelete, setConditionToDelete] = useState(null);
  const [patientName, setPatientName] = useState('');
  const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


  const limit = 4;

  const fetchConditions = () => {
    if (!patientId) {
      toast.error('Patient ID is missing!');
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({
      patient_id: patientId,
      clinical_case: searchCase,
      date: searchDate,
      page,
      limit,
    });

    fetch(`http://127.0.0.1:5000/api/conditions?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch conditions');
        return res.json();
      })
      .then((data) => {
        setConditions(data.conditions || []);
        if (data.conditions?.length > 0) {
          setPatientName(data.conditions[0].patient_name || '');
        }
        setTotalPages(data.total_pages || 1);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  const confirmDelete = (conditionId) => {
    setConditionToDelete(conditionId);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!conditionToDelete) return;

    fetch(`http://127.0.0.1:5000/api/conditions/${conditionToDelete}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete condition');
        toast.success('Condition deleted successfully');
        setShowDeleteModal(false);
        fetchConditions();
      })
      .catch((err) => toast.error(err.message));
  };

  useEffect(() => {
    fetchConditions();
  }, [page, searchCase, searchDate, patientId]);

  return (
    <div className="medical-conditions-container">
      <h2 className="title">🩺 Medical Conditions</h2>
      <p className="subtitle">for {patientName || 'Loading...'}</p>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by clinical case"
          value={searchCase}
          onChange={(e) => setSearchCase(e.target.value)}
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
        <button onClick={() => setPage(1)}>Search</button>
      </div>

      {loading ? (
        <p className="loading-text">⏳ Loading...</p>
      ) : conditions.length === 0 ? (
        <p className="no-conditions-text">No medical conditions found.</p>
      ) : (
        <>
          <ul className="conditions-list">
            {conditions.map((cond) => (
              <li key={cond._id} className="condition-item">
                <div className="image-section">
                  {cond.image_base64 && (
                    <img
                      src={`data:image/jpeg;base64,${cond.image_base64}`}
                      alt="Medical"
                      className="condition-image"
                    />
                  )}
                </div>
                <div className="details-section">
                  <div className="header">
      
                    <span>Age: {cond.age}</span>
                    <br />
                   <p className="date">Created at: {formatDate(cond.created_at)}</p>

                  </div>
                  <p><strong>🧾 Clinical Case:</strong> {cond.clinical_case}</p>
                  <p><strong>📋 Report:</strong></p>
                  <pre className="report-text">{cond.report_base64}</pre>
                  <button className="delete-button" onClick={() => confirmDelete(cond._id)}>
                    🗑 Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="pagination-controls">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>⬅ Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next ➡</button>
          </div>
        </>
      )}

      {/* 🔴 Popup Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Are you sure?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
<Background images={arry}/>
      <ToastContainer />
    </div>
  );
};

export default MedicalConditions;
