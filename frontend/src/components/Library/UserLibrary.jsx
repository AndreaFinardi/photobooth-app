import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { photoAPI } from '../../utils/api';  // Percorso corretto: ../../utils/api
import { getUser } from '../../utils/auth';  // Percorso corretto: ../../utils/auth
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { 
  FiUser, FiCamera, FiHeart, FiDownload, 
  FiGrid, FiList, FiSearch, FiFilter,
  FiEye, FiEyeOff, FiTrash2, FiShare2,
  FiCalendar, FiClock, FiStar, FiUsers
} from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  border: 5px solid white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  margin: 0;
  font-size: 2.2rem;
`;

const UserEmail = styled.div`
  opacity: 0.9;
  font-size: 1.1rem;
  margin-top: 5px;
`;

const StatsGrid = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  min-width: 120px;
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const ViewControls = styled.div`
  display: flex;
  gap: 10px;
`;

const ViewButton = styled.button`
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
  position: relative;
  
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
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

const PhotoInfoGrid = styled.div`
  padding: 20px;
`;

const PhotoInfoList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const PhotoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const PhotoDate = styled.div`
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const VisibilityBadge = styled.div`
  background: ${props => props.public ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.public ? '#065f46' : '#991b1b'};
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PhotoActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: ${props => props.view === 'grid' ? '15px' : '0'};
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FavoriteButton = styled(ActionButton)`
  background: ${props => props.favorite ? '#fee2e2' : '#f1f5f9'};
  color: ${props => props.favorite ? '#dc2626' : '#334155'};
  
  &:hover {
    background: ${props => props.favorite ? '#fecaca' : '#e2e8f0'};
  }
`;

