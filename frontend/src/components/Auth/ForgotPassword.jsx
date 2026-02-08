import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 40px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 1.8rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 1rem;
  
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
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authAPI.forgotPassword(email);
      setIsSuccess(true);
      setMessage('Email di recupero inviata! Controlla la tua posta.');
      toast.success('Email inviata con successo');
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.response?.data?.error || 'Errore durante il recupero password');
      toast.error('Errore durante il recupero password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🔐 Recupera Password</Title>
      
      {message && <Message success={isSuccess}>{message}</Message>}
      
      {!isSuccess ? (
        <Form onSubmit={handleSubmit}>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Inserisci la tua email e ti invieremo un link per reimpostare la password.
          </p>
          
          <Input
            type="email"
            placeholder="tua@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Invio in corso...' : 'Invia link di recupero'}
          </Button>
        </Form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Controlla la tua email e segui le istruzioni per reimpostare la password.
          </p>
          <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
            ← Torna al login
          </Link>
        </div>
      )}
    </Container>
  );
};

export default ForgotPassword;