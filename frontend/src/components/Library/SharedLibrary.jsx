import React, { useState, useEffect } from 'react';
import { photoAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FiSearch, FiFilter, FiDownload, FiHeart } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
`;

const PhotoCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

const PhotoHeader = styled.div`
  position: relative;
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
`;

const RoomBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const PhotoInfo = styled.div`
  padding: 20px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
`;

const PhotoDate = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
`;

const PhotoActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  grid-column: 1 / -1;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  grid-column: 1 / -1;
  
  h3 {
    margin-bottom: 10px;
    color: #333;
  }
`;

const SharedLibrary = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalUsers: 0,
    totalRooms: 0,
    photosToday: 0
  });

  useEffect(() => {
    fetchSharedPhotos();
  }, []);

  const fetchSharedPhotos = async () => {
    try {
      const response = await photoAPI.getSharedPhotos();
      setPhotos(response.data.photos || []);
      calculateStats(response.data.photos || []);
    } catch (err) {
      toast.error('Errore nel caricamento della libreria condivisa');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (photos) => {
    const today = new Date().toDateString();
    const uniqueUsers = new Set(photos.map(p => p.user_id));
    const uniqueRooms = new Set(photos.map(p => p.room_id).filter(Boolean));
    
    setStats({
      totalPhotos: photos.length,
      totalUsers: uniqueUsers.size,
      totalRooms: uniqueRooms.size,
      photosToday: photos.filter(p => new Date(p.taken_at).toDateString() === today).length
    });
  };

  const handleAddToLibrary = async (photoId) => {
    try {
      await photoAPI.addToLibrary(photoId);
      toast.success('Foto aggiunta alla tua libreria!');
    } catch (err) {
      toast.error('Errore nell\'aggiunta alla libreria');
    }
  };

  const handleDownload = async (photoUrl, photoId) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photobooth-${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download iniziato!');
    } catch (err) {
      toast.error('Errore nel download');
    }
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = !searchQuery || 
      photo.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.room_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'today' && new Date(photo.taken_at).toDateString() === new Date().toDateString());
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <Loading>Caricamento libreria condivisa...</Loading>;
  }

  return (
    <Container>
      <Header>
        <Title>🌍 Libreria Condivisa</Title>
        <p>Esplora le foto pubbliche di tutta la community</p>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.totalPhotos}</StatNumber>
          <StatLabel>Foto totali</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.totalUsers}</StatNumber>
          <StatLabel>Utenti attivi</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.totalRooms}</StatNumber>
          <StatLabel>Stanze attive</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.photosToday}</StatNumber>
          <StatLabel>Foto oggi</StatLabel>
        </StatCard>
      </StatsGrid>

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
            placeholder="Cerca per utente o stanza..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '45px' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiFilter style={{ color: '#666' }} />
          <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tutte le foto</option>
            <option value="today">Oggi</option>
          </FilterSelect>
        </div>
      </SearchBar>

      {filteredPhotos.length === 0 ? (
        <EmptyState>
          <h3>Nessuna foto trovata</h3>
          <p>{searchQuery ? 'Prova con una ricerca diversa' : 'La libreria è ancora vuota'}</p>
        </EmptyState>
      ) : (
        <PhotoGrid>
          {filteredPhotos.map((photo) => (
            <PhotoCard key={photo.id}>
              <PhotoHeader>
                <PhotoImage 
                  src={photo.thumbnail_url || photo.photo_url} 
                  alt={`Foto di ${photo.user_name}`}
                  loading="lazy"
                />
                {photo.room_name && (
                  <RoomBadge>{photo.room_name}</RoomBadge>
                )}
              </PhotoHeader>
              
              <PhotoInfo>
                <UserInfo>
                  <Avatar>
                    {photo.user_name?.charAt(0) || 'U'}
                  </Avatar>
                  <div>
                    <UserName>{photo.user_name || 'Utente'}</UserName>
                    <PhotoDate>
                      {new Date(photo.taken_at).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </PhotoDate>
                  </div>
                </UserInfo>
                
                <PhotoActions>
                  <ActionButton onClick={() => handleAddToLibrary(photo.id)}>
                    <FiHeart /> Salva
                  </ActionButton>
                  <ActionButton onClick={() => handleDownload(photo.photo_url, photo.id)}>
                    <FiDownload /> Scarica
                  </ActionButton>
                </PhotoActions>
              </PhotoInfo>
            </PhotoCard>
          ))}
        </PhotoGrid>
      )}
    </Container>
  );
};

export default SharedLibrary;