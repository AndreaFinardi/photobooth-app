import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import styled from 'styled-components';
import { FiCamera, FiUsers, FiBell, FiUpload } from 'react-icons/fi';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  font-weight: 700;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto 40px;
  opacity: 0.9;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(Link)`
  padding: 16px 32px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
  }
`;

const SecondaryButton = styled(Link)`
  padding: 16px 32px;
  background: transparent;
  color: white;
  text-decoration: none;
  border: 2px solid white;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
  }
`;

const FeaturesSection = styled.section`
  padding: 80px 20px;
  background: #f8f9fa;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: #333;
`;

const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 40px 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  color: white;
  
  svg {
    width: 40px;
    height: 40px;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const HowItWorks = styled.section`
  padding: 80px 20px;
  background: white;
`;

const StepsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 50px;
  position: relative;
  
  &:last-child::after {
    display: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    left: 40px;
    top: 80px;
    width: 2px;
    height: calc(100% - 30px);
    background: #e1e1e1;
    z-index: 1;
  }
`;

const StepNumber = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin-right: 30px;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
`;

const StepDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const CtaSection = styled.section`
  padding: 80px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
`;

const CtaTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const CtaText = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto 40px;
  opacity: 0.9;
`;

const HomePage = () => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <HeroSection>
        <HeroTitle>📸 Photobooth App</HeroTitle>
        <HeroSubtitle>
          Crea stanze, scatta foto ogni ora con gli amici e conserva i ricordi nella libreria condivisa.
          I promemoria automatici ti ricorderanno di catturare il momento!
        </HeroSubtitle>
        <ButtonGroup>
          <PrimaryButton to="/register">
            Inizia Gratis
          </PrimaryButton>
          <SecondaryButton to="/login">
            Accedi
          </SecondaryButton>
        </ButtonGroup>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>Perché Photobooth?</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>
              <FiCamera />
            </FeatureIcon>
            <FeatureTitle>Foto in Gruppo</FeatureTitle>
            <FeatureDescription>
              Crea stanze e invita amici. Scatta foto simultaneamente ogni ora e condividile in tempo reale.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <FiBell />
            </FeatureIcon>
            <FeatureTitle>Promemoria Automatici</FeatureTitle>
            <FeatureDescription>
              Ricevi notifiche via email o SMS ogni ora per ricordarti di scattare la tua foto.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <FiUsers />
            </FeatureIcon>
            <FeatureTitle>Libreria Condivisa</FeatureTitle>
            <FeatureDescription>
              Tutte le foto sono raccolte in una libreria che tutti i partecipanti possono esplorare.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <FiUpload />
            </FeatureIcon>
            <FeatureTitle>Accesso Sempre</FeatureTitle>
            <FeatureDescription>
              Accedi da qualsiasi dispositivo mobile o desktop. La fotocamera si adatta automaticamente.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <HowItWorks>
        <SectionTitle>Come Funziona</SectionTitle>
        <StepsContainer>
          <Step>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle>Registrati e Crea una Stanza</StepTitle>
              <StepDescription>
                Crea un account gratuito e genera una nuova stanza. Condividi il codice univoco con i tuoi amici.
              </StepDescription>
            </StepContent>
          </Step>

          <Step>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle>Unisciti e Scatta Foto</StepTitle>
              <StepDescription>
                I partecipanti si uniscono con il codice. Ogni ora tutti scattano una foto simultaneamente.
              </StepDescription>
            </StepContent>
          </Step>

          <Step>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle>Ricevi Promemoria</StepTitle>
              <StepDescription>
                Ogni ora ricevi una notifica che ti ricorda di scattare la tua foto. Non perderai mai un momento.
              </StepDescription>
            </StepContent>
          </Step>

          <Step>
            <StepNumber>4</StepNumber>
            <StepContent>
              <StepTitle>Esplora la Libreria</StepTitle>
              <StepDescription>
                Guarda tutte le foto nella libreria condivisa. Scarica, salva e condividi i tuoi ricordi preferiti.
              </StepDescription>
            </StepContent>
          </Step>
        </StepsContainer>
      </HowItWorks>

      <CtaSection>
        <CtaTitle>Pronto a iniziare?</CtaTitle>
        <CtaText>
          Unisciti a migliaia di utenti che stanno già catturando momenti speciali ogni ora.
        </CtaText>
        <ButtonGroup>
          <PrimaryButton to="/register" style={{ background: 'white', color: '#667eea' }}>
            Registrati Ora - È Gratis!
          </PrimaryButton>
        </ButtonGroup>
      </CtaSection>
    </div>
  );
};

export default HomePage;