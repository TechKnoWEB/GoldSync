import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient.js';

function Records({ onRecordChange, setRecordCount }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch all records
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gold_calculations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
      if (setRecordCount) setRecordCount((data || []).length);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error(`❌ Failed to load records: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [setRecordCount]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Delete a record
  const handleDelete = async (id) => {
    setDeletingId(id);
    setConfirmDelete(null);

    try {
      const { error } = await supabase
        .from('gold_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('✅ Record deleted successfully!');
      await fetchRecords();
      if (onRecordChange) onRecordChange();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error(`❌ Failed to delete: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatNumber = (num) => Number(num).toFixed(4);
  const formatCash = (num) => Number(num).toFixed(2);

  const getBalanceClass = (bal) => {
    const numBal = parseFloat(bal);
    if (numBal > 0) return 'positive';
    if (numBal < 0) return 'negative';
    return '';
  };

  const getPaymentBadge = (mode) => {
    switch (mode) {
      case 'gold':
        return <span className="badge badge-gold">Gold</span>;
      case 'cash':
        return <span className="badge badge-cash">Cash</span>;
      case 'both':
        return <span className="badge badge-both">Gold+Cash</span>;
      default:
        return <span className="badge badge-none">—</span>;
    }
  };

  const filteredRecords = records.filter((record) =>
    record.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tab-content">
      <div className="card">
        <h2 className="card-title">
          📋 All Calculation Records ({filteredRecords.length})
        </h2>

        <div className="search-wrapper">
          <input
            type="text"
            className="form-input search-input"
            placeholder="🔍 Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Confirmation Dialog */}
        {confirmDelete && (
          <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
              <p className="confirm-message">
                ⚠️ Are you sure you want to delete this record?
              </p>
              <p className="confirm-sub">This action cannot be undone.</p>
              <div className="confirm-buttons">
                <button
                  className="btn btn-cancel"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-delete-confirm"
                  onClick={() => handleDelete(confirmDelete)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="empty-message">⏳ Loading records...</p>
        ) : filteredRecords.length === 0 ? (
          <p className="empty-message">
            {searchTerm
              ? 'No records match your search.'
              : 'No calculation records yet.'}
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table records-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Gold(g)</th>
                  <th>Purity%</th>
                  <th>Fine Gold</th>
                  <th>Cust.Fine</th>
                  <th>Balance</th>
                  <th>Paid Gold</th>
                  <th>Cash(₹)</th>
                  <th>Pay Mode</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.created_at)}</td>
                    <td className="name-cell">{record.customer_name}</td>
                    <td>{formatNumber(record.gold_input)}</td>
                    <td>{Number(record.purity_percent).toFixed(2)}%</td>
                    <td>{formatNumber(record.fine_gold)}</td>
                    <td>{formatNumber(record.customer_fine)}</td>
                    <td className={`balance-cell ${getBalanceClass(record.balance)}`}>
                      {formatNumber(record.balance)}
                    </td>
                    <td className="paid-gold-cell">
                      {formatNumber(record.paid_gold || 0)}
                    </td>
                    <td className="cash-cell">
                      ₹{formatCash(record.cash_payment || 0)}
                    </td>
                    <td>{getPaymentBadge(record.payment_mode)}</td>
                    <td>
                      <button
                        className="btn btn-delete"
                        onClick={() => setConfirmDelete(record.id)}
                        disabled={deletingId === record.id}
                        title="Delete this record"
                      >
                        {deletingId === record.id ? '⏳' : '🗑️'}
                      </button>
                    </td>
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

export default Records;