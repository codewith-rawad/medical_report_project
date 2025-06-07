import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MedicalConditions = ({ userId }) => {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [searchCase, setSearchCase] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4;

  const fetchConditions = () => {
    setLoading(true);
    const params = new URLSearchParams({
      user_id: userId,
      patient_name: searchPatient,
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
        setConditions(data.conditions);
        setTotalPages(data.total_pages);
      })
      .catch(err => toast.error(err.message, { position: 'top-center' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConditions();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchConditions();
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this condition?")) return;
    fetch(`http://127.0.0.1:5000/api/conditions/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete condition');
        return res.json();
      })
      .then(data => {
        toast.success(data.message || 'Deleted successfully', { position: 'top-center' });
        // إعادة جلب البيانات مع تحديث الصفحة الحالية أو الرجوع إذا كانت الصفحة أصبحت فارغة
        if (conditions.length === 1 && page > 1) setPage(page - 1);
        else fetchConditions();
      })
      .catch(err => toast.error(err.message, { position: 'top-center' }));
  };

  return (
    <div className="medical-conditions-container">
      <h2>Medical Conditions</h2>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by patient name"
          value={searchPatient}
          onChange={e => setSearchPatient(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by clinical case"
          value={searchCase}
          onChange={e => setSearchCase(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : conditions.length === 0 ? (
        <p>No medical conditions found.</p>
      ) : (
        <>
          <ul className="conditions-list">
            {conditions.map(cond => (
              <li key={cond._id} className="condition-item">
                <h3>{cond.patient_name} (Age: {cond.age})</h3>
                <p><b>Clinical Case:</b> {cond.clinical_case}</p>
                <p><b>Report:</b></p>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{cond.report_base64}</pre>
                {cond.image_base64 && (
                  <img
                    src={`data:image/jpeg;base64,${cond.image_base64}`}
                    alt="Medical"
                    style={{ maxWidth: '300px', marginTop: '10px' }}
                  />
                )}
                <button onClick={() => handleDelete(cond._id)} className="delete-btn">
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="pagination-controls">
            <button onClick={() => page > 1 && setPage(page - 1)} disabled={page === 1}>
              Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => page < totalPages && setPage(page + 1)} disabled={page === totalPages}>
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