const DeleteButton = styled(ActionButton)`
  background: #fee2e2;
  color: #dc2626;
  
  &:hover {
    background: #fecaca;
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

const UserLibrary = () => {
  const { userId } = useParams();
  const currentUser = getUser();
  const isOwnLibrary = currentUser && parseInt(userId) === currentUser.id;
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    private: 0,
    favorites: 0
  });

  useEffect(() => {
    fetchUserLibrary();
  }, [userId]);

  const fetchUserLibrary = async () => {
    try {
      const response = await photoAPI.getUserLibrary(userId);
      const libraryPhotos = response.data.photos || [];
      setPhotos(libraryPhotos);
      
      // Calcola statistiche
      const statsData = {
        total: libraryPhotos.length,
        public: libraryPhotos.filter(p => p.is_public).length,
        private: libraryPhotos.filter(p => !p.is_public).length,
        favorites: libraryPhotos.filter(p => p.is_favorite).length
      };
      setStats(statsData);
      
      // Se è la propria libreria, usa i dati dell'utente corrente
      if (isOwnLibrary) {
        setUserInfo({
          name: currentUser.full_name,
          email: currentUser.email,
          initial: currentUser.full_name?.charAt(0) || 'U'
        });
      } else if (libraryPhotos.length > 0) {
        // Altrimenti usa i dati dal primo autore
        const firstPhoto = libraryPhotos[0];
        setUserInfo({
          name: firstPhoto.photographer_name,
          email: firstPhoto.photographer_email,
          initial: firstPhoto.photographer_name?.charAt(0) || 'U'
        });
      }
    } catch (err) {
      console.error('Errore nel caricamento della libreria:', err);
      toast.error('Errore nel caricamento della libreria');
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
      console.error('Errore nell\'aggiunta alla libreria:', err);
      toast.error('Errore nell\'aggiunta alla libreria');
    }
  };

  const handleRemoveFromLibrary = async (photoId) => {
    try {
      await photoAPI.removeFromLibrary(photoId);
      toast.success('Foto rimossa dalla libreria');
      
      // Aggiorna lo stato locale
      setPhotos(photos.filter(photo => photo.id !== photoId));
    } catch (err) {
      console.error('Errore nella rimozione dalla libreria:', err);
      toast.error('Errore nella rimozione dalla libreria');
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
      console.error('Errore nel download:', err);
      toast.error('Errore nel download');
    }
  };

  const handleShare = (photoId) => {
    const shareUrl = `${window.location.origin}/photo/${photoId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copiato negli appunti!');
  };

  const handleToggleVisibility = async (photoId, isPublic) => {
    if (!isOwnLibrary) return;
    
    try {
      await photoAPI.updatePhotoVisibility(photoId, !isPublic);
      toast.success('Visibilità aggiornata!');
      
      // Aggiorna lo stato locale
      setPhotos(photos.map(photo => 
        photo.id === photoId 
          ? { ...photo, is_public: !isPublic }
          : photo
      ));
    } catch (err) {
      console.error('Errore nell\'aggiornamento della visibilità:', err);
      toast.error('Errore nell\'aggiornamento della visibilità');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!isOwnLibrary || !window.confirm('Sei sicuro di voler eliminare questa foto?')) {
      return;
    }
    
    try {
      await photoAPI.deletePhoto(photoId);
      toast.success('Foto eliminata!');
      
      // Aggiorna lo stato locale
      setPhotos(photos.filter(photo => photo.id !== photoId));
    } catch (err) {
      console.error('Errore nell\'eliminazione della foto:', err);
      toast.error('Errore nell\'eliminazione della foto');
    }
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = !searchQuery || 
      photo.room_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.photographer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' ||
      (filter === 'public' && photo.is_public) ||
      (filter === 'private' && !photo.is_public) ||
      (filter === 'favorites' && photo.is_favorite) ||
      (filter === 'rooms' && photo.room_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch && matchesFilter;
  });

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
          Caricamento libreria...
        </Loading>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Header>
          {userInfo && (
            <ProfileHeader>
              <Avatar>
                {userInfo.initial}
              </Avatar>
              <UserInfo>
                <UserName>
                  {userInfo.name || 'Utente'}
                  {isOwnLibrary && (
                    <span style={{
                      fontSize: '1rem',
                      background: 'white',
                      color: '#667eea',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      marginLeft: '15px',
                      fontWeight: '500'
                    }}>
                      La tua libreria
                    </span>
                  )}
                </UserName>
                <UserEmail>{userInfo.email}</UserEmail>
                
                <StatsGrid>
                  <StatItem>
                    <StatNumber>{stats.total}</StatNumber>
                    <StatLabel>Foto totali</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>{stats.public}</StatNumber>
                    <StatLabel>Pubbliche</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>{stats.private}</StatNumber>
                    <StatLabel>Private</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>{stats.favorites}</StatNumber>
                    <StatLabel>Preferite</StatLabel>
                  </StatItem>
                </StatsGrid>
              </UserInfo>
            </ProfileHeader>
          )}
          
          <Title>
            <FiUser />
            {isOwnLibrary ? 'La tua libreria' : 'Libreria di ' + (userInfo?.name || 'utente')}
          </Title>
        </Header>

        <Controls>
          <ViewControls>
            <ViewButton 
              active={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <FiGrid />
              Griglia
            </ViewButton>
            <ViewButton 
              active={view === 'list'}
              onClick={() => setView('list')}
            >
              <FiList />
              Lista
            </ViewButton>
          </ViewControls>
          
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
                placeholder="Cerca per stanza o autore..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '45px' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiFilter style={{ color: '#666' }} />
              <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Tutte le foto</option>
                <option value="public">Pubbliche</option>
                <option value="private">Private</option>
                <option value="favorites">Preferite</option>
              </FilterSelect>
            </div>
          </SearchBar>
        </Controls>

        {filteredPhotos.length === 0 ? (
          <EmptyState>
            <FiCamera size={48} style={{ marginBottom: '20px', color: '#94a3b8' }} />
            <h3>Libreria vuota</h3>
            <p>
              {isOwnLibrary 
                ? 'Aggiungi foto dalla galleria delle stanze per riempire la tua libreria!'
                : 'Questo utente non ha ancora foto nella libreria'
              }
            </p>
            {isOwnLibrary && (
              <Link 
                to="/shared-library" 
                style={{
                  display: 'inline-block',
                  marginTop: '20px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}
              >
                <FiUsers style={{ marginRight: '8px' }} />
                Esplora la libreria condivisa
              </Link>
            )}
          </EmptyState>
        ) : (
          <GalleryView view={view}>
            {filteredPhotos.map((photo) => (
              view === 'grid' ? (
                <PhotoCardGrid key={photo.id}>
                  <PhotoImageGrid onClick={() => setSelectedPhoto(photo)}>
                    <img 
                      src={photo.thumbnail_url || photo.photo_url} 
                      alt={`Foto di ${photo.photographer_name}`}
                    />
                    {photo.room_name && (
                      <RoomBadge>
                        {photo.room_name}
                      </RoomBadge>
                    )}
                  </PhotoImageGrid>
                  
                  <PhotoInfoGrid>
                    <PhotoHeader>
                      <PhotoDate>
                        <FiCalendar />
                        {formatDate(photo.taken_at)}
                      </PhotoDate>
                      <VisibilityBadge public={photo.is_public}>
                        {photo.is_public ? <FiEye /> : <FiEyeOff />}
                        {photo.is_public ? 'Pubblica' : 'Privata'}
                      </VisibilityBadge>
                    </PhotoHeader>
                    
                    {photo.photographer_name && (
                      <div style={{ 
                        color: '#666', 
                        fontSize: '0.9rem',
                        marginBottom: '10px'
                      }}>
                        <FiUser style={{ marginRight: '5px' }} />
                        {photo.photographer_name}
                      </div>
                    )}
                    
                    <PhotoActions view={view}>
                      {!photo.in_library ? (
                        <FavoriteButton 
                          onClick={() => handleAddToLibrary(photo.id)}
                        >
                          <FiHeart />
                          Salva
                        </FavoriteButton>
                      ) : (
                        <DeleteButton 
                          onClick={() => handleRemoveFromLibrary(photo.id)}
                        >
                          <FiTrash2 />
                          Rimuovi
                        </DeleteButton>
                      )}
                      
                      <ActionButton onClick={() => handleDownload(photo.photo_url, photo.id)}>
                        <FiDownload />
                        Scarica
                      </ActionButton>
                      
                      <ActionButton onClick={() => handleShare(photo.id)}>
                        <FiShare2 />
                        Condividi
                      </ActionButton>
                    </PhotoActions>
                    
                    {isOwnLibrary && (
                      <div style={{ marginTop: '15px' }}>
                        <button
                          onClick={() => handleToggleVisibility(photo.id, photo.is_public)}
                          style={{
                            padding: '8px 16px',
                            background: '#f1f5f9',
                            color: '#334155',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {photo.is_public ? <FiEyeOff /> : <FiEye />}
                          {photo.is_public ? 'Rendi privata' : 'Rendi pubblica'}
                        </button>
                        
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          style={{
                            padding: '8px 16px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            marginLeft: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <FiTrash2 />
                          Elimina
                        </button>
                      </div>
                    )}
                  </PhotoInfoGrid>
                </PhotoCardGrid>
              ) : (
                <PhotoCardList key={photo.id}>
                  <PhotoImageList onClick={() => setSelectedPhoto(photo)}>
                    <img 
                      src={photo.thumbnail_url || photo.photo_url} 
                      alt={`Foto di ${photo.photographer_name}`}
                    />
                    {photo.room_name && (
                      <RoomBadge>
                        {photo.room_name}
                      </RoomBadge>
                    )}
                  </PhotoImageList>
                  
                  <PhotoInfoList>
                    <div>
                      <PhotoHeader>
                        <div>
                          <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                            {photo.photographer_name || 'Utente'}
                          </div>
                          <PhotoDate>
                            <FiCalendar />
                            {formatDate(photo.taken_at)}
                          </PhotoDate>
                        </div>
                        <VisibilityBadge public={photo.is_public}>
                          {photo.is_public ? <FiEye /> : <FiEyeOff />}
                          {photo.is_public ? 'Pubblica' : 'Privata'}
                        </VisibilityBadge>
                      </PhotoHeader>
                      
                      {photo.room_name && (
                        <div style={{ 
                          color: '#666', 
                          fontSize: '0.9rem',
                          margin: '10px 0'
                        }}>
                          📍 {photo.room_name}
                        </div>
                      )}
                    </div>
                    
                    <PhotoActions view={view}>
                      {!photo.in_library ? (
                        <FavoriteButton 
                          onClick={() => handleAddToLibrary(photo.id)}
                        >
                          <FiHeart />
                          Salva
                        </FavoriteButton>
                      ) : (
                        <DeleteButton 
                          onClick={() => handleRemoveFromLibrary(photo.id)}
                        >
                          <FiTrash2 />
                          Rimuovi
                        </DeleteButton>
                      )}
                      
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
              alt={`Foto di ${selectedPhoto.photographer_name}`}
            />
            <div style={{ 
              padding: '20px',
              background: 'white',
              borderTop: '1px solid #e1e1e1'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {selectedPhoto.photographer_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#333' }}>
                    {selectedPhoto.photographer_name || 'Utente'}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    {formatDate(selectedPhoto.taken_at)}
                  </div>
                </div>
              </div>
              
              {selectedPhoto.room_name && (
                <div style={{ 
                  background: '#f1f5f9',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  color: '#334155',
                  marginBottom: '15px'
                }}>
                  📍 {selectedPhoto.room_name}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleDownload(selectedPhoto.photo_url, selectedPhoto.id)}
                  style={{
                    padding: '10px 20px',
                    background: '#f1f5f9',
                    color: '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiDownload />
                  Scarica
                </button>
                
                <button
                  onClick={() => handleShare(selectedPhoto.id)}
                  style={{
                    padding: '10px 20px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiShare2 />
                  Condividi
                </button>
              </div>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default UserLibrary;