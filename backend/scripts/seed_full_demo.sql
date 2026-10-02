-- Qast / queue_system full demo seed
-- Based on the current PostgreSQL schema dump (2026-10-02).
-- Intended for LOCAL / DEMO database only.
-- Uses fixed UUIDs and ON CONFLICT where appropriate so it can be re-run safely.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. USERS
-- ---------------------------------------------------------------------------
INSERT INTO users
(id, email, phone, password_hash, role, first_name, last_name, language, is_verified, is_active)
VALUES
('10000000-0000-0000-0000-000000000001', 'admin.demo@qast.local', '+48100000001', 'pbkdf2_sha256$600000$bc9e676b2a6b0bf2d719e33d1e99dc93$e2fce00b28944d51650c4a4f34c7c812f06015a53c619a74dbd4fc7aa71ebcb3', 'admin',    'Anna',  'Admin',    'pl', TRUE, TRUE),
('10000000-0000-0000-0000-000000000002', 'doctor.demo@qast.local', '+48100000002', 'pbkdf2_sha256$600000$bc9e676b2a6b0bf2d719e33d1e99dc93$e2fce00b28944d51650c4a4f34c7c812f06015a53c619a74dbd4fc7aa71ebcb3', 'employee', 'Jan',   'Kowalski', 'pl', TRUE, TRUE),
('10000000-0000-0000-0000-000000000003', 'nurse.demo@qast.local',  '+48100000003', 'pbkdf2_sha256$600000$bc9e676b2a6b0bf2d719e33d1e99dc93$e2fce00b28944d51650c4a4f34c7c812f06015a53c619a74dbd4fc7aa71ebcb3', 'employee', 'Ewa',   'Nowak',    'pl', TRUE, TRUE),
('10000000-0000-0000-0000-000000000004', 'client1.demo@qast.local','+48100000004', 'pbkdf2_sha256$600000$bc9e676b2a6b0bf2d719e33d1e99dc93$e2fce00b28944d51650c4a4f34c7c812f06015a53c619a74dbd4fc7aa71ebcb3', 'client',   'Maria', 'Zielinska','pl', TRUE, TRUE),
('10000000-0000-0000-0000-000000000005', 'client2.demo@qast.local','+48100000005', 'pbkdf2_sha256$600000$bc9e676b2a6b0bf2d719e33d1e99dc93$e2fce00b28944d51650c4a4f34c7c812f06015a53c619a74dbd4fc7aa71ebcb3', 'client',   'Piotr', 'Wisniewski','en',TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. INSTITUTION CATEGORIES
-- ---------------------------------------------------------------------------
INSERT INTO institution_categories (id, name, logo_url, key)
VALUES
('20000000-0000-0000-0000-000000000001', 'Healthcare',          'https://example.com/icons/healthcare.png', 'healthcare'),
('20000000-0000-0000-0000-000000000002', 'Banking & Finance',   'https://example.com/icons/banking.png',    'banking_finance'),
('20000000-0000-0000-0000-000000000003', 'Government Services', 'https://example.com/icons/government.png', 'government_services'),
('20000000-0000-0000-0000-000000000004', 'Beauty & Wellness',   'https://example.com/icons/beauty.png',     'beauty_wellness'),
('20000000-0000-0000-0000-000000000005', 'Education',           'https://example.com/icons/education.png',  'education'),
('20000000-0000-0000-0000-000000000006', 'Transport',           'https://example.com/icons/transport.png',  'transport'),
('20000000-0000-0000-0000-000000000007', 'Insurance',           'https://example.com/icons/insurance.png',  'insurance'),
('20000000-0000-0000-0000-000000000008', 'Legal Services',      'https://example.com/icons/legal.png',      'legal_services')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. INSTITUTIONS
-- ---------------------------------------------------------------------------
INSERT INTO institutions
(id, name, description, address, phone, email, calendar_enabled, category_id, latitude, longitude, photo_url)
VALUES
('30000000-0000-0000-0000-000000000001',
 'Qast Medical Center',
 'Demo medical institution for queue-system development.',
 'ul. Półwiejska 10, Poznań',
 '+48610000001',
 'medical@qast.local',
 TRUE,
 '20000000-0000-0000-0000-000000000001',
 52.4010, 16.9250,
 'https://example.com/images/qast-medical-center.jpg'),
('30000000-0000-0000-0000-000000000002',
 'Qast City Office',
 'Demo public service institution.',
 'ul. Libelta 16/20, Poznań',
 '+48610000002',
 'office@qast.local',
 TRUE,
 '20000000-0000-0000-0000-000000000003',
 52.4110, 16.9255,
 'https://example.com/images/qast-city-office.jpg')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. INSTITUTION WORKING HOURS (0=Monday ... 6=Sunday)
-- ---------------------------------------------------------------------------
INSERT INTO institution_working_hours
(id, institution_id, day_of_week, start_time, end_time)
VALUES
('31000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',0,'08:00','16:00'),
('31000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001',1,'08:00','16:00'),
('31000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001',2,'08:00','16:00'),
('31000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001',3,'08:00','16:00'),
('31000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000001',4,'08:00','16:00'),
('31000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000002',0,'07:30','15:30'),
('31000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000002',1,'07:30','15:30'),
('31000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000002',2,'07:30','15:30'),
('31000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000002',3,'07:30','15:30'),
('31000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000002',4,'07:30','15:30')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. EMPLOYEES
-- ---------------------------------------------------------------------------
INSERT INTO institution_employees
(id, institution_id, user_id, employee_status, room)
VALUES
('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','active','101'),
('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','active','102')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. SERVICES
-- ---------------------------------------------------------------------------
INSERT INTO services
(id, institution_id, name, description, standard_duration, max_queue_length, is_active)
VALUES
('50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','General Consultation','General medical consultation.',30,30,TRUE),
('50000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','Blood Test','Basic blood collection appointment.',15,20,TRUE),
('50000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','Document Service','Demo administrative document service.',20,40,TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employee_services (id, employee_id, service_id)
VALUES
('51000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001'),
('51000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7. EMPLOYEE HOURS
-- ---------------------------------------------------------------------------
INSERT INTO employee_working_hours
(id, employee_id, day_of_week, start_time, end_time)
VALUES
('52000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',0,'08:00','16:00'),
('52000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001',1,'08:00','16:00'),
('52000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000002',0,'09:00','15:00'),
('52000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000002',1,'09:00','15:00')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. HOLIDAYS / DAY CLOSURE
-- ---------------------------------------------------------------------------
INSERT INTO institution_holidays (id, institution_id, holiday_date, description)
VALUES
('53000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','2026-12-25','Christmas Day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO institution_day_closures
(institution_id, day, closed_at, closed_by, cancelled_count)
VALUES
('30000000-0000-0000-0000-000000000002','2026-12-24','2026-10-02 10:00:00','10000000-0000-0000-0000-000000000001',0)
ON CONFLICT (institution_id, day) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 9. SETTINGS
-- ---------------------------------------------------------------------------
INSERT INTO system_settings
(id, institution_id, default_visit_duration, confirmation_time_minutes,
 client_response_minutes, urgent_offer_5_enabled, urgent_offer_10_enabled,
 urgent_offer_15_enabled, max_queue_length)
VALUES
('54000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',30,20,2,TRUE,TRUE,TRUE,30),
('54000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002',20,20,2,TRUE,TRUE,FALSE,40)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 10. SERVICE SLOTS
-- ---------------------------------------------------------------------------
INSERT INTO service_slots
(id, service_id, employee_id, slot_start, slot_end, is_available)
VALUES
('60000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','2026-10-05 09:00:00','2026-10-05 09:30:00',FALSE),
('60000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','2026-10-05 09:30:00','2026-10-05 10:00:00',TRUE),
('60000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002','2026-10-05 10:00:00','2026-10-05 10:15:00',FALSE)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 11. QUEUE ENTRIES
-- ---------------------------------------------------------------------------
INSERT INTO queue_entries
(id, institution_id, service_id, client_id, employee_id, slot_id, queue_position,
 status, estimated_wait_time, delay_time, confirmation_sent_at,
 confirmation_expires_at, confirmed_at, arrival_time, queue_date, scheduled_at)
VALUES
('70000000-0000-0000-0000-000000000001',
 '30000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000004',
 '40000000-0000-0000-0000-000000000001',
 '60000000-0000-0000-0000-000000000001',
 1,'confirmed',10,0,
 '2026-10-05 08:40:00','2026-10-05 08:42:00','2026-10-05 08:41:00',NULL,
 '2026-10-05','2026-10-05 09:00:00'),
('70000000-0000-0000-0000-000000000002',
 '30000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000002',
 '10000000-0000-0000-0000-000000000005',
 '40000000-0000-0000-0000-000000000002',
 '60000000-0000-0000-0000-000000000003',
 1,'waiting',20,5,
 NULL,NULL,NULL,NULL,
 '2026-10-05','2026-10-05 10:00:00'),
('70000000-0000-0000-0000-000000000003',
 '30000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000005',
 '40000000-0000-0000-0000-000000000001',
 NULL,
 2,'done',0,0,
 NULL,NULL,NULL,'2026-10-01 11:00:00',
 '2026-10-01','2026-10-01 11:00:00')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 12. VISITS + HISTORY
-- ---------------------------------------------------------------------------
INSERT INTO visits
(id, queue_entry_id, client_id, employee_id, service_id,
 planned_start, planned_end, actual_start, actual_end,
 standard_duration, actual_duration, delay_duration, status)
VALUES
('80000000-0000-0000-0000-000000000001',
 '70000000-0000-0000-0000-000000000003',
 '10000000-0000-0000-0000-000000000005',
 '40000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000001',
 '2026-10-01 11:00:00','2026-10-01 11:30:00',
 '2026-10-01 11:02:00','2026-10-01 11:28:00',
 30,26,2,'done')
ON CONFLICT (id) DO NOTHING;

INSERT INTO visit_history
(id, visit_id, old_status, new_status, changed_by, note)
VALUES
('81000000-0000-0000-0000-000000000001',
 '80000000-0000-0000-0000-000000000001',
 'in_service','done','10000000-0000-0000-0000-000000000002',
 'Visit completed successfully.')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 13. QUEUE LOGS
-- ---------------------------------------------------------------------------
INSERT INTO queue_logs
(id, queue_entry_id, old_status, new_status, old_position, new_position,
 old_eta, new_eta, changed_by)
VALUES
('82000000-0000-0000-0000-000000000001',
 '70000000-0000-0000-0000-000000000001',
 'waiting','confirmed',1,1,15,10,
 '10000000-0000-0000-0000-000000000004'),
('82000000-0000-0000-0000-000000000002',
 '70000000-0000-0000-0000-000000000003',
 'in_service','done',2,NULL,0,0,
 '10000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 14. URGENT / LAST-MINUTE OFFERS
-- ---------------------------------------------------------------------------
INSERT INTO urgent_offers
(id, queue_entry_id, offered_time, option_type, status, response_deadline)
VALUES
('83000000-0000-0000-0000-000000000001',
 '70000000-0000-0000-0000-000000000002',
 '2026-10-05 09:35:00','plus_5','pending','2026-10-05 09:37:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO last_minute_offers
(id, institution_id, service_id, employee_id, available_from, available_until,
 taken_by, status)
VALUES
('84000000-0000-0000-0000-000000000001',
 '30000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000001',
 '40000000-0000-0000-0000-000000000001',
 '2026-10-05 12:00:00','2026-10-05 12:30:00',
 NULL,'active')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 15. NOTIFICATIONS
-- ---------------------------------------------------------------------------
INSERT INTO notifications
(id, user_id, title, message, is_read)
VALUES
('85000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000004',
 'Appointment confirmed',
 'Your appointment at Qast Medical Center has been confirmed.',
 FALSE),
('85000000-0000-0000-0000-000000000002',
 '10000000-0000-0000-0000-000000000005',
 'Queue updated',
 'Your estimated waiting time is 20 minutes.',
 TRUE)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 16. REPORTS / STATISTICS
-- ---------------------------------------------------------------------------
INSERT INTO daily_reports
(id, institution_id, report_date, total_visits, done_visits, cancelled_visits,
 missed_visits, skipped_visits, average_visit_time, average_delay,
 total_idle_time, updated_at, finalized, payload)
VALUES
('86000000-0000-0000-0000-000000000001',
 '30000000-0000-0000-0000-000000000001',
 '2026-10-01',8,6,1,1,0,27,3,35,
 '2026-10-01 18:00:00',TRUE,
 '{"note":"demo daily report"}'::json)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employee_statistics
(id, employee_id, statistics_date, clients_served, average_visit_time,
 total_work_time, idle_time)
VALUES
('87000000-0000-0000-0000-000000000001',
 '40000000-0000-0000-0000-000000000001',
 '2026-10-01',6,27,420,35),
('87000000-0000-0000-0000-000000000002',
 '40000000-0000-0000-0000-000000000002',
 '2026-10-01',5,16,360,25)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 17. AUTH / SESSION DEMO RECORDS
-- ---------------------------------------------------------------------------
INSERT INTO auth_challenges
(user_id, purpose, code_hash, expires_at, sent_at, attempts)
VALUES
('10000000-0000-0000-0000-000000000004',
 'verify_email',
 'demo_code_hash_not_for_authentication',
 '2026-10-02 15:00:00',
 '2026-10-02 14:00:00',
 0)
ON CONFLICT (user_id, purpose) DO NOTHING;

INSERT INTO password_resets
(id, user_id, verification_code, expires_at, used)
VALUES
('88000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000005',
 '1234','2026-10-02 15:00:00',TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO refresh_tokens
(id, user_id, token, expires_at)
VALUES
('89000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000004',
 'demo-refresh-token-not-for-authentication',
 '2026-10-09 14:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO push_tokens
(id, user_id, device_type, token)
VALUES
('8a000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000004',
 'ios',
 'ExponentPushToken[DEMO-QAST-CLIENT]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_sessions
(id, user_id, device_info, ip_address, is_active, expires_at)
VALUES
('8b000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000004',
 'iPhone - Expo demo',
 '127.0.0.1',
 TRUE,
 '2026-10-09 14:00:00')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 18. MEDIA
-- ---------------------------------------------------------------------------
INSERT INTO media_files
(id, user_id, file_url, file_type)
VALUES
('8c000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000004',
 'https://example.com/profiles/client-demo.jpg',
 'profile_image')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 19. AUDIT LOG
-- ---------------------------------------------------------------------------
INSERT INTO audit_logs
(id, admin_id, action, entity_type, entity_id, old_data, new_data)
VALUES
('8d000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000001',
 'update_institution',
 'institution',
 '30000000-0000-0000-0000-000000000001',
 '{"calendar_enabled":false}'::jsonb,
 '{"calendar_enabled":true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Quick verification: number of rows in the main demo tables.
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'institution_categories', COUNT(*) FROM institution_categories
UNION ALL SELECT 'institutions', COUNT(*) FROM institutions
UNION ALL SELECT 'institution_employees', COUNT(*) FROM institution_employees
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'service_slots', COUNT(*) FROM service_slots
UNION ALL SELECT 'queue_entries', COUNT(*) FROM queue_entries
UNION ALL SELECT 'visits', COUNT(*) FROM visits
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY table_name;
