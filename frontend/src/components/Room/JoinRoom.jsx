import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FiKey, FiUsers, FiArrowRight, FiSearch } from 'react-icons/fi';

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Card = styled.div`
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 15px 14px 45px;
  border: 2px solid #e1e1e1;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    text-transform: none;
    letter-spacing: normal;
    font-weight: normal;
  }
`;

const Button = styled.button`
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CodeExample = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 0.9rem;
  
  code {
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: monospace;
    color: #334155;
  }
`;

const RoomInfo = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  padding: 25px;
  margin-top: 30px;
`;

const RoomHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const RoomName = styled.h3`
  margin: 0;
  color: #0369a1;
`;

const RoomDetails = styled.div`
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  
  p {
    margin: 5px 0;
  }
`;

const JoinButton = styled.button`
  margin-top: 20px;
  padding: 14px 28px;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    background: #0284c7;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const JoinRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [roomInfo, setRoomInfo] = useState(null);
  const [error, setError] = useState('');

  const handleSearchRoom = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setSearching(true);
    setError('');
    setRoomInfo(null);

    try {
      // Normalizza il codice (maiuscolo, rimuovi spazi)
      const normalizedCode = roomCode.trim().toUpperCase().replace(/\s/g, '');
      
      // Cerca informazioni sulla stanza (simulazione)
      // Nella realtà dovresti avere un endpoint API per verificare la stanza
      const response = await roomAPI.getUserRooms();
      const rooms = response.data.rooms || [];
      
      // Simula ricerca (in produzione dovrebbe essere un endpoint dedicato)
      setTimeout(() => {
        // Mock: se il codice è "ABC123" mostra info demo
        if (normalizedCode === 'ABC123') {
          setRoomInfo({
            room_name: 'Vacanza Sicilia 2024',
            creator_name: 'Demo User',
            participant_count: 3,
            created_at: '2024-01-15',
            description: 'Foto della nostra vacanza in Sicilia!'
          });
        } else {
          setError('Stanza non trovata. Verifica il codice.');
        }
        setSearching(false);
      }, 1000);
      
    } catch (err) {
      setError('Errore nella ricerca della stanza');
      setSearching(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;

    setLoading(true);

    try {
      const response = await roomAPI.joinRoom(roomCode.trim().toUpperCase());
      
      toast.success('Ti sei unito alla stanza con successo!');
      
      // Naviga alla stanza
      setTimeout(() => {
        navigate(`/room/${response.data.room.id}`);
      }, 1000);
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Errore nell\'unione alla stanza';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>
        <FiUsers />
        Unisciti a una Stanza
      </Title>
      
      <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>
        Inserisci il codice della stanza per partecipare
      </p>
      
      <Card>
        <Form onSubmit={handleSearchRoom}>
          <InputGroup>
            <IconWrapper>
              <FiKey size={20} />
            </IconWrapper>
            <Input
              type="text"
              placeholder="Es: ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength="10"
              pattern="[A-Z0-9]*"
              title="Solo lettere maiuscole e numeri"
              required
            />
          </InputGroup>
          
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px 15px',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}
          
          <Button type="submit" disabled={searching || !roomCode.trim()}>
            {searching ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Cerca stanza...
              </>
            ) : (
              <>
                <FiSearch />
                Cerca Stanza
              </>
            )}
          </Button>
        </Form>
        
        {searching ? (
          <LoadingSpinner>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e1e1e1',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              margin: '0 auto 15px',
              animation: 'spin 1s linear infinite'
            }} />
            Ricerca stanza in corso...
          </LoadingSpinner>
        ) : roomInfo && (
          <RoomInfo>
            <RoomHeader>
              <FiUsers size={24} color="#0ea5e9" />
              <div>
                <RoomName>{roomInfo.room_name}</RoomName>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  Creata da {roomInfo.creator_name}
                </div>
              </div>
            </RoomHeader>
            
            <RoomDetails>
              <p>{roomInfo.description}</p>
              <p>
                <strong>{roomInfo.participant_count}</strong> partecipanti
              </p>
              <p>
                Creata il {new Date(roomInfo.created_at).toLocaleDateString('it-IT')}
              </p>
            </RoomDetails>
            
            <JoinButton onClick={handleJoinRoom} disabled={loading}>
              {loading ? 'Unione in corso...' : 'Unisciti alla Stanza'}
              <FiArrowRight />
            </JoinButton>
          </RoomInfo>
        )}
        
        <CodeExample>
          <p>Dove trovo il codice?</p>
          <p>Chiedi al creatore della stanza o cerca in:</p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '10px 0',
            color: '#666',
            fontSize: '0.85rem'
          }}>
            <li>• Email di invito</li>
            <li>• Messaggio WhatsApp/Telegram</li>
            <li>• Notifica push dell'app</li>
          </ul>
          <p>
            Il codice ha questo formato: <code>ABC123</code>
          </p>
        </CodeExample>
      </Card>
    </Container>
  );
};

export default JoinRoom;