import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css'; // ✅ Your custom styles

function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [toUpiId, setToUpiId] = useState('');
  const [amount, setAmount] = useState('');

  const [emailToSearch, setEmailToSearch] = useState('');
  const [foundUpiId, setFoundUpiId] = useState('');

  const token = localStorage.getItem('token');

  const fetchBalanceAndTransactions = async () => {
    try {
      const balanceRes = await axios.get('http://localhost:8899/api/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(balanceRes.data.balance);

      const txRes = await axios.get('http://localhost:8899/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(txRes.data.transactions);
    } catch (err) {
      console.error('Error fetching balance or transactions:', err);
    }
  };

  useEffect(() => {
    fetchBalanceAndTransactions();
  }, []);

  const handleSend = async () => {
    if (!toUpiId || !amount || isNaN(amount)) {
      alert('Please enter valid UPI ID and amount');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:8899/api/send',
        { toUpiId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      setToUpiId('');
      setAmount('');
      fetchBalanceAndTransactions(); // Refresh data
    } catch (err) {
      console.error('Error sending money:', err);
      alert(err.response?.data?.message || 'Transaction failed');
    }
  };

  const handleFindUpi = async () => {
    try {
      const res = await axios.post('http://localhost:8899/api/get-upi-id', {
        email: emailToSearch,
      });
      setFoundUpiId(res.data.upiId);
    } catch (err) {
      alert('User not found');
      setFoundUpiId('');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>💸 SimUPI Dashboard</h2>

      <div className="balance-card">
        <h3>Current Balance</h3>
        <p>₹{balance}</p>
      </div>

      <div className="send-money">
        <h4>Send Money</h4>
        <input
          placeholder="Receiver UPI ID"
          value={toUpiId}
          onChange={(e) => setToUpiId(e.target.value)}
        />
        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>

      <div className="transactions">
        <h4>Transaction History</h4>
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <ul>
            {transactions.map((tx, index) => (
              <li key={index} className={tx.type === 'sent' ? 'sent' : 'received'}>
                <span>{tx.type === 'sent' ? 'Sent to' : 'Received from'}: {tx.toUpiId}</span>
                <strong>₹{tx.amount}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="find-upi">
        <h4>🔍 Find UPI ID by Email</h4>
        <input
          type="email"
          placeholder="Enter email"
          value={emailToSearch}
          onChange={(e) => setEmailToSearch(e.target.value)}
        />
        <button onClick={handleFindUpi}>Search</button>
        {foundUpiId && (
          <p style={{ marginTop: '1rem' }}>
            UPI ID: <strong>{foundUpiId}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
