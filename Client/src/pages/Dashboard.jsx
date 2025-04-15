import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [toUpiId, setToUpiId] = useState('');
  const [amount, setAmount] = useState('');

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

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome to SimUPI ⚡</h2>
      <h4>Balance: ₹{balance}</h4>

      <div style={{ marginTop: '2rem' }}>
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

      <div style={{ marginTop: '2rem' }}>
        <h4>Transaction History:</h4>
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <ul>
            {transactions.map((tx, index) => (
              <li key={index}>
                <strong>{tx.type === 'sent' ? 'Sent to' : 'Received from'}:</strong> {tx.toUpiId} | ₹{tx.amount}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
