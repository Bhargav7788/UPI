import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // ✅ React Router hook

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8899/api/auth/login', {
        email,
        password,
      });

      alert('Login successful!');
      localStorage.setItem('token', res.data.token); // ✅ Save token
      localStorage.setItem('upiId', res.data.user.upiId); // Optional: Save upiId too

      navigate('/dashboard'); // ✅ Redirect to dashboard
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login to SimUPI</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
