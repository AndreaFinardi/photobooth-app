import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { photoAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { 
  FiCamera, FiRotateCw, FiDownload, FiUpload,
  FiCheck, FiX, FiRefreshCw, FiSettings
} from 'react-icons/fi';

const CameraContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const CameraWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const WebcamContainer = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  background: #000;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const StyledWebcam = styled(Webcam)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CapturedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px;
`;

const CameraControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  padding: 15px 30px;
  background: ${props => props.primary ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    props.danger ? '#dc2626' : '#f1f5f9'
  };
  color: ${props => props.primary || props.danger ? 'white' : '#334155'};
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CaptureButton = styled(ControlButton)`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  padding: 0;
  justify-content: center;
  background: white;
  border: 4px solid #667eea;
  color: #667eea;
  font-size: 2rem;
  
  &:hover {
    background: #667eea;
    color: white;
    transform: scale(1.1);
  }
`;

const SettingsPanel = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-top: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const SettingsTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const SettingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SettingLabel = styled.label`
  font-weight: 500;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  padding: 10px 15px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
  
  input {
    width: 18px;
    height: 18px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 15px;
  z-index: 10;
`;

const FlashEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  opacity: 0;
  pointer-events: none;
  border-radius: 15px;
  
  &.active {
    animation: flash 0.5s ease-out;
  }
`;

const CountdownOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  z-index: 5;
`;

const CameraComponent = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' o 'environment'
  const [isPublic, setIsPublic] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [videoConstraints, setVideoConstraints] = useState({
    facingMode: 'user',
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  });

  // Inizializza la fotocamera
  useEffect(() => {
    startCamera();
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setCameraError(false);
      
      // Verifica se la fotocamera è disponibile
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setCameraError(true);
        return;
      }

      // Imposta i constraint in base alla modalità
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      // Prova ad accedere alla fotocamera
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Errore accesso fotocamera:', error);
      setCameraError(true);
      toast.error('Errore accesso fotocamera. Controlla i permessi.');
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          capturePhoto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    if (!webcamRef.current) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setShowFlash(true);
      
      setTimeout(() => {
        setShowFlash(false);
      }, 500);
    } catch (error) {
      toast.error('Errore durante la cattura della foto');
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setVideoConstraints({
      ...videoConstraints,
      facingMode: facingMode === 'user' ? 'environment' : 'user'
    });
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const uploadPhoto = async () => {
    if (!capturedImage || !roomId) return;

    setLoading(true);

    try {
      // Converti base64 in file
      const blob = await fetch(capturedImage).then(res => res.blob());
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('photo', file);
      formData.append('is_public', isPublic.toString());
      formData.append('metadata', JSON.stringify({
        facingMode,
        timestamp: new Date().toISOString(),
        device: navigator.userAgent,
        resolution: '1280x720'
      }));

      await photoAPI.uploadPhoto(roomId, formData);
      
      toast.success('Foto caricata con successo!');
      setTimeout(() => {
        navigate(`/room/${roomId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Errore upload:', error);
      toast.error('Errore nel caricamento della foto');
    } finally {
      setLoading(false);
    }
  };

  const downloadPhoto = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `photobooth-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Foto scaricata!');
  };

  if (cameraError) {
    return (
      <CameraContainer>
        <Header>
          <Title>
            <FiCamera />
            Fotocamera
          </Title>
          <p style={{ color: '#666' }}>Impossibile accedere alla fotocamera</p>
        </Header>
        
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '15px',
          marginTop: '20px'
        }}>
          <h3>⚠️ Permessi fotocamera richiesti</h3>
          <p style={{ color: '#666', margin: '20px 0' }}>
            Per utilizzare la fotocamera, devi dare il permesso nel tuo browser.
          </p>
          <ol style={{ 
            textAlign: 'left', 
            maxWidth: '400px', 
            margin: '20px auto',
            color: '#666'
          }}>
            <li>Clicca sull'icona 🔒 nella barra degli indirizzi</li>
            <li>Seleziona "Sito Impostazioni"</li>
            <li>Imposta "Fotocamera" su "Consenti"</li>
            <li>Ricarica la pagina</li>
          </ol>
          <ControlButton onClick={startCamera}>
            <FiRefreshCw />
            Riprova
          </ControlButton>
        </div>
      </CameraContainer>
    );
  }

  return (
    <CameraContainer>
      <Header>
        <Title>
          <FiCamera />
          Fotocamera
        </Title>
        <p style={{ color: '#666' }}>
          {roomId ? 'Scatta una foto per la stanza' : 'Scatta una foto'}
        </p>
      </Header>

      <CameraWrapper>
        <WebcamContainer>
          {capturedImage ? (
            <CapturedImage src={capturedImage} alt="Foto scattata" />
          ) : (
            <>
              <StyledWebcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                mirrored={facingMode === 'user'}
                style={{
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                }}
              />
              
              {countdown > 0 && (
                <CountdownOverlay>
                  {countdown}
                </CountdownOverlay>
              )}
            </>
          )}
          
          {showFlash && (
            <FlashEffect className="active" />
          )}
          
          {loading && (
            <LoadingOverlay>
              <div style={{
                width: '50px',
                height: '50px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
              }} />
              Caricamento foto...
            </LoadingOverlay>
          )}
        </WebcamContainer>

        <CameraControls>
          {capturedImage ? (
            <>
              <ControlButton onClick={retakePhoto} danger>
                <FiX />
                Rifai
              </ControlButton>
              
              <ControlButton onClick={downloadPhoto}>
                <FiDownload />
                Scarica
              </ControlButton>
              
              <ControlButton onClick={uploadPhoto} primary disabled={loading}>
                <FiUpload />
                {loading ? 'Caricamento...' : 'Carica Foto'}
              </ControlButton>
            </>
          ) : (
            <>
              <ControlButton onClick={toggleCamera}>
                <FiRotateCw />
                {facingMode === 'user' ? 'Posteriore' : 'Frontale'}
              </ControlButton>
              
              <CaptureButton onClick={startCountdown} disabled={countdown > 0}>
                <FiCamera />
              </CaptureButton>
              
              <ControlButton onClick={() => navigate(-1)}>
                <FiX />
                Annulla
              </ControlButton>
            </>
          )}
        </CameraControls>
      </CameraWrapper>

      <SettingsPanel>
        <SettingsTitle>
          <FiSettings />
          Impostazioni foto
        </SettingsTitle>
        <SettingsGrid>
          <SettingItem>
            <SettingLabel>
              Fotocamera
            </SettingLabel>
            <Select 
              value={facingMode} 
              onChange={(e) => setFacingMode(e.target.value)}
              disabled={!!capturedImage}
            >
              <option value="user">Frontale (selfie)</option>
              <option value="environment">Posteriore</option>
            </Select>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>
              Qualità
            </SettingLabel>
            <Select defaultValue="high">
              <option value="high">Alta (1280×720)</option>
              <option value="medium">Media (640×480)</option>
              <option value="low">Bassa (320×240)</option>
            </Select>
          </SettingItem>
          
          <SettingItem>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span>Rendi foto pubblica</span>
            </CheckboxLabel>
            <small style={{ color: '#666' }}>
              {isPublic 
                ? 'La foto sarà visibile a tutti' 
                : 'Solo i partecipanti potranno vedere questa foto'
              }
            </small>
          </SettingItem>
        </SettingsGrid>
      </SettingsPanel>
    </CameraContainer>
  );
};

export default CameraComponent;