import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { roomAPI, photoAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { 
  FiUsers, FiCamera, FiSettings, FiCalendar, 
  FiArrowLeft, FiShare2, FiBell, FiClock,
  FiUserPlus, FiTrash2, FiLogOut, FiImage,
  FiCopy, FiMessageSquare, FiVideo
} from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RoomHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 300px;
`;

const RoomIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const RoomInfo = styled.div`
  flex: 1;
`;

const RoomTitle = styled.h1`
  margin: 0;
  color: #333;
  font-size: 1.8rem;
`;

const RoomCode = styled.div`
  color: #666;
  font-family: monospace;
  font-size: 1rem;
  margin-top: 5px;
  
  span {
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 4px;
    margin-left: 10px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.primary ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    '#f1f5f9'
  };
  color: ${props => props.primary ? 'white' : '#334155'};
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    ${props => props.primary ? 
      'box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);' : 
      'background: #e2e8f0;'
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DangerButton = styled(ActionButton)`
  background: #fee2e2;
  color: #dc2626;
  
  &:hover {
    background: #fecaca;
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div``;

const Sidebar = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  height: fit-content;
`;

const Section = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.4rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ParticipantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ParticipantCard = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
`;

const ParticipantInfo = styled.div`
  flex: 1;
`;

const ParticipantName = styled.div`
  font-weight: 600;
  color: #333;
`;

const ParticipantRole = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PhotoCard = styled(Link)`
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const PhotoOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 15px;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
  
  ${PhotoCard}:hover & {
    opacity: 1;
  }
`;

const PhotoInfo = styled.div`
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  background: #f8f9fa;
  border-radius: 10px;
  
  h3 {
    margin-bottom: 10px;
    color: #333;
  }
`;

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const SettingLabel = styled.div`
  font-weight: 500;
  color: #333;
`;

const SettingValue = styled.div`
  color: #667eea;
  font-weight: 600;
`;

const Loading = styled.div`
  text-align: center;
  padding: 50px;
  color: #666;
`;

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      const [roomResponse, participantsResponse, photosResponse] = await Promise.all([
        roomAPI.getRoomDetails(roomId),
        roomAPI.getRoomParticipants(roomId),
        photoAPI.getRoomPhotos(roomId, { limit: 8 })
      ]);

      setRoom(roomResponse.data.room);
      setParticipants(roomResponse.data.participants || participantsResponse.data?.participants || []);
      setRecentPhotos(photosResponse.data.photos || []);
      setIsOwner(roomResponse.data.is_owner || false);
      setSettings(roomResponse.data.room?.settings || {});
    } catch (err) {
      toast.error('Errore nel caricamento dei dettagli della stanza');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (room?.room_code) {
      navigator.clipboard.writeText(room.room_code);
      toast.success('Codice copiato!');
    }
  };

  const handleLeaveRoom = async () => {
    if (window.confirm('Sei sicuro di voler lasciare questa stanza?')) {
      try {
        await roomAPI.leaveRoom(roomId);
        toast.success('Hai lasciato la stanza');
        navigate('/rooms');
      } catch (err) {
        toast.error('Errore durante l\'uscita dalla stanza');
      }
    }
  };

  const handleDeactivateRoom = async () => {
    if (window.confirm('Sei sicuro di voler disattivare questa stanza?\nTutti i partecipanti non potranno più accedervi.')) {
      try {
        await roomAPI.deactivateRoom(roomId);
        toast.success('Stanza disattivata');
        navigate('/rooms');
      } catch (err) {
        toast.error('Errore durante la disattivazione');
      }
    }
  };

  const handleRegenerateCode = async () => {
    if (window.confirm('Vuoi rigenerare il codice della stanza?\nIl vecchio codice non funzionerà più.')) {
      try {
        await roomAPI.regenerateCode(roomId);
        toast.success('Codice rigenerato!');
        fetchRoomDetails();
      } catch (err) {
        toast.error('Errore durante la rigenerazione del codice');
      }
    }
  };

  const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  if (loading) {
    return (
      <Container>
        <Loading>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #e1e1e1',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          Caricamento dettagli stanza...
        </Loading>
      </Container>
    );
  }

  if (!room) {
    return (
      <Container>
        <EmptyState>
          <h3>Stanza non trovata</h3>
          <p>La stanza potrebbe essere stata eliminata o disattivata.</p>
          <BackButton to="/rooms">
            <FiArrowLeft />
            Torna alle stanze
          </BackButton>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton to="/rooms">
          <FiArrowLeft />
          Torna alle stanze
        </BackButton>
        
        <RoomHeader>
          <RoomIcon>
            <FiUsers />
          </RoomIcon>
          <RoomInfo>
            <RoomTitle>{room.room_name}</RoomTitle>
            <RoomCode>
              Codice: 
              <span>
                {room.room_code}
                <button 
                  onClick={handleCopyCode}
                  style={{
                    background: 'none',
                    border: 'none',
                    marginLeft: '8px',
                    cursor: 'pointer',
                    color: '#667eea'
                  }}
                >
                  <FiCopy size={14} />
                </button>
              </span>
            </RoomCode>
          </RoomInfo>
        </RoomHeader>
        
        <HeaderActions>
          <ActionButton as={Link} to={`/room/${roomId}/camera`} primary>
            <FiCamera />
            Scatta Foto
          </ActionButton>
          <ActionButton onClick={handleCopyCode}>
            <FiShare2 />
            Condividi
          </ActionButton>
          {isOwner && (
            <ActionButton onClick={handleRegenerateCode}>
              <FiSettings />
              Rigenera Codice
            </ActionButton>
          )}
        </HeaderActions>
      </Header>

      <Content>
        <MainContent>
          <Section>
            <SectionTitle>
              <FiBell />
              Statistiche
            </SectionTitle>
            <StatsGrid>
              <StatCard>
                <StatNumber>{participants.length}</StatNumber>
                <StatLabel>Partecipanti</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{recentPhotos.length}</StatNumber>
                <StatLabel>Foto totali</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{settings.interval || 60} min</StatNumber>
                <StatLabel>Intervallo foto</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>
                  {new Date(room.created_at).toLocaleDateString('it-IT')}
                </StatNumber>
                <StatLabel>Creata il</StatLabel>
              </StatCard>
            </StatsGrid>
          </Section>

          <Section>
            <SectionTitle>
              <FiImage />
              Foto recenti
            </SectionTitle>
            {recentPhotos.length === 0 ? (
              <EmptyState>
                <h3>Nessuna foto ancora</h3>
                <p>Sii il primo a scattare una foto in questa stanza!</p>
                <ActionButton 
                  as={Link} 
                  to={`/room/${roomId}/camera`}
                  primary
                  style={{ marginTop: '20px' }}
                >
                  <FiCamera />
                  Scatta la prima foto
                </ActionButton>
              </EmptyState>
            ) : (
              <PhotoGrid>
                {recentPhotos.slice(0, 8).map((photo) => (
                  <PhotoCard key={photo.id} to={`/photo/${photo.id}`}>
                    <img 
                      src={photo.thumbnail_url || photo.photo_url} 
                      alt={`Foto di ${photo.user_name}`}
                    />
                    <PhotoOverlay>
                      <PhotoInfo>
                        {photo.user_name}
                      </PhotoInfo>
                    </PhotoOverlay>
                  </PhotoCard>
                ))}
              </PhotoGrid>
            )}
            {recentPhotos.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <ActionButton as={Link} to={`/room/${roomId}/gallery`}>
                  <FiImage />
                  Vedi tutte le foto
                </ActionButton>
              </div>
            )}
          </Section>
        </MainContent>

        <Sidebar>
          <Section style={{ padding: '0', marginBottom: '25px' }}>
            <SectionTitle style={{ padding: '0 0 20px 0', margin: '0' }}>
              <FiUsers />
              Partecipanti ({participants.length})
            </SectionTitle>
            <ParticipantsList>
              {participants.map((participant) => (
                <ParticipantCard key={participant.id}>
                  <Avatar>
                    {participant.full_name?.charAt(0) || participant.email?.charAt(0) || 'U'}
                  </Avatar>
                  <ParticipantInfo>
                    <ParticipantName>
                      {participant.full_name || participant.email}
                    </ParticipantName>
                    <ParticipantRole>
                      {participant.id === room.created_by ? 'Proprietario' : 'Partecipante'}
                    </ParticipantRole>
                  </ParticipantInfo>
                </ParticipantCard>
              ))}
            </ParticipantsList>
          </Section>

          <Section style={{ padding: '0', marginBottom: '25px' }}>
            <SectionTitle style={{ padding: '0 0 20px 0', margin: '0' }}>
              <FiSettings />
              Impostazioni
            </SectionTitle>
            <SettingsList>
              <SettingItem>
                <SettingLabel>Intervallo foto</SettingLabel>
                <SettingValue>{settings.interval || 60} min</SettingValue>
              </SettingItem>
              <SettingItem>
                <SettingLabel>Conservazione</SettingLabel>
                <SettingValue>{settings.photo_retention_days || 30} giorni</SettingValue>
              </SettingItem>
              <SettingItem>
                <SettingLabel>Notifiche</SettingLabel>
                <SettingValue>
                  {settings.notifications ? 'Attive' : 'Disattive'}
                </SettingValue>
              </SettingItem>
              <SettingItem>
                <SettingLabel>Galleria pubblica</SettingLabel>
                <SettingValue>
                  {settings.public_gallery ? 'Sì' : 'No'}
                </SettingValue>
              </SettingItem>
            </SettingsList>
          </Section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isOwner ? (
              <>
                <DangerButton onClick={handleDeactivateRoom}>
                  <FiTrash2 />
                  Disattiva Stanza
                </DangerButton>
                <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                  Solo tu puoi disattivare questa stanza
                </p>
              </>
            ) : (
              <DangerButton onClick={handleLeaveRoom}>
                <FiLogOut />
                Lascia Stanza
              </DangerButton>
            )}
          </div>
        </Sidebar>
      </Content>
    </Container>
  );
};

export default RoomDetail;