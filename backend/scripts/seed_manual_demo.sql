-- Wyłącznie lokalne konta do testów ręcznych. Hasło: Demo-Queue-2026
-- Zgodne z obecnym haszowaniem haseł projektu; dane nie są przeznaczone do produkcji.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
    IF current_database() <> 'queue_system_local' THEN
        RAISE EXCEPTION 'Use the dedicated queue_system_local database';
    END IF;
END $$;

INSERT INTO users (id, email, password_hash, role, first_name, last_name,
                   language, is_verified, is_active)
VALUES
('10000000-0000-4000-8000-000000000001', 'client1@example.com',
 'c3361fd933abbb36c63c1f241e7d78d7af0b5196f2ba788d70b0308c0b2005df', 'client', 'Demo', 'Client One', 'en', true, true),
('10000000-0000-4000-8000-000000000002', 'client2@example.com',
 'c3361fd933abbb36c63c1f241e7d78d7af0b5196f2ba788d70b0308c0b2005df', 'client', 'Demo', 'Client Two', 'en', true, true),
('10000000-0000-4000-8000-000000000003', 'staff@example.com',
 'c3361fd933abbb36c63c1f241e7d78d7af0b5196f2ba788d70b0308c0b2005df', 'employee', 'Demo', 'Staff', 'en', true, true),
('10000000-0000-4000-8000-000000000004', 'admin@example.com',
 'c3361fd933abbb36c63c1f241e7d78d7af0b5196f2ba788d70b0308c0b2005df', 'admin', 'Demo', 'Admin', 'en', true, true)
ON CONFLICT DO NOTHING;

INSERT INTO institutions (id, name)
VALUES ('20000000-0000-4000-8000-000000000001', 'Local Demo Institution')
ON CONFLICT DO NOTHING;

INSERT INTO services (id, institution_id, name, standard_duration, max_queue_length, is_active)
VALUES ('30000000-0000-4000-8000-000000000001',
 '20000000-0000-4000-8000-000000000001', 'Local Demo Service', 15, 50, true)
ON CONFLICT DO NOTHING;

INSERT INTO institution_employees (id, institution_id, user_id, employee_status)
VALUES ('40000000-0000-4000-8000-000000000001',
 '20000000-0000-4000-8000-000000000001',
 '10000000-0000-4000-8000-000000000003', 'active'),
('40000000-0000-4000-8000-000000000002',
 '20000000-0000-4000-8000-000000000001',
 '10000000-0000-4000-8000-000000000004', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO employee_services (id, employee_id, service_id)
VALUES ('50000000-0000-4000-8000-000000000001',
 '40000000-0000-4000-8000-000000000001',
 '30000000-0000-4000-8000-000000000001')
ON CONFLICT DO NOTHING;
COMMIT;
