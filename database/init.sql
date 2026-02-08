-- Active: 1766043419480@@127.0.0.1@5433@photobooth_app
-- ============================================
-- INIZIALIZZAZIONE DATABASE PHOTOBOOTH APP
-- ============================================
-- Eseguire questo script su PostgreSQL (pgAdmin) su porta 5433
-- Database: photobooth_app
-- Utente: postgres
-- Password: 2008
-- ============================================

-- 1. Cancella tabelle se esistono (per pulizia)
DROP TABLE IF EXISTS photo_library CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS room_participants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Tabella utenti
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 3. Tabella sessioni utente
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabella stanze
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE NOT NULL,
    room_name VARCHAR(100),
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{"interval": 60, "photo_retention_days": 30, "notifications": true}'::jsonb
);

-- 5. Tabella partecipanti stanze
CREATE TABLE room_participants (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(room_id, user_id)
);

-- 6. Tabella foto
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    device_info TEXT,
    is_public BOOLEAN DEFAULT TRUE
);

-- 7. Tabella libreria foto
CREATE TABLE photo_library (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN DEFAULT FALSE,
    UNIQUE(photo_id, user_id)
);

-- 8. Tabella notifiche
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms')),
    message TEXT NOT NULL,
    scheduled_for TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled', 'read')),
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL
);

-- ============================================
-- CREAZIONE INDICI (dopo le tabelle)
-- ============================================

-- Indici per users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Indici per user_sessions
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Indici per rooms
CREATE INDEX idx_rooms_code ON rooms(room_code);
CREATE INDEX idx_rooms_created_by ON rooms(created_by);
CREATE INDEX idx_rooms_active ON rooms(is_active) WHERE is_active = TRUE;

-- Indici per room_participants
CREATE INDEX idx_room_participants_room_user ON room_participants(room_id, user_id);
CREATE INDEX idx_room_participants_active ON room_participants(room_id) WHERE is_active = TRUE;
CREATE INDEX idx_room_participants_user ON room_participants(user_id);

-- Indici per photos
CREATE INDEX idx_photos_user_room ON photos(user_id, room_id);
CREATE INDEX idx_photos_taken_at ON photos(taken_at DESC);
CREATE INDEX idx_photos_public ON photos(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_photos_room_taken ON photos(room_id, taken_at DESC);

-- Indici per photo_library
CREATE INDEX idx_photo_library_user ON photo_library(user_id);
CREATE INDEX idx_photo_library_added ON photo_library(added_at DESC);
CREATE INDEX idx_photo_library_favorites ON photo_library(user_id) WHERE is_favorite = TRUE;

-- Indici per notifications
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for, status);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_room ON notifications(room_id);

-- ============================================
-- Dati di esempio per testing
-- ============================================

-- Inserisci utenti demo (password: demo123 - hash bcrypt di "demo123")
INSERT INTO users (email, password_hash, full_name, phone, verified) VALUES
('demo@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Demo User', '+39 123 456 7890', true),
('andrea@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Andrea Rossi', '+39 333 123 4567', true),
('tobia@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Tobia Bianchi', '+39 333 987 6543', true)
ON CONFLICT (email) DO NOTHING;

-- Crea stanze demo
INSERT INTO rooms (room_code, room_name, created_by, settings) VALUES
('ABC123', 'Vacanza Sicilia 2024', 1, '{"interval": 60, "photo_retention_days": 30, "notifications": true}'),
('DEF456', 'Festa Compleanno', 2, '{"interval": 30, "photo_retention_days": 7, "notifications": true}'),
('GHI789', 'Team Building', 3, '{"interval": 120, "photo_retention_days": 90, "notifications": true}')
ON CONFLICT (room_code) DO NOTHING;

-- Aggiungi partecipanti alle stanze
INSERT INTO room_participants (room_id, user_id) VALUES
(1, 1), (1, 2), (1, 3),  -- Tutti nella stanza 1
(2, 2), (2, 3),          -- Andrea e Tobia nella stanza 2
(3, 3), (3, 1)           -- Tobia e Demo nella stanza 3
ON CONFLICT (room_id, user_id) DO NOTHING;

-- Inserisci foto demo (usa URL placeholder)
INSERT INTO photos (user_id, room_id, photo_url, thumbnail_url, metadata, device_info) VALUES
(1, 1, '/uploads/photo1.jpg', '/uploads/thumb1.jpg', 
 '{"location": "Sicilia", "weather": "sunny"}', 'iPhone 13'),
(2, 1, '/uploads/photo2.jpg', '/uploads/thumb2.jpg', 
 '{"location": "Sicilia", "weather": "sunny"}', 'Samsung Galaxy S21'),
