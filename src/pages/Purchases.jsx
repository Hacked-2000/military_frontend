import { useState, useEffect } from 'react';
import { getPurchases, createPurchase, getBases, getEquipmentTypes } from '../utils/api';
import Modal from '../components/Modal';

function Purchases({ user }) {
  const [purchases, setPurchases] = useState([]);
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
    baseId: '',
    equipmentTypeId: '',
    quantity: '',
    purchaseDate: new Date().toISOString().split('T')[0]
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
        setFormData(prev => ({ ...prev, baseId: user.baseId }));
      }
      loadPurchases();
    } catch (error) {
      console.error('Failed to load data');
    }
  };

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const response = await getPurchases(filters);
      setPurchases(response.data);
    } catch (error) {
      console.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPurchase(formData);
      setShowModal(false);
      setFormData({
        baseId: user.baseId || '',
        equipmentTypeId: '',
        quantity: '',
        purchaseDate: new Date().toISOString().split('T')[0]
      });
      loadPurchases();
    } catch (error) {
      alert('Failed to create purchase');
    }
  };

  const canCreate = ['admin', 'base_commander', 'logistics_officer'].includes(user.role);

  return (
    <div className="container">
      <div className="page-header">
        <h1>🛒 Purchases</h1>
        {canCreate && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + New Purchase
          </button>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Purchase">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Base</label>
              <select
                value={formData.baseId}
                onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
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
              <label>Purchase Date</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-success">Record Purchase</button>
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
        <button onClick={loadPurchases} className="btn btn-primary">Apply Filters</button>
      </div>

      <div className="card">
        <h2>📋 Purchase History</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : purchases.length === 0 ? (
          <div className="empty-state">
            <h3>No purchases found</h3>
            <p>Start by creating your first purchase</p>
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
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                    <td><span className="badge badge-info">{purchase.base_name}</span></td>
                    <td>{purchase.equipment_name}</td>
                    <td><strong>{purchase.quantity}</strong></td>
                    <td>{purchase.created_by_name}</td>
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

export default Purchases;
