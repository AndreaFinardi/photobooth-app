import React, { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { getUser, updateUserData } from '../utils/auth';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FiUser, FiMail, FiPhone, FiSave, FiEdit, FiCamera } from 'react-icons/fi';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  color: white;
  text-align: center;
  position: relative;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: white;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 3rem;
  border: 5px solid white;
`;

const EditAvatarButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ProfileBody = styled.div`
  padding: 40px;
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
  font-size: 0.9rem;
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
  
  &:disabled {
    background: #f5f5f5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const PrimaryButton = styled.button`
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 14px 28px;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #e2e8f0;
  }
`;

const StatsSection = styled.div`
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #e1e1e1;
`;

const StatsTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = getUser();
      setUser(currentUser);
      
      const response = await authAPI.getProfile();
      const { user: userData, stats: userStats } = response.data;
      
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
      
      setStats(userStats || {});
    } catch (err) {
      toast.error('Errore nel caricamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await authAPI.updateProfile(formData);
      
      updateUserData(response.data.user);
      setUser(response.data.user);
      setEditMode(false);
      
      toast.success('Profilo aggiornato con successo!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Errore durante l\'aggiornamento';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Caricamento profilo...</div>;
  }

  return (
    <ProfileContainer>
      <Header>
        <Title>👤 Il tuo profilo</Title>
        <Subtitle>Gestisci le tue informazioni personali e statistiche</Subtitle>
      </Header>

      <ProfileCard>
        <ProfileHeader>
          <Avatar>
            {user?.full_name?.charAt(0) || 'U'}
          </Avatar>
          
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>
            {user?.full_name || 'Utente'}
          </h2>
          <p style={{ opacity: 0.9, marginTop: '5px' }}>
            {user?.email}
          </p>
          
          <EditAvatarButton onClick={() => setEditMode(!editMode)}>
            <FiEdit />
          </EditAvatarButton>
        </ProfileHeader>

        <ProfileBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>
                <FiUser />
                Nome completo
              </Label>
              <Input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={!editMode}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <FiMail />
                Email
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{ background: '#f5f5f5' }}
              />
              <small style={{ color: '#666', fontSize: '0.8rem' }}>
                L'email non può essere modificata
              </small>
            </FormGroup>

            <FormGroup>
              <Label>
                <FiPhone />
                Telefono
              </Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editMode}
                placeholder="+39 123 456 7890"
              />
            </FormGroup>

            <ButtonGroup>
              {editMode ? (
                <>
                  <PrimaryButton type="submit" disabled={saving}>
                    <FiSave />
                    {saving ? 'Salvataggio...' : 'Salva modifiche'}
                  </PrimaryButton>
                  <SecondaryButton type="button" onClick={() => {
                    setEditMode(false);
                    loadProfile(); // Reset form
                  }}>
                    Annulla
                  </SecondaryButton>
                </>
              ) : (
                <PrimaryButton type="button" onClick={() => setEditMode(true)}>
                  <FiEdit />
                  Modifica profilo
                </PrimaryButton>
              )}
            </ButtonGroup>
          </Form>

          <StatsSection>
            <StatsTitle>📊 Le tue statistiche</StatsTitle>
            <StatsGrid>
              <StatItem>
                <StatValue>{stats.rooms_created || 0}</StatValue>
                <StatLabel>Stanze create</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{stats.rooms_joined || 0}</StatValue>
                <StatLabel>Stanze partecipate</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{stats.photos_taken || 0}</StatValue>
                <StatLabel>Foto scattate</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{stats.photos_in_library || 0}</StatValue>
                <StatLabel>Foto in libreria</StatLabel>
              </StatItem>
            </StatsGrid>
          </StatsSection>
        </ProfileBody>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default Profile;