(3, 1, '/uploads/photo3.jpg', '/uploads/thumb3.jpg', 
 '{"location": "Sicilia", "weather": "sunny"}', 'Google Pixel 6'),
(2, 2, '/uploads/photo4.jpg', '/uploads/thumb4.jpg', 
 '{"event": "birthday", "guests": 15}', 'iPhone 12'),
(3, 2, '/uploads/photo5.jpg', '/uploads/thumb5.jpg', 
 '{"event": "birthday", "guests": 15}', 'OnePlus 9')
ON CONFLICT DO NOTHING;

-- Aggiungi foto alla libreria
INSERT INTO photo_library (photo_id, user_id, is_favorite) VALUES
(1, 2, true), (1, 3, false),  -- Andrea e Tobia salvano la foto di Demo
(2, 1, true), (2, 3, true),   -- Demo e Tobia salvano la foto di Andrea
(3, 1, false), (3, 2, true)   -- Demo e Andrea salvano la foto di Tobia
ON CONFLICT (photo_id, user_id) DO NOTHING;

-- Crea notifiche demo
INSERT INTO notifications (user_id, type, message, scheduled_for, room_id, status, sent_at) VALUES
(1, 'email', '📸 È ora di scattare la tua foto nella stanza Vacanza Sicilia 2024!', 
 NOW() - INTERVAL '1 hour', 1, 'sent', NOW() - INTERVAL '1 hour'),
(2, 'email', '📸 È ora di scattare la tua foto nella stanza Vacanza Sicilia 2024!', 
 NOW() - INTERVAL '1 hour', 1, 'sent', NOW() - INTERVAL '1 hour'),
(3, 'sms', 'Foto time! Stanza: Vacanza Sicilia 2024, Codice: ABC123', 
 NOW(), 1, 'pending', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- Viste per report
-- ============================================

-- Vista per statistiche utente
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    COUNT(DISTINCT r.id) as rooms_created,
    COUNT(DISTINCT rp.room_id) as rooms_joined,
    COUNT(DISTINCT p.id) as photos_taken,
    COUNT(DISTINCT pl.id) as photos_in_library
FROM users u
LEFT JOIN rooms r ON u.id = r.created_by
LEFT JOIN room_participants rp ON u.id = rp.user_id AND rp.is_active = TRUE
LEFT JOIN photos p ON u.id = p.user_id
LEFT JOIN photo_library pl ON u.id = pl.user_id
GROUP BY u.id, u.email, u.full_name;

-- Vista per statistiche stanza
CREATE OR REPLACE VIEW room_stats AS
SELECT 
    r.id as room_id,
    r.room_code,
    r.room_name,
    r.created_by,
    u.full_name as creator_name,
    COUNT(DISTINCT rp.user_id) as participant_count,
    COUNT(DISTINCT p.id) as photo_count,
    MAX(p.taken_at) as last_photo_at
FROM rooms r
JOIN users u ON r.created_by = u.id
LEFT JOIN room_participants rp ON r.id = rp.room_id AND rp.is_active = TRUE
LEFT JOIN photos p ON r.id = p.room_id
GROUP BY r.id, r.room_code, r.room_name, r.created_by, u.full_name;

-- ============================================
-- Funzioni e trigger
-- ============================================

-- Funzione per pulizia automatica foto vecchie
CREATE OR REPLACE FUNCTION cleanup_old_photos()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM photos p
    WHERE p.taken_at < NOW() - INTERVAL '30 days'
    AND p.room_id IN (
        SELECT id FROM rooms 
        WHERE (settings->>'photo_retention_days')::INTEGER <= 30
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger per invalidare sessioni scadute
CREATE OR REPLACE FUNCTION invalidate_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_session_expiry
AFTER INSERT ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION invalidate_expired_sessions();

-- ============================================
-- Messaggio di completamento
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ Database Photobooth inizializzato con successo!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Utenti demo creati:';
    RAISE NOTICE '  - demo@example.com / demo123';
    RAISE NOTICE '  - andrea@example.com / demo123';
    RAISE NOTICE '  - tobia@example.com / demo123';
    RAISE NOTICE '';
    RAISE NOTICE 'Stanze demo:';
    RAISE NOTICE '  - ABC123: Vacanza Sicilia 2024';
    RAISE NOTICE '  - DEF456: Festa Compleanno';
    RAISE NOTICE '  - GHI789: Team Building';
    RAISE NOTICE '';
    RAISE NOTICE 'Per testare:';
    RAISE NOTICE '  1. Accedi con demo@example.com / demo123';
    RAISE NOTICE '  2. Vai su http://localhost:3000';
    RAISE NOTICE '============================================';
END $$;

TRUNCATE TABLE user_sessions;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
