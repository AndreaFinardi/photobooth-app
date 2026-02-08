import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { 
  FiUsers, FiCamera, FiCalendar, FiPlus, 
  FiSearch, FiFilter, FiExternalLink,
  FiActivity, FiStar, FiClock
} from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const ActionButton = styled(Link)`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
`;

const SecondaryButton = styled.button`
  padding: 12px 24px;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #e2e8f0;
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 12px 15px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 15px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
`;

const RoomsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
`;

const RoomCard = styled.div`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

const RoomHeader = styled.div`
  padding: 25px;
  background: ${props => props.active ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
  };
  color: white;
  position: relative;
`;

const RoomStatus = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: ${props => props.active ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const RoomCode = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 5px;
  font-family: monospace;
  letter-spacing: 1px;
`;

const RoomTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
`;

const RoomBody = styled.div`
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const RoomDescription = styled.p`
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
  flex: 1;
`;

const RoomStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 25px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 0.9rem;
`;

const StatIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
`;

const StatValue = styled.div`
  font-weight: 600;
  color: #333;
`;

const RoomActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
`;

const ActionLink = styled(Link)`
  flex: 1;
  padding: 12px;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:first-child {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a67d8;
    }
  }
  
  &:last-child {
    background: #f1f5f9;
    color: #334155;
    
    &:hover {
      background: #e2e8f0;
    }
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 15px;
  color: #666;
  
  h3 {
    margin-bottom: 10px;
    color: #333;
  }
  
  svg {
    font-size: 3rem;
    margin-bottom: 20px;
    color: #94a3b8;
  }
`;

const Loading = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #666;
`;

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getUserRooms();
      setRooms(response.data.rooms || []);
    } catch (err) {
      toast.error('Errore nel caricamento delle stanze');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchQuery || 
      room.room_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.room_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && room.is_active) ||
      (filter === 'inactive' && !room.is_active) ||
      (filter === 'owner' && room.created_by === getUser()?.id);
    
    return matchesSearch && matchesFilter;
  });

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
          Caricamento stanze...
        </Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>🏠 Le tue stanze</Title>
        <Actions>
          <ActionButton to="/create-room">
            <FiPlus />
            Crea Stanza
          </ActionButton>
          <ActionButton to="/join-room">
            <FiUsers />
            Unisciti a Stanza
          </ActionButton>
          <SecondaryButton onClick={fetchRooms}>
            <FiActivity />
            Aggiorna
          </SecondaryButton>
        </Actions>
      </Header>

      <SearchBar>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <FiSearch style={{ 
            position: 'absolute', 
            left: '15px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#999'
          }} />
          <SearchInput 
            type="text"
            placeholder="Cerca per nome o codice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '45px' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiFilter style={{ color: '#666' }} />
          <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tutte le stanze</option>
            <option value="active">Attive</option>
            <option value="inactive">Inattive</option>
            <option value="owner">Mie stanze</option>
          </FilterSelect>
        </div>
      </SearchBar>

      {filteredRooms.length === 0 ? (
        <EmptyState>
          <FiUsers />
          <h3>Nessuna stanza trovata</h3>
          <p>
            {searchQuery 
              ? 'Prova con una ricerca diversa' 
              : 'Crea la tua prima stanza o unisciti a una esistente'
            }
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <ActionButton to="/create-room" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>
              Crea stanza
            </ActionButton>
            <ActionButton to="/join-room" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>
              Unisciti a stanza
            </ActionButton>
          </div>
        </EmptyState>
      ) : (
        <RoomsGrid>
          {filteredRooms.map((room) => (
            <RoomCard key={room.id}>
              <RoomHeader active={room.is_active}>
                <RoomStatus active={room.is_active}>
                  {room.is_active ? 'Attiva' : 'Inattiva'}
                </RoomStatus>
                <RoomCode>{room.room_code}</RoomCode>
                <RoomTitle>{room.room_name}</RoomTitle>
              </RoomHeader>
              
              <RoomBody>
                {room.description && (
                  <RoomDescription>{room.description}</RoomDescription>
                )}
                
                <RoomStats>
                  <StatItem>
                    <StatIcon>
                      <FiUsers />
                    </StatIcon>
                    <div>
                      <StatValue>{room.participant_count || 0}</StatValue>
                      <div>Partecipanti</div>
                    </div>
                  </StatItem>
                  
                  <StatItem>
                    <StatIcon>
                      <FiCamera />
                    </StatIcon>
                    <div>
                      <StatValue>{room.photo_count || 0}</StatValue>
                      <div>Foto</div>
                    </div>
                  </StatItem>
                  
                  <StatItem>
                    <StatIcon>
                      <FiCalendar />
                    </StatIcon>
                    <div>
                      <StatValue>
                        {new Date(room.created_at).toLocaleDateString('it-IT')}
                      </StatValue>
                      <div>Creata</div>
                    </div>
                  </StatItem>
                  
                  <StatItem>
                    <StatIcon>
                      {room.created_by === getUser()?.id ? <FiStar /> : <FiUsers />}
                    </StatIcon>
                    <div>
                      <StatValue>
                        {room.created_by === getUser()?.id ? 'Proprietario' : 'Partecipante'}
                      </StatValue>
                      <div>Ruolo</div>
                    </div>
                  </StatItem>
                </RoomStats>
                
                <RoomActions>
                  <ActionLink to={`/room/${room.id}`}>
                    <FiExternalLink />
                    Entra
                  </ActionLink>
                  <ActionLink to={`/room/${room.id}/gallery`}>
                    <FiCamera />
                    Foto
                  </ActionLink>
                </RoomActions>
              </RoomBody>
            </RoomCard>
          ))}
        </RoomsGrid>
      )}
    </Container>
  );
};

export default RoomList;