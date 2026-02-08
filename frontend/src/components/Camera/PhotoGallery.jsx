import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { photoAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { 
  FiImage, FiDownload, FiHeart, FiShare2,
  FiCalendar, FiUser, FiArrowLeft, FiGrid,
  FiList, FiFilter, FiSearch, FiClock,
  FiEye, FiEyeOff, FiTrash2
} from 'react-icons/fi';

const Container = styled.div`
  max-width: 1400px;
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

const TitleSection = styled.div`
  display: flex;
  align-items: center;
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

const Title = styled.h1`
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.active ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    '#f1f5f9'
  };
  color: ${props => props.active ? 'white' : '#334155'};
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    ${props => props.active ? 
      '' : 'background: #e2e8f0;'
    }
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

const GalleryView = styled.div`
  display: ${props => props.view === 'grid' ? 'grid' : 'flex'};
  ${props => props.view === 'grid' ? 
    'grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));' : 
    'flex-direction: column;'
  }
  gap: ${props => props.view === 'grid' ? '25px' : '20px'};
  margin-bottom: 40px;
`;

const PhotoCardGrid = styled.div`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

const PhotoCardList = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const PhotoImageGrid = styled.div`
  aspect-ratio: 4/3;
  overflow: hidden;
  cursor: pointer;
  
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

const PhotoImageList = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PhotoInfoGrid = styled.div`
  padding: 20px;
`;

const PhotoInfoList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
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

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
`;

const PhotoDate = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-top: 2px;
`;

const PhotoActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: ${props => props.view === 'grid' ? '15px' : '0'};
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
  }
`;

const FavoriteButton = styled(ActionButton)`
  background: ${props => props.favorite ? '#fee2e2' : '#f1f5f9'};
  color: ${props => props.favorite ? '#dc2626' : '#334155'};
  
  &:hover {
    background: ${props => props.favorite ? '#fecaca' : '#e2e8f0'};
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9rem;
  margin-top: 10px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
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
`;

const Loading = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #666;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 15px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  position: relative;
`;

const ModalImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const ModalClose = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const PhotoGallery = () => {
  const { roomId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' o 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPhotos();
  }, [roomId]);

  const fetchPhotos = async () => {
    try {
      const response = await photoAPI.getRoomPhotos(roomId, { limit: 100 });
      setPhotos(response.data.photos || []);
    } catch (err) {
      toast.error('Errore nel caricamento delle foto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async (photoId) => {
    try {
      await photoAPI.addToLibrary(photoId);
      toast.success('Foto aggiunta alla tua libreria!');
      
      // Aggiorna lo stato locale
      setPhotos(photos.map(photo => 
        photo.id === photoId 
          ? { ...photo, in_library: true }
          : photo
      ));
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

  const handleShare = (photoId) => {
    const shareUrl = `${window.location.origin}/photo/${photoId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copiato negli appunti!');
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = !searchQuery || 
      photo.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' ||
      (filter === 'today' && isToday(photo.taken_at)) ||
      (filter === 'favorites' && photo.in_library) ||
      (filter === 'mine' && photo.user_id === getUser()?.id);
    
    return matchesSearch && matchesFilter;
  });

  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          Caricamento foto...
        </Loading>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Header>
          <TitleSection>
            <BackButton to={`/room/${roomId}`}>
              <FiArrowLeft />
              Torna alla stanza
            </BackButton>
            <Title>
              <FiImage />
              Galleria foto
              <span style={{
                background: '#f1f5f9',
                color: '#667eea',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {photos.length} foto
              </span>
            </Title>
          </TitleSection>
          
          <Controls>
            <Button 
              active={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <FiGrid />
              Griglia
            </Button>
            <Button 
              active={view === 'list'}
              onClick={() => setView('list')}
            >
              <FiList />
              Lista
            </Button>
          </Controls>
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
              placeholder="Cerca per utente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '45px' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiFilter style={{ color: '#666' }} />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '12px 15px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                background: 'white',
                fontSize: '1rem'
              }}
            >
              <option value="all">Tutte le foto</option>
              <option value="today">Oggi</option>
              <option value="favorites">Preferite</option>
              <option value="mine">Mie foto</option>
            </select>
          </div>
        </SearchBar>

        {filteredPhotos.length === 0 ? (
          <EmptyState>
            <FiImage size={48} style={{ marginBottom: '20px', color: '#94a3b8' }} />
            <h3>Nessuna foto trovata</h3>
            <p>
              {searchQuery || filter !== 'all' 
                ? 'Prova con una ricerca diversa o cambia filtro' 
                : 'Sii il primo a scattare una foto in questa stanza!'
              }
            </p>
          </EmptyState>
        ) : (
          <GalleryView view={view}>
            {filteredPhotos.map((photo) => (
              view === 'grid' ? (
                <PhotoCardGrid key={photo.id}>
                  <PhotoImageGrid onClick={() => setSelectedPhoto(photo)}>
                    <img 
                      src={photo.thumbnail_url || photo.photo_url} 
                      alt={`Foto di ${photo.user_name}`}
                    />
                  </PhotoImageGrid>
                  
                  <PhotoInfoGrid>
                    <UserInfo>
                      <Avatar>
                        {photo.user_name?.charAt(0) || 'U'}
                      </Avatar>
                      <UserDetails>
                        <UserName>{photo.user_name || 'Utente'}</UserName>
                        <PhotoDate>{formatDate(photo.taken_at)}</PhotoDate>
                      </UserDetails>
                    </UserInfo>
                    
                    <Stats>
                      <StatItem>
                        <FiEye />
                        {photo.is_public ? 'Pubblica' : 'Privata'}
                      </StatItem>
                      <StatItem>
                        <FiClock />
                        {new Date(photo.taken_at).toLocaleTimeString('it-IT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </StatItem>
                    </Stats>
                    
                    <PhotoActions view={view}>
                      <FavoriteButton 
                        favorite={photo.in_library}
                        onClick={() => handleAddToLibrary(photo.id)}
                      >
                        <FiHeart />
                        {photo.in_library ? 'Rimuovi' : 'Salva'}
                      </FavoriteButton>
                      
                      <ActionButton onClick={() => handleDownload(photo.photo_url, photo.id)}>
                        <FiDownload />
                        Scarica
                      </ActionButton>
                      
                      <ActionButton onClick={() => handleShare(photo.id)}>
                        <FiShare2 />
                        Condividi
                      </ActionButton>
                    </PhotoActions>
                  </PhotoInfoGrid>
                </PhotoCardGrid>
              ) : (
                <PhotoCardList key={photo.id}>
                  <PhotoImageList onClick={() => setSelectedPhoto(photo)}>
                    <img 
                      src={photo.thumbnail_url || photo.photo_url} 
                      alt={`Foto di ${photo.user_name}`}
                    />
                  </PhotoImageList>
                  
                  <PhotoInfoList>
                    <div>
                      <UserInfo>
                        <Avatar>
                          {photo.user_name?.charAt(0) || 'U'}
                        </Avatar>
                        <UserDetails>
                          <UserName>{photo.user_name || 'Utente'}</UserName>
                          <PhotoDate>{formatDate(photo.taken_at)}</PhotoDate>
                        </UserDetails>
                      </UserInfo>
                      
                      <Stats>
                        <StatItem>
                          <FiEye />
                          {photo.is_public ? 'Pubblica' : 'Privata'}
                        </StatItem>
                        <StatItem>
                          <FiClock />
                          {new Date(photo.taken_at).toLocaleTimeString('it-IT')}
                        </StatItem>
                      </Stats>
                    </div>
                    
                    <PhotoActions view={view}>
                      <FavoriteButton 
                        favorite={photo.in_library}
                        onClick={() => handleAddToLibrary(photo.id)}
                      >
                        <FiHeart />
                        {photo.in_library ? 'Rimuovi' : 'Salva'}
                      </FavoriteButton>
                      
                      <ActionButton onClick={() => handleDownload(photo.photo_url, photo.id)}>
                        <FiDownload />
                        Scarica
                      </ActionButton>
                      
                      <ActionButton onClick={() => handleShare(photo.id)}>
                        <FiShare2 />
                        Condividi
                      </ActionButton>
                    </PhotoActions>
                  </PhotoInfoList>
                </PhotoCardList>
              )
            ))}
          </GalleryView>
        )}
      </Container>

      {selectedPhoto && (
        <ModalOverlay onClick={() => setSelectedPhoto(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalClose onClick={() => setSelectedPhoto(null)}>
              ✕
            </ModalClose>
            <ModalImage 
              src={selectedPhoto.photo_url} 
              alt={`Foto di ${selectedPhoto.user_name}`}
            />
            <div style={{ 
              padding: '20px',
              background: 'white',
              borderTop: '1px solid #e1e1e1'
            }}>
              <UserInfo>
                <Avatar>
                  {selectedPhoto.user_name?.charAt(0) || 'U'}
                </Avatar>
                <UserDetails>
                  <UserName>{selectedPhoto.user_name || 'Utente'}</UserName>
                  <PhotoDate>{formatDate(selectedPhoto.taken_at)}</PhotoDate>
                </UserDetails>
              </UserInfo>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default PhotoGallery;