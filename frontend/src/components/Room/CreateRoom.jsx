import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FiSettings, FiClock, FiCalendar, FiCheck } from 'react-icons/fi';

const Container = styled.div`
  max-width: 600px;
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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
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

const Textarea = styled.textarea`
  padding: 12px 15px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SettingsSection = styled.div`
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
  margin-top: 10px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e1e1e1;
  
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
`;

const SettingValue = styled.div`
  font-weight: 600;
  color: #667eea;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  width: 200px;
  height: 6px;
  border-radius: 3px;
  background: #e1e1e1;
  outline: none;
  
  &::-webkit-slider-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
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

const SuccessCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const RoomCode = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 2px;
  margin: 30px 0;
  font-family: monospace;
`;

const ShareButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
`;

const ShareButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.color || '#f1f5f9'};
  color: ${props => props.textColor || '#333'};
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const CreateRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [roomData, setRoomData] = useState(null);
  
  const [formData, setFormData] = useState({
    room_name: '',
    description: '',
    settings: {
      interval: 60,
      photo_retention_days: 30,
      notifications: true,
      public_gallery: true
    }
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSettingChange = (key, value) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [key]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await roomAPI.createRoom(formData);
      setRoomData(response.data);
      setSuccess(true);
      toast.success('Stanza creata con successo!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Errore nella creazione della stanza';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomData?.roomCode);
    toast.success('Codice copiato negli appunti!');
  };

  const handleShareWhatsApp = () => {
    const message = `Unisciti alla mia stanza Photobooth! 🎉\n\nCodice: ${roomData?.roomCode}\nNome: ${formData.room_name}\n\nScarica l'app o vai su: ${window.location.origin}/join-room`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const subject = `Unisciti alla mia stanza Photobooth: ${formData.room_name}`;
    const body = `Ciao! 👋\n\nTi invito a unirti alla mia stanza su Photobooth App.\n\nDettagli:\n• Nome stanza: ${formData.room_name}\n• Codice: ${roomData?.roomCode}\n\nPer unirti:\n1. Vai su ${window.location.origin}/join-room\n2. Inserisci il codice: ${roomData?.roomCode}\n\nA presto! 📸`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  if (success && roomData) {
    return (
      <Container>
        <SuccessCard>
          <Title>
            <FiCheck style={{ color: '#10b981' }} />
            Stanza creata!
          </Title>
          
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Condividi questo codice con i tuoi amici per farli unire alla stanza
          </p>
          
          <RoomCode>
            {roomData.roomCode}
          </RoomCode>
          
          <p style={{ color: '#666' }}>
            Nome stanza: <strong>{formData.room_name}</strong>
          </p>
          
          <ShareButtons>
            <ShareButton onClick={handleCopyCode} color="#e0f2fe" textColor="#0369a1">
              📋 Copia Codice
            </ShareButton>
            
            <ShareButton onClick={handleShareWhatsApp} color="#25D366" textColor="white">
              💬 WhatsApp
            </ShareButton>
            
            <ShareButton onClick={handleShareEmail} color="#667eea" textColor="white">
              📧 Email
            </ShareButton>
          </ShareButtons>
          
          <div style={{ marginTop: '40px' }}>
            <Button onClick={() => navigate(`/room/${roomData.room.id}`)}>
              🚀 Vai alla stanza
            </Button>
          </div>
        </SuccessCard>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <FiSettings />
        Crea Nuova Stanza
      </Title>
      
      <Card>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="room_name">
              Nome della stanza *
            </Label>
            <Input
              type="text"
              id="room_name"
              name="room_name"
              value={formData.room_name}
              onChange={handleInputChange}
              placeholder="Es: Vacanza Sicilia 2024"
              required
              maxLength={100}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">
              Descrizione (opzionale)
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descrivi lo scopo della stanza..."
              maxLength={500}
            />
          </FormGroup>

          <div>
            <Label>
              <FiSettings />
              Impostazioni
            </Label>
            
            <SettingsSection>
              <SettingItem>
                <SettingLabel>
                  <FiClock />
                  <div>
                    <div>Intervallo foto</div>
                    <small style={{ color: '#666' }}>Ogni quante ore scattare</small>
                  </div>
                </SettingLabel>
                <div>
                  <SettingValue>{formData.settings.interval} minuti</SettingValue>
                  <Slider
                    min="15"
                    max="240"
                    step="15"
                    value={formData.settings.interval}
                    onChange={(e) => handleSettingChange('interval', parseInt(e.target.value))}
                  />
                </div>
              </SettingItem>

              <SettingItem>
                <SettingLabel>
                  <FiCalendar />
                  <div>
                    <div>Conservazione foto</div>
                    <small style={{ color: '#666' }}>Per quanti giorni mantenere le foto</small>
                  </div>
                </SettingLabel>
                <div>
                  <SettingValue>{formData.settings.photo_retention_days} giorni</SettingValue>
                  <Slider
                    min="1"
                    max="365"
                    step="1"
                    value={formData.settings.photo_retention_days}
                    onChange={(e) => handleSettingChange('photo_retention_days', parseInt(e.target.value))}
                  />
                </div>
              </SettingItem>

              <SettingItem>
                <SettingLabel>
                  <div>
                    <div>Notifiche</div>
                    <small style={{ color: '#666' }}>Invio promemoria automatici</small>
                  </div>
                </SettingLabel>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500' }}>
                    {formData.settings.notifications ? 'Attive' : 'Disattive'}
                  </span>
                </label>
              </SettingItem>

              <SettingItem>
                <SettingLabel>
                  <div>
                    <div>Galleria pubblica</div>
                    <small style={{ color: '#666' }}>Mostra foto nella libreria condivisa</small>
                  </div>
                </SettingLabel>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.settings.public_gallery}
                    onChange={(e) => handleSettingChange('public_gallery', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500' }}>
                    {formData.settings.public_gallery ? 'Pubblica' : 'Privata'}
                  </span>
                </label>
              </SettingItem>
            </SettingsSection>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creazione in corso...' : 'Crea Stanza'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default CreateRoom;