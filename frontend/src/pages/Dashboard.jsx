import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, roomAPI, photoAPI } from '../utils/api';
import { getUser, logout } from '../utils/auth';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { 
  FiPlus, FiUsers, FiCamera, FiBell, FiClock, 
  FiBarChart2, FiArrowRight, FiLogOut,
  FiHome, FiImage, FiGlobe
} from 'react-icons/fi';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px 0;
  border-bottom: 1px solid #e1e1e1;
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
`;

const UserEmail = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const LogoutButton = styled.button`
  padding: 10px 20px;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  
  &:hover {
    background: #e2e8f0;
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const ActionCard = styled(Link)`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const ActionIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.color || '#667eea'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h3`
  margin: 0 0 5px 0;
  color: #333;
`;

const ActionDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.color || '#f1f5f9'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor || '#667eea'};
`;

const StatTitle = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
`;

const RoomsSection = styled.section`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ViewAllLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RoomList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const RoomCard = styled(Link)`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const RoomName = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
`;

const RoomCode = styled.div`
  background: #f0f9ff;
  color: #0369a1;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const RoomInfo = styled.div`
  display: flex;
  gap: 20px;
  margin: 15px 0;
  font-size: 0.9rem;
  color: #666;
`;

const RoomAction = styled.div`
  margin-top: 15px;
  text-align: center;
`;

const RecentPhotos = styled.section``;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
`;

const PhotoCard = styled(Link)`
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 15px;
  color: #666;
  
  h3 {
    color: #333;
    margin-bottom: 10px;
  }
`;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [rooms, setRooms] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = getUser();
      setUser(userData);

      // Carica statistiche
      const profileResponse = await authAPI.getProfile();
      setStats(profileResponse.data.stats || {});

      // Carica stanze
      const roomsResponse = await roomAPI.getUserRooms();
      setRooms(roomsResponse.data.rooms || []);

      // Carica foto recenti (ultime 8)
      const userPhotosResponse = await photoAPI.getUserPhotos(userData.id, { limit: 8 });
      setRecentPhotos(userPhotosResponse.data.photos || []);
    } catch (err) {
      toast.error('Errore nel caricamento del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Caricamento dashboard...</div>;
  }

  return (
    <DashboardContainer>
      <Header>
        <Logo to="/dashboard">
          <FiHome />
          Photobooth Dashboard
        </Logo>
        
        <UserMenu>
          <UserInfo>
            <UserName>{user?.full_name || 'Utente'}</UserName>
            <UserEmail>{user?.email}</UserEmail>
          </UserInfo>
          
          <LogoutButton onClick={handleLogout}>
            <FiLogOut />
            Logout
          </LogoutButton>
        </UserMenu>
      </Header>

      <QuickActions>
        <ActionCard to="/create-room">
          <ActionIcon color="#667eea">
            <FiPlus />
          </ActionIcon>
          <ActionContent>
            <ActionTitle>Crea Nuova Stanza</ActionTitle>
            <ActionDescription>Crea una stanza e condividi il codice con gli amici</ActionDescription>
          </ActionContent>
        </ActionCard>

        <ActionCard to="/join-room">
          <ActionIcon color="#10b981">
            <FiUsers />
          </ActionIcon>
          <ActionContent>
            <ActionTitle>Unisciti a Stanza</ActionTitle>
            <ActionDescription>Partecipa a una stanza esistente con un codice</ActionDescription>
          </ActionContent>
        </ActionCard>

        <ActionCard to="/shared-library">
          <ActionIcon color="#f59e0b">
            <FiGlobe />
          </ActionIcon>
          <ActionContent>
            <ActionTitle>Libreria Condivisa</ActionTitle>
            <ActionDescription>Esplora le foto pubbliche di tutta la community</ActionDescription>
          </ActionContent>
        </ActionCard>
      </QuickActions>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon color="#f0f9ff" iconColor="#0369a1">
              <FiUsers />
            </StatIcon>
            <StatTitle>Stanze Partecipanti</StatTitle>
          </StatHeader>
          <StatNumber>{stats.rooms_joined || 0}</StatNumber>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#fef2f2" iconColor="#dc2626">
              <FiCamera />
            </StatIcon>
            <StatTitle>Foto Scattate</StatTitle>
          </StatHeader>
          <StatNumber>{stats.photos_taken || 0}</StatNumber>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#f0fdf4" iconColor="#16a34a">
              <FiImage />
            </StatIcon>
            <StatTitle>In Libreria</StatTitle>
          </StatHeader>
          <StatNumber>{stats.photos_in_library || 0}</StatNumber>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#fffbeb" iconColor="#d97706">
              <FiBarChart2 />
            </StatIcon>
            <StatTitle>Stanze Create</StatTitle>
          </StatHeader>
          <StatNumber>{stats.rooms_created || 0}</StatNumber>
        </StatCard>
      </StatsGrid>

      <RoomsSection>
        <SectionHeader>
          <SectionTitle>
            <FiUsers />
            Le tue stanze
          </SectionTitle>
          <ViewAllLink to="/rooms">
            Vedi tutte <FiArrowRight />
          </ViewAllLink>
        </SectionHeader>

        {rooms.length === 0 ? (
          <EmptyState>
            <h3>Nessuna stanza ancora</h3>
            <p>Crea la tua prima stanza o unisciti a una esistente per iniziare!</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <ActionCard to="/create-room" style={{ maxWidth: '200px' }}>
                Crea stanza
              </ActionCard>
              <ActionCard to="/join-room" style={{ maxWidth: '200px' }}>
                Unisciti a stanza
              </ActionCard>
            </div>
          </EmptyState>
        ) : (
          <RoomList>
            {rooms.slice(0, 4).map((room) => (
              <RoomCard key={room.id} to={`/room/${room.id}`}>
                <RoomHeader>
                  <RoomName>{room.room_name}</RoomName>
                  <RoomCode>{room.room_code}</RoomCode>
                </RoomHeader>
                
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  Creata il {new Date(room.created_at).toLocaleDateString('it-IT')}
                </div>
                
                <RoomInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FiUsers size={14} />
                    {room.participant_count || 0} partecipanti
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FiCamera size={14} />
                    {room.photo_count || 0} foto
                  </div>
                </RoomInfo>
                
                <RoomAction>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    color: '#667eea',
                    fontWeight: '500'
                  }}>
                    Vedi stanza <FiArrowRight />
                  </div>
                </RoomAction>
              </RoomCard>
            ))}
          </RoomList>
        )}
      </RoomsSection>

      <RecentPhotos>
        <SectionHeader>
          <SectionTitle>
            <FiCamera />
            Le tue foto recenti
          </SectionTitle>
          <ViewAllLink to={`/library/${user?.id}`}>
            Vedi libreria <FiArrowRight />
          </ViewAllLink>
        </SectionHeader>

        {recentPhotos.length === 0 ? (
          <EmptyState>
            <h3>Nessuna foto ancora</h3>
            <p>Scatta la tua prima foto in una stanza!</p>
          </EmptyState>
        ) : (
          <PhotoGrid>
            {recentPhotos.map((photo) => (
              <PhotoCard key={photo.id} to={`/photo/${photo.id}`}>
                <img 
                  src={photo.thumbnail_url || photo.photo_url} 
                  alt="Foto recente"
                />
              </PhotoCard>
            ))}
          </PhotoGrid>
        )}
      </RecentPhotos>
    </DashboardContainer>
  );
};

export default Dashboard;