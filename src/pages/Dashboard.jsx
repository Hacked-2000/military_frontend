import { useState, useEffect } from 'react';
import { getDashboardMetrics, getBases, getEquipmentTypes } from '../utils/api';

function Dashboard({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: '',
    equipmentTypeId: ''
  });
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

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
      loadMetrics();
    } catch (error) {
      console.error('Failed to load data');
    }
  };

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const response = await getDashboardMetrics(filters);
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    loadMetrics();
  };

  if (loading && !metrics) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>📊 Dashboard</h1>
      </div>

      <div className="card filter-section">
        <h3>🔍 Filters</h3>
        <div className="grid grid-4">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          {user.role === 'admin' && (
            <div className="form-group">
              <label>Base</label>
              <select name="baseId" value={filters.baseId} onChange={handleFilterChange}>
                <option value="">All Bases</option>
                {bases.map(base => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Equipment Type</label>
            <select name="equipmentTypeId" value={filters.equipmentTypeId} onChange={handleFilterChange}>
              <option value="">All Types</option>
              {equipmentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={applyFilters} className="btn btn-primary">Apply Filters</button>
      </div>

      {metrics && (
        <>
          <div className="grid grid-4">
            <div className="stat-card">
              <div className="stat-icon blue">📦</div>
              <h3>Opening Balance</h3>
              <div className="metric-value">{metrics.openingBalance}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <h3>Closing Balance</h3>
              <div className="metric-value">{metrics.closingBalance}</div>
            </div>
            <div className="stat-card clickable" onClick={() => setShowDetails(!showDetails)}>
              <div className="stat-icon orange">📈</div>
              <h3>Net Movement</h3>
              <div className="metric-value">{metrics.netMovement}</div>
              <small>Click for details</small>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">👥</div>
              <h3>Assigned</h3>
              <div className="metric-value">{metrics.assigned}</div>
            </div>
          </div>

          {showDetails && (
            <div className="card details-card">
              <h2>📊 Net Movement Details</h2>
              <div className="grid grid-3">
                <div className="stat-card">
                  <div className="stat-icon green">🛒</div>
                  <h4>Purchases</h4>
                  <div className="detail-value">{metrics.purchases}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon blue">📥</div>
                  <h4>Transfer In</h4>
                  <div className="detail-value">{metrics.transfersIn}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange">📤</div>
                  <h4>Transfer Out</h4>
                  <div className="detail-value">{metrics.transfersOut}</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-2">
            <div className="stat-card">
              <div className="stat-icon red">💥</div>
              <h3>Expended</h3>
              <div className="metric-value">{metrics.expended}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
