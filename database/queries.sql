-- ============================================
-- QUERY UTILI PER PGADMIN - PHOTOBOOTH APP
-- ============================================
-- Eseguire queste query nel database photobooth_app
-- ============================================

-- 1. VISUALIZZA TUTTI GLI UTENTI
SELECT 
    id,
    email,
    full_name,
    phone,
    verified,
    created_at,
    (SELECT COUNT(*) FROM rooms WHERE created_by = users.id) as rooms_created,
    (SELECT COUNT(*) FROM photos WHERE user_id = users.id) as photos_taken
FROM users
ORDER BY created_at DESC;

-- 2. VISUALIZZA TUTTE LE STANZE
SELECT 
    r.id,
    r.room_code,
    r.room_name,
    u.email as creator_email,
    u.full_name as creator_name,
    r.created_at,
    r.is_active,
    (SELECT COUNT(*) FROM room_participants rp WHERE rp.room_id = r.id AND rp.is_active = TRUE) as participant_count,
    (SELECT COUNT(*) FROM photos p WHERE p.room_id = r.id) as photo_count,
    r.settings
FROM rooms r
JOIN users u ON r.created_by = u.id
ORDER BY r.created_at DESC;

-- 3. PARTECIPANTI PER STANZA
SELECT 
    r.room_code,
    r.room_name,
    u.email,
    u.full_name,
    u.phone,
    rp.joined_at,
    rp.is_active
FROM room_participants rp
JOIN rooms r ON rp.room_id = r.id
JOIN users u ON rp.user_id = u.id
WHERE rp.is_active = TRUE
ORDER BY r.room_name, rp.joined_at;

-- 4. FOTO PER UTENTE (es: Andrea vede foto di Tobia)
SELECT 
    p.id,
    p.photo_url,
    p.taken_at,
    p.is_public,
    r.room_name,
    r.room_code,
    u_owner.email as photographer_email,
    u_owner.full_name as photographer_name,
    EXISTS (
        SELECT 1 FROM photo_library pl 
        WHERE pl.photo_id = p.id 
        AND pl.user_id = (SELECT id FROM users WHERE email = 'andrea@example.com')
    ) as in_andrea_library
FROM photos p
JOIN users u_owner ON p.user_id = u_owner.id
LEFT JOIN rooms r ON p.room_id = r.id
WHERE u_owner.email = 'tobia@example.com'
AND p.is_public = TRUE
ORDER BY p.taken_at DESC;

-- 5. STATISTICHE COMPLETE
SELECT
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM rooms WHERE is_active = TRUE) as active_rooms,
    (SELECT COUNT(*) FROM photos) as total_photos,
    (SELECT COUNT(*) FROM photos WHERE taken_at >= NOW() - INTERVAL '24 hours') as photos_last_24h,
    (SELECT COUNT(*) FROM notifications WHERE status = 'sent' AND sent_at >= NOW() - INTERVAL '24 hours') as notifications_last_24h,
    (SELECT COUNT(DISTINCT room_id) FROM photos WHERE taken_at >= NOW() - INTERVAL '7 days') as active_rooms_last_7d;

-- 6. NOTIFICHE PENDENTI
SELECT 
    n.id,
    u.email,
    u.full_name,
    n.type,
    n.message,
    n.scheduled_for,
    n.status,
    r.room_name,
    r.room_code
FROM notifications n
JOIN users u ON n.user_id = u.id
LEFT JOIN rooms r ON n.room_id = r.id
WHERE n.status = 'pending'
AND n.scheduled_for <= NOW()
ORDER BY n.scheduled_for;

-- 7. LIBRERIA UTENTE (es: Andrea)
SELECT 
    p.id,
    p.photo_url,
    p.taken_at,
    u_owner.full_name as photographer_name,
    r.room_name,
    pl.added_at,
    pl.is_favorite
FROM photo_library pl
JOIN photos p ON pl.photo_id = p.id
JOIN users u_owner ON p.user_id = u_owner.id
LEFT JOIN rooms r ON p.room_id = r.id
WHERE pl.user_id = (SELECT id FROM users WHERE email = 'andrea@example.com')
ORDER BY pl.added_at DESC;

-- 8. FOTO PIÙ RECENTI (per homepage)
SELECT 
    p.*,
    u.full_name as user_name,
    u.email as user_email,
    r.room_name,
    r.room_code
FROM photos p
JOIN users u ON p.user_id = u.id
LEFT JOIN rooms r ON p.room_id = r.id
WHERE p.is_public = TRUE
ORDER BY p.taken_at DESC
LIMIT 20;

-- 9. ATTIVITÀ UTENTE (timeline)
SELECT 
    'room_created' as activity_type,
    r.created_at as timestamp,
    r.room_name as details,
    u.full_name as user_name
FROM rooms r
JOIN users u ON r.created_by = u.id

UNION ALL

SELECT 
    'photo_taken' as activity_type,
    p.taken_at as timestamp,
    CONCAT('Foto in ', r.room_name) as details,
    u.full_name as user_name
FROM photos p
JOIN users u ON p.user_id = u.id
LEFT JOIN rooms r ON p.room_id = r.id

UNION ALL

SELECT 
    'room_joined' as activity_type,
    rp.joined_at as timestamp,
    CONCAT('Unito a ', r.room_name) as details,
    u.full_name as user_name
FROM room_participants rp
JOIN users u ON rp.user_id = u.id
JOIN rooms r ON rp.room_id = r.id

ORDER BY timestamp DESC
LIMIT 50;

-- 10. PULIZIA FOTO VECCHIE (esegui manualmente o come job)
-- SELECT cleanup_old_photos();

-- 11. DISATTIVA STANZE INATTIVE (più di 30 giorni senza foto)
UPDATE rooms r
SET is_active = FALSE
WHERE is_active = TRUE
AND NOT EXISTS (
    SELECT 1 FROM photos p 
    WHERE p.room_id = r.id 
    AND p.taken_at >= NOW() - INTERVAL '30 days'
)
AND created_at < NOW() - INTERVAL '30 days';

-- ============================================
-- QUERY PER TROUBLESHOOTING
-- ============================================

-- A. Controlla connessioni database
SELECT 
    COUNT(*) as total_connections,
    COUNT(*) FILTER (WHERE state = 'active') as active_connections,
    COUNT(*) FILTER (WHERE state = 'idle') as idle_connections
FROM pg_stat_activity
WHERE datname = 'photobooth_app';

-- B. Controlla dimensioni tabelle
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - pg_relation_size(schemaname || '.' || tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- C. Performance query lente
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- ============================================
-- RESET DATABASE (ATTENZIONE!)
-- ============================================
/*
-- 1. Ferma tutte le connessioni
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'photobooth_app';

-- 2. Elimina e ricrea database
DROP DATABASE IF EXISTS photobooth_app;
CREATE DATABASE photobooth_app OWNER postgres;

-- 3. Esegui nuovamente init.sql
*/