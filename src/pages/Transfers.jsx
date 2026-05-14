import { useState, useEffect } from 'react';
import { getTransfers, createTransfer, getBases, getEquipmentTypes } from '../utils/api';
import Modal from '../components/Modal';

function Transfers({ user }) {
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: '',
    equipmentTypeId: ''
  });
  const [formData, setFormData] = useState({
    fromBaseId: '',
    toBaseId: '',
    equipmentTypeId: '',
    quantity: '',
    transferDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [basesRes, equipmentRes] = await Promise.all([
        getBases(),
        getEquipmentTypes()
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(equipmentRes.data);
      if (user.baseId) {
        setFormData(prev => ({ ...prev, fromBaseId: user.baseId }));
      }
      loadTransfers();
    } catch (error) {
      console.error('Failed to load data');
    }
  };

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const response = await getTransfers(filters);
      setTransfers(response.data);
    } catch (error) {
      console.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.fromBaseId === formData.toBaseId) {
      alert('Cannot transfer to the same base');
      return;
    }
    try {
      await createTransfer(formData);
      setShowModal(false);
      setFormData({
        fromBaseId: user.baseId || '',
        toBaseId: '',
        equipmentTypeId: '',
        quantity: '',
        transferDate: new Date().toISOString().split('T')[0]
      });
      loadTransfers();
    } catch (error) {
      alert('Failed to create transfer');
    }
  };

  const canCreate = ['admin', 'base_commander', 'logistics_officer'].includes(user.role);

  return (
    <div className="container">
      <div className="page-header">
        <h1>🔄 Transfers</h1>
        {canCreate && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + New Transfer
          </button>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Transfer">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>From Base</label>
              <select
                value={formData.fromBaseId}
                onChange={(e) => setFormData({ ...formData, fromBaseId: e.target.value })}
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
              <label>To Base</label>
              <select
                value={formData.toBaseId}
                onChange={(e) => setFormData({ ...formData, toBaseId: e.target.value })}
                required
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
                value={formData.equipmentTypeId}
                onChange={(e) => setFormData({ ...formData, equipmentTypeId: e.target.value })}
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
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Transfer Date</label>
              <input
                type="date"
                value={formData.transferDate}
                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-success">Record Transfer</button>
        </form>
      </Modal>

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
        <button onClick={loadTransfers} className="btn btn-primary">Apply Filters</button>
      </div>

      <div className="card">
        <h2>📋 Transfer History</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : transfers.length === 0 ? (
          <div className="empty-state">
            <h3>No transfers found</h3>
            <p>Start by creating your first transfer</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>From Base</th>
                  <th>To Base</th>
                  <th>Equipment</th>
                  <th>Quantity</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(transfer => (
                  <tr key={transfer.id}>
                    <td>{new Date(transfer.transfer_date).toLocaleDateString()}</td>
                    <td><span className="badge badge-warning">{transfer.from_base_name}</span></td>
                    <td><span className="badge badge-success">{transfer.to_base_name}</span></td>
                    <td>{transfer.equipment_name}</td>
                    <td><strong>{transfer.quantity}</strong></td>
                    <td>{transfer.created_by_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transfers;
