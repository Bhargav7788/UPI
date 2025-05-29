import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Make sure this file exists

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8899/api/auth/login', {
        email,
        password,
      });

      alert('Login successful!');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('upiId', res.data.user.upiId);

      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login to SimUPI 🔐</h2>

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

      <p className="alt-link">
        Don't have an account? <a href="/signup">Signup here</a>
      </p>
    </div>
  );
}

export default Login;
