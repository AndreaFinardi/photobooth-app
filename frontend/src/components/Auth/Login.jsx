import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { setAuthData } from '../../utils/auth';
import { toast } from 'react-toastify';
import styled from 'styled-components';

/* ================== STYLES ================== */

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 40px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 8px;
`;

/* ================== COMPONENT ================== */

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 FONDAMENTALE

    console.log('SUBMIT LOGIN', formData); // 🔎 DEBUG

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);

      console.log('LOGIN RESPONSE', response); // 🔎 DEBUG

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Risposta login non valida');
      }

      setAuthData(token, user);
      toast.success('Login effettuato con successo!');
      navigate('/dashboard');

    } catch (err) {
      console.error('LOGIN ERROR', err);

      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Errore durante il login';

      setError(msg);
      toast.error(msg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Title>🔐 Accedi a Photobooth</Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </FormGroup>

        <FormGroup>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </Button>
      </Form>

      <p style={{ textAlign: 'center', marginTop: 20 }}>
        Non hai un account? <Link to="/register">Registrati</Link>
      </p>
    </LoginContainer>
  );
};

export default Login;
