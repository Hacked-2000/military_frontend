import { useState, useEffect } from 'react';
import { getAssignments, createAssignment, getExpenditures, createExpenditure, getBases, getEquipmentTypes } from '../utils/api';
import Modal from '../components/Modal';

function Assignments({ user }) {
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: '',
    equipmentTypeId: ''
  });
  const [assignmentForm, setAssignmentForm] = useState({
    baseId: '',
    equipmentTypeId: '',
    quantity: '',
    assignedTo: '',
    assignmentDate: new Date().toISOString().split('T')[0]
  });
  const [expenditureForm, setExpenditureForm] = useState({
    baseId: '',
    equipmentTypeId: '',
    quantity: '',
    expenditureDate: new Date().toISOString().split('T')[0],
    reason: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'assignments') {
      loadAssignments();
    } else {
      loadExpenditures();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [basesRes, equipmentRes] = await Promise.all([
        getBases(),
        getEquipmentTypes()
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(equipmentRes.data);
      if (user.baseId) {
        setAssignmentForm(prev => ({ ...prev, baseId: user.baseId }));
        setExpenditureForm(prev => ({ ...prev, baseId: user.baseId }));
      }
      loadAssignments();
    } catch (error) {
      console.error('Failed to load data');
    }
  };

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const response = await getAssignments(filters);
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadExpenditures = async () => {
    setLoading(true);
    try {
      const response = await getExpenditures(filters);
      setExpenditures(response.data);
    } catch (error) {
      console.error('Failed to load expenditures');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAssignment(assignmentForm);
      setShowModal(false);
      setAssignmentForm({
        baseId: user.baseId || '',
        equipmentTypeId: '',
        quantity: '',
        assignedTo: '',
        assignmentDate: new Date().toISOString().split('T')[0]
      });
      loadAssignments();
    } catch (error) {
      alert('Failed to create assignment');
    }
  };

  const handleExpenditureSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExpenditure(expenditureForm);
      setShowModal(false);
      setExpenditureForm({
        baseId: user.baseId || '',
        equipmentTypeId: '',
        quantity: '',
        expenditureDate: new Date().toISOString().split('T')[0],
        reason: ''
      });
      loadExpenditures();
    } catch (error) {
      alert('Failed to create expenditure');
    }
  };

  const canCreate = ['admin', 'base_commander'].includes(user.role);

  return (
    <div className="container">
      <div className="page-header">
        <h1>👥 Assignments & Expenditures</h1>
        {canCreate && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + New {activeTab === 'assignments' ? 'Assignment' : 'Expenditure'}
          </button>
        )}
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={activeTab === 'assignments' ? 'Record Assignment' : 'Record Expenditure'}
      >
        {activeTab === 'assignments' ? (
          <form onSubmit={handleAssignmentSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Base</label>
                <select
                  value={assignmentForm.baseId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, baseId: e.target.value })}
                  required
                  disabled={user.role === 'base_commander'}
                >
                  <option value="">Select Base</option>
                  {bases.map(base => (
                    <option key={base.id} value={base.id}>{base.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Equipment Type</label>
                <select
                  value={assignmentForm.equipmentTypeId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, equipmentTypeId: e.target.value })}
                  required
                >
                  <option value="">Select Equipment</option>
                  {equipmentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={assignmentForm.quantity}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, quantity: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <input
                  type="text"
                  value={assignmentForm.assignedTo}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, assignedTo: e.target.value })}
                  required
                  placeholder="Personnel name"
                />
              </div>
              <div className="form-group">
                <label>Assignment Date</label>
                <input
                  type="date"
                  value={assignmentForm.assignmentDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, assignmentDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">Record Assignment</button>
          </form>
        ) : (
          <form onSubmit={handleExpenditureSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Base</label>
                <select
                  value={expenditureForm.baseId}
                  onChange={(e) => setExpenditureForm({ ...expenditureForm, baseId: e.target.value })}
                  required
                  disabled={user.role === 'base_commander'}
                >
                  <option value="">Select Base</option>
                  {bases.map(base => (
                    <option key={base.id} value={base.id}>{base.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Equipment Type</label>
                <select
                  value={expenditureForm.equipmentTypeId}
                  onChange={(e) => setExpenditureForm({ ...expenditureForm, equipmentTypeId: e.target.value })}
                  required
                >
                  <option value="">Select Equipment</option>
                  {equipmentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={expenditureForm.quantity}
                  onChange={(e) => setExpenditureForm({ ...expenditureForm, quantity: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Expenditure Date</label>
                <input
                  type="date"
                  value={expenditureForm.expenditureDate}
                  onChange={(e) => setExpenditureForm({ ...expenditureForm, expenditureDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Reason</label>
                <input
                  type="text"
                  value={expenditureForm.reason}
                  onChange={(e) => setExpenditureForm({ ...expenditureForm, reason: e.target.value })}
                  placeholder="Reason for expenditure"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">Record Expenditure</button>
          </form>
        )}
      </Modal>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => { setActiveTab('assignments'); setShowModal(false); }}
            className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-secondary'}`}
          >
            👥 Assignments
          </button>
          <button
            onClick={() => { setActiveTab('expenditures'); setShowModal(false); }}
            className={`btn ${activeTab === 'expenditures' ? 'btn-primary' : 'btn-secondary'}`}
          >
            💥 Expenditures
          </button>
        </div>
      </div>

      <div className="card filter-section">
        <h3>🔍 Filters</h3>
        <div className="grid grid-4">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          {user.role === 'admin' && (
            <div className="form-group">
              <label>Base</label>
              <select value={filters.baseId} onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}>
                <option value="">All Bases</option>
                {bases.map(base => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Equipment Type</label>
            <select value={filters.equipmentTypeId} onChange={(e) => setFilters({ ...filters, equipmentTypeId: e.target.value })}>
              <option value="">All Types</option>
              {equipmentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={activeTab === 'assignments' ? loadAssignments : loadExpenditures} className="btn btn-primary">
          Apply Filters
        </button>
      </div>

      <div className="card">
        <h2>📋 {activeTab === 'assignments' ? 'Assignment History' : 'Expenditure History'}</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : activeTab === 'assignments' ? (
          assignments.length === 0 ? (
            <div className="empty-state">
              <h3>No assignments found</h3>
              <p>Start by creating your first assignment</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Base</th>
                    <th>Equipment</th>
                    <th>Quantity</th>
                    <th>Assigned To</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(assignment => (
                    <tr key={assignment.id}>
                      <td>{new Date(assignment.assignment_date).toLocaleDateString()}</td>
                      <td><span className="badge badge-info">{assignment.base_name}</span></td>
                      <td>{assignment.equipment_name}</td>
                      <td><strong>{assignment.quantity}</strong></td>
                      <td>{assignment.assigned_to}</td>
                      <td>{assignment.created_by_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          expenditures.length === 0 ? (
            <div className="empty-state">
              <h3>No expenditures found</h3>
              <p>Start by creating your first expenditure</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Base</th>
                    <th>Equipment</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.map(expenditure => (
                    <tr key={expenditure.id}>
                      <td>{new Date(expenditure.expenditure_date).toLocaleDateString()}</td>
                      <td><span className="badge badge-info">{expenditure.base_name}</span></td>
                      <td>{expenditure.equipment_name}</td>
                      <td><strong>{expenditure.quantity}</strong></td>
                      <td>{expenditure.reason || '-'}</td>
                      <td>{expenditure.created_by_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Assignments;
