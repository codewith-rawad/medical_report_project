import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MedicalConditions = () => {
  const { patientId } = useParams();
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCase, setSearchCase] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4;

  const fetchConditions = () => {
    if (!patientId) {
      toast.error('Patient ID is missing!', { position: 'top-center' });
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({
      patient_id: patientId,
      clinical_case: searchCase,
      page,
      limit
    });

    fetch(`http://127.0.0.1:5000/api/conditions?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch conditions');
        return res.json();
      })
      .then(data => {
        setConditions(data.conditions || []);
        setTotalPages(data.total_pages || 1);
      })
      .catch(err => toast.error(err.message, { position: 'top-center' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConditions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchCase, patientId]);

  const handleSearch = () => {
    setPage(1);
    fetchConditions();
  };

  return (
    <div className="medical-conditions-container">
      <h2>Medical Conditions for Patient ID: {patientId}</h2>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by clinical case"
          value={searchCase}
          onChange={e => setSearchCase(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : conditions.length === 0 ? (
        <p className="no-conditions-text">No medical conditions found.</p>
      ) : (
        <>
          <ul className="conditions-list">
            {conditions.map(cond => (
              <li key={cond._id} className="condition-item">
                <h3>{cond.patient_name} (Age: {cond.age})</h3>
                <p><strong>Clinical Case:</strong> {cond.clinical_case}</p>
                <p><strong>Report:</strong></p>
                <pre className="report-text">{cond.report_base64}</pre>
                {cond.image_base64 && (
                  <img
                    src={`data:image/jpeg;base64,${cond.image_base64}`}
                    alt="Medical"
                    className="condition-image"
                  />
                )}
              </li>
            ))}
          </ul>

          <div className="pagination-controls">
            <button
              onClick={() => page > 1 && setPage(page - 1)}
              disabled={page === 1}
              className="pagination-button"
            >
              Prev
            </button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button
              onClick={() => page < totalPages && setPage(page + 1)}
              disabled={page === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default MedicalConditions;
