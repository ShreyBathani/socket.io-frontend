import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SalesForm = ({ socket }) => {
  const [connected, setConnected] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    category: 'Electronics',
    amount: '',
    quantity: '',
    region: 'North',
    salesperson: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  useEffect(() => {
    if (!socket) return;

    setConnected(socket.connected);

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onSaleSubmitted = (data) => {
      console.log('✅ Sale submitted:', data);
      setSubmitting(false);
      setLastSale(data.sale);
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        product: '',
        category: 'Electronics',
        amount: '',
        quantity: '',
        region: 'North',
        salesperson: '',
      });

      // Hide success message after 4 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('saleSubmitted', onSaleSubmitted);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('saleSubmitted', onSaleSubmitted);
    };
  }, [socket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!socket || !connected) {
      alert('❌ Not connected to server');
      return;
    }

    if (!formData.product || !formData.amount || !formData.quantity || !formData.salesperson) {
      alert('⚠️ Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    socket.emit('newSale', formData);
  };

  return (
    <div style={styles.container}>
      {/* Success Popup */}
      {showSuccess && (
        <div style={styles.successPopup}>
          <div style={styles.successContent}>
            <div style={styles.successIcon}>🎉</div>
            <h3 style={styles.successTitle}>Sale Added Successfully!</h3>
            <div style={styles.successDetails}>
              <p><strong>Product:</strong> {lastSale?.product}</p>
              <p><strong>Amount:</strong> ${lastSale?.amount}</p>
              <p><strong>Quantity:</strong> {lastSale?.quantity}</p>
              <p><strong>Region:</strong> {lastSale?.region}</p>
            </div>
            <p style={styles.successNote}>✨ Dashboard updated in real-time!</p>
            <div style={styles.successActions}>
              <button 
                onClick={() => setShowSuccess(false)} 
                style={styles.continueButton}
              >
                ➕ Add Another Sale
              </button>
              <Link to="/sales-dashboard" style={styles.viewDashboardButton}>
                📊 View Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <h2 style={styles.title}>➕ Add New Sale</h2>
        <Link to="/sales-dashboard" style={styles.backButton}>
          ← Back to Dashboard
        </Link>
      </div>

      <p style={styles.status}>
        Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Product Name *</label>
            <input
              type="text"
              name="product"
              value={formData.product}
              onChange={handleChange}
              placeholder="e.g., Laptop, Phone, Tablet"
              style={styles.input}
              disabled={!connected || submitting}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.select}
              disabled={!connected || submitting}
              required
            >
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing">Clothing</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Amount ($) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g., 1200"
              min="1"
              step="0.01"
              style={styles.input}
              disabled={!connected || submitting}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 2"
              min="1"
              style={styles.input}
              disabled={!connected || submitting}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Region *</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              style={styles.select}
              disabled={!connected || submitting}
              required
            >
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Salesperson *</label>
            <input
              type="text"
              name="salesperson"
              value={formData.salesperson}
              onChange={handleChange}
              placeholder="e.g., John, Sarah, Mike"
              style={styles.input}
              disabled={!connected || submitting}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!connected || submitting}
          style={{
            ...styles.submitButton,
            ...((!connected || submitting) ? styles.submitButtonDisabled : {})
          }}
        >
          {submitting ? '⏳ Submitting...' : '✅ Submit Sale'}
        </button>
      </form>

      <div style={styles.infoBox}>
        <p style={styles.infoTitle}>💡 Real-Time Updates</p>
        <p style={styles.infoText}>
          Once you submit this form, the sales dashboard will update instantly for all connected users!
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
  },
  successPopup: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s',
  },
  successContent: {
    backgroundColor: '#282c34',
    padding: '3rem',
    borderRadius: '20px',
    border: '3px solid #10b981',
    textAlign: 'center',
    maxWidth: '500px',
    animation: 'slideUp 0.5s',
  },
  successIcon: {
    fontSize: '5rem',
    marginBottom: '1rem',
    animation: 'bounce 1s infinite',
  },
  successTitle: {
    color: '#10b981',
    fontSize: '2rem',
    marginBottom: '1.5rem',
  },
  successDetails: {
    backgroundColor: '#1a1a1a',
    padding: '1.5rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  successNote: {
    color: '#61dafb',
    fontSize: '1.1rem',
    marginBottom: '2rem',
    fontWeight: 'bold',
  },
  successActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  viewDashboardButton: {
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    color: '#61dafb',
    margin: 0,
  },
  backButton: {
    backgroundColor: '#6366f1',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  status: {
    fontSize: '1rem',
    marginBottom: '1.5rem',
    color: '#ccc',
  },
  form: {
    backgroundColor: '#282c34',
    padding: '2rem',
    borderRadius: '12px',
    border: '2px solid #61dafb',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: '#61dafb',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '2px solid #61dafb',
    backgroundColor: '#1a1a1a',
    color: 'white',
  },
  select: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '2px solid #61dafb',
    backgroundColor: '#1a1a1a',
    color: 'white',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '1rem',
    fontSize: '1.2rem',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  submitButtonDisabled: {
    backgroundColor: '#555',
    cursor: 'not-allowed',
  },
  infoBox: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#282c34',
    borderRadius: '12px',
    border: '2px solid #8b5cf6',
  },
  infoTitle: {
    color: '#8b5cf6',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  infoText: {
    color: '#ccc',
    margin: 0,
  },
};

export default SalesForm;
