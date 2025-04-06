import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    contactNumber: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/user/register', formData, { withCredentials: true });
      document.cookie = `accessToken=${response.data.accessToken}; path=/;`;
      alert('Registration successful!');
      navigate('/profile');
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required pattern="[a-zA-Z0-9._%+-]+@iiit\.ac\.in" />
        <input type="number" name="age" placeholder="Age" onChange={handleChange} required min="18" max="100" />
        <input type="text" name="contactNumber" placeholder="Contact Number" onChange={handleChange} required pattern="\+?1?\d{9,15}" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;