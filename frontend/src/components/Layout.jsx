import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser, logout } from '../utils/auth';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { 
  FiHome, FiCamera, FiUsers, FiImage, 
  FiUser, FiLogOut, FiBell, FiMenu, FiX,
  FiGlobe, FiSettings, FiMessageSquare
} from 'react-icons/fi';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
  
  @media (max-width: 768px) {
    display: ${props => props.mobileOpen ? 'flex' : 'none'};
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    gap: 0;
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.active ? '#667eea' : '#334155'};
  text-decoration: none;
  font-weight: ${props => props.active ? '600' : '500'};
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
    color: #667eea;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 15px;
    border-bottom: 1px solid #e1e1e1;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Notifications = styled.div`
  position: relative;
  cursor: pointer;
  
  .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #ef4444;
    color: white;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 100;
  overflow: hidden;
  display: ${props => props.open ? 'block' : 'none'};
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: #334155;
  text-decoration: none;
  transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
  
  &:hover {
    background: #f8f9fa;
    color: #667eea;
  }
  
  &:last-child {
    border-bottom: none;
    color: #ef4444;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #334155;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px 0;
  background: #f8f9fa;
`;

const Footer = styled.footer`
  background: white;
  border-top: 1px solid #e1e1e1;
  padding: 30px 20px;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 20px;
  
  a {
    color: #666;
    text-decoration: none;
    
    &:hover {
      color: #667eea;
      text-decoration: underline;
    }
  }
`;

const Copyright = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock

  const handleLogout = () => {
    logout();
    toast.success('Logout effettuato con successo');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  useEffect(() => {
    // Chiudi il dropdown quando cambi pagina
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  return (
    <LayoutContainer>
      <Header>
        <NavContainer>
          <Nav>
            <Logo to="/dashboard">
              📸 Photobooth
            </Logo>

            <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </MobileMenuButton>

            <NavLinks mobileOpen={mobileMenuOpen}>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>
                <FiHome />
                Dashboard
              </NavLink>
              
              <NavLink to="/rooms" active={isActive('/rooms')}>
                <FiUsers />
                Stanze
              </NavLink>
              
              <NavLink to="/shared-library" active={isActive('/shared-library')}>
                <FiGlobe />
                Libreria Condivisa
              </NavLink>
              
              <NavLink to={`/library/${user?.id}`} active={isActive('/library')}>
                <FiImage />
                La Mia Libreria
              </NavLink>
              
              <NavLink to="/create-room" active={isActive('/create-room')}>
                <FiCamera />
                Crea Stanza
              </NavLink>
            </NavLinks>

            <UserSection>
              <Notifications>
                <FiBell size={20} color="#666" />
                {notifications > 0 && (
                  <span className="badge">{notifications}</span>
                )}
              </Notifications>
              
              <UserMenu>
                <UserAvatar onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {user?.full_name?.charAt(0) || 'U'}
                </UserAvatar>
                
                <DropdownMenu open={dropdownOpen}>
                  <DropdownItem to="/profile">
                    <FiUser />
                    Il mio profilo
                  </DropdownItem>
                  
                  <DropdownItem to={`/library/${user?.id}`}>
                    <FiImage />
                    La mia libreria
                  </DropdownItem>
                  
                  <DropdownItem to="/settings">
                    <FiSettings />
                    Impostazioni
                  </DropdownItem>
                  
                  <DropdownItem to="/help">
                    <FiMessageSquare />
                    Aiuto
                  </DropdownItem>
                  
                  <DropdownItem as="div" onClick={handleLogout}>
                    <FiLogOut />
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </UserMenu>
            </UserSection>
          </Nav>
        </NavContainer>
      </Header>

      <MainContent>
        <Outlet />
      </MainContent>

      <Footer>
        <FooterContent>
          <Copyright>
            © {new Date().getFullYear()} Photobooth App. Tutti i diritti riservati.
          </Copyright>
          
          <FooterLinks>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Termini di Servizio</Link>
            <Link to="/contact">Contatti</Link>
            <Link to="/help">Aiuto</Link>
          </FooterLinks>
        </FooterContent>
      </Footer>
    </LayoutContainer>
  );
};

export default Layout;