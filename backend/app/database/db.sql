--
-- PostgreSQL database dump
--

-- Polecenie psql wymaga ukośnika odwrotnego; /restrict przerywało import zrzutu.
\restrict uDZZRR8kZOiylUKKbmVggGD2csabyBvpjHVCbgDkTl8Da5RgndlOZEmTCayWkwC

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: employee_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.employee_status OWNER TO postgres;

--
-- Name: language_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.language_type AS ENUM (
    'pl',
    'en'
);


ALTER TYPE public.language_type OWNER TO postgres;

--
-- Name: last_minute_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.last_minute_status AS ENUM (
    'active',
    'taken',
    'expired'
);


ALTER TYPE public.last_minute_status OWNER TO postgres;

--
-- Name: queue_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.queue_status AS ENUM (
    'waiting',
    'confirmed',
    'in_service',
    'done',
    'missed',
    'skipped',
    'cancelled'
);


ALTER TYPE public.queue_status OWNER TO postgres;

--
-- Name: urgent_offer_option; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.urgent_offer_option AS ENUM (
    'now',
    'plus_5',
    'plus_10',
    'plus_15'
);


ALTER TYPE public.urgent_offer_option OWNER TO postgres;

--
-- Name: urgent_offer_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.urgent_offer_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'expired'
);


ALTER TYPE public.urgent_offer_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'client',
    'employee',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    admin_id uuid,
    action character varying(255),
    entity_type character varying(100),
    entity_id uuid,
    old_data jsonb,
    new_data jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: daily_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_reports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    institution_id uuid,
    report_date date NOT NULL,
    total_visits integer DEFAULT 0,
    done_visits integer DEFAULT 0,
    cancelled_visits integer DEFAULT 0,
    missed_visits integer DEFAULT 0,
    skipped_visits integer DEFAULT 0,
    average_visit_time integer DEFAULT 0,
    average_delay integer DEFAULT 0,
    total_idle_time integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_reports OWNER TO postgres;

--
-- Name: employee_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid,
    service_id uuid
);


ALTER TABLE public.employee_services OWNER TO postgres;

--
-- Name: employee_statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_statistics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid,
    statistics_date date NOT NULL,
    clients_served integer DEFAULT 0,
    average_visit_time integer DEFAULT 0,
    total_work_time integer DEFAULT 0,
    idle_time integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_statistics OWNER TO postgres;

--
-- Name: employee_working_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_working_hours (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid,
    day_of_week integer,
    start_time time without time zone,
    end_time time without time zone
);


ALTER TABLE public.employee_working_hours OWNER TO postgres;

--
-- Name: institution_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.institution_employees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    institution_id uuid,
    user_id uuid,
    employee_status public.employee_status DEFAULT 'active'::public.employee_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.institution_employees OWNER TO postgres;

--
-- Name: institution_holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.institution_holidays (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    institution_id uuid,
    holiday_date date,
    description text
);


ALTER TABLE public.institution_holidays OWNER TO postgres;

--
-- Name: institutions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.institutions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    address text,
    phone character varying(20),
    email character varying(60),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.institutions OWNER TO postgres;

--
-- Name: last_minute_offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.last_minute_offers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    institution_id uuid,
    service_id uuid,
    employee_id uuid,
    available_from timestamp without time zone,
    available_until timestamp without time zone,
    taken_by uuid,
    status public.last_minute_status DEFAULT 'active'::public.last_minute_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.last_minute_offers OWNER TO postgres;

--
-- Name: media_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_files (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    file_url text,
    file_type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.media_files OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    title character varying(255),
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_resets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    verification_code character varying(4),
    expires_at timestamp without time zone,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- Name: push_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.push_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    device_type character varying(20),
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.push_tokens OWNER TO postgres;

--
-- Name: queue_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue_entries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    institution_id uuid,
    service_id uuid,
    client_id uuid,
    employee_id uuid,
    slot_id uuid,
    queue_position integer,
    status public.queue_status DEFAULT 'waiting'::public.queue_status,
    estimated_wait_time integer,
    delay_time integer DEFAULT 0,
    confirmation_sent_at timestamp without time zone,
    confirmation_expires_at timestamp without time zone,
    confirmed_at timestamp without time zone,
    arrival_time timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.queue_entries OWNER TO postgres;

--
-- Name: queue_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    queue_entry_id uuid,
    old_status public.queue_status,
    new_status public.queue_status,
    old_position integer,
    new_position integer,
    old_eta integer,
    new_eta integer,
    changed_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.queue_logs OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: service_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_slots (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid,
    employee_id uuid,
    slot_start timestamp without time zone NOT NULL,
    slot_end timestamp without time zone NOT NULL,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.service_slots OWNER TO postgres;

--
-- Name: service_working_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_working_hours (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid,
    day_of_week integer,
    start_time time without time zone,
    end_time time without time zone
);


ALTER TABLE public.service_working_hours OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    institution_id uuid,
    name character varying(120) NOT NULL,
    description text,
    standard_duration integer NOT NULL,
    max_queue_length integer DEFAULT 50,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    institution_id uuid,
    default_visit_duration integer DEFAULT 45,
    confirmation_time_minutes integer DEFAULT 20,
    client_response_minutes integer DEFAULT 2,
    urgent_offer_5_enabled boolean DEFAULT true,
    urgent_offer_10_enabled boolean DEFAULT true,
    urgent_offer_15_enabled boolean DEFAULT true,
    max_queue_length integer DEFAULT 50,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: urgent_offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.urgent_offers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    queue_entry_id uuid,
    offered_time timestamp without time zone NOT NULL,
    option_type public.urgent_offer_option,
    status public.urgent_offer_status DEFAULT 'pending'::public.urgent_offer_status,
    response_deadline timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.urgent_offers OWNER TO postgres;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    device_info text,
    ip_address character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(60),
    phone character varying(20),
    password_hash character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    first_name character varying(40),
    last_name character varying(40),
    profile_image text,
    language public.language_type DEFAULT 'en'::public.language_type,
    is_verified boolean DEFAULT false,
    verification_code character varying(4),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: visit_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visit_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    visit_id uuid,
    old_status public.queue_status,
    new_status public.queue_status,
    changed_by uuid,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.visit_history OWNER TO postgres;

--
-- Name: visits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visits (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    queue_entry_id uuid,
    client_id uuid,
    employee_id uuid,
    service_id uuid,
    planned_start timestamp without time zone,
    planned_end timestamp without time zone,
    actual_start timestamp without time zone,
    actual_end timestamp without time zone,
    standard_duration integer,
    actual_duration integer,
    delay_duration integer,
    status public.queue_status DEFAULT 'waiting'::public.queue_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.visits OWNER TO postgres;

--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, admin_id, action, entity_type, entity_id, old_data, new_data, created_at) FROM stdin;
\.


--
-- Data for Name: daily_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_reports (id, institution_id, report_date, total_visits, done_visits, cancelled_visits, missed_visits, skipped_visits, average_visit_time, average_delay, total_idle_time, created_at) FROM stdin;
\.


--
-- Data for Name: employee_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_services (id, employee_id, service_id) FROM stdin;
\.


--
-- Data for Name: employee_statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_statistics (id, employee_id, statistics_date, clients_served, average_visit_time, total_work_time, idle_time, created_at) FROM stdin;
\.


--
-- Data for Name: employee_working_hours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_working_hours (id, employee_id, day_of_week, start_time, end_time) FROM stdin;
\.


--
-- Data for Name: institution_employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.institution_employees (id, institution_id, user_id, employee_status, created_at) FROM stdin;
\.


--
-- Data for Name: institution_holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.institution_holidays (id, institution_id, holiday_date, description) FROM stdin;
\.


--
-- Data for Name: institutions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.institutions (id, name, description, address, phone, email, created_at, updated_at) FROM stdin;
70976ebd-0705-424a-90e3-9c04192a6fb3	Warsaw Medical Center	Test institution	Warsaw	\N	\N	2026-05-10 07:18:46.991082	2026-05-10 07:18:46.991082
0bb937d6-7e85-4a44-9568-b8f3d88d6871	Test Clinic	Demo institution	Warsaw	\N	\N	2026-05-10 16:24:57.705129	2026-05-10 16:24:57.705129
\.


--
-- Data for Name: last_minute_offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.last_minute_offers (id, institution_id, service_id, employee_id, available_from, available_until, taken_by, status, created_at) FROM stdin;
\.


--
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_files (id, user_id, file_url, file_type, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_resets (id, user_id, verification_code, expires_at, used, created_at) FROM stdin;
\.


--
-- Data for Name: push_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.push_tokens (id, user_id, device_type, token, created_at) FROM stdin;
\.


--
-- Data for Name: queue_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.queue_entries (id, institution_id, service_id, client_id, employee_id, slot_id, queue_position, status, estimated_wait_time, delay_time, confirmation_sent_at, confirmation_expires_at, confirmed_at, arrival_time, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: queue_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.queue_logs (id, queue_entry_id, old_status, new_status, old_position, new_position, old_eta, new_eta, changed_by, created_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: service_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_slots (id, service_id, employee_id, slot_start, slot_end, is_available, created_at) FROM stdin;
\.


--
-- Data for Name: service_working_hours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_working_hours (id, service_id, day_of_week, start_time, end_time) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, institution_id, name, description, standard_duration, max_queue_length, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (id, institution_id, default_visit_duration, confirmation_time_minutes, client_response_minutes, urgent_offer_5_enabled, urgent_offer_10_enabled, urgent_offer_15_enabled, max_queue_length, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: urgent_offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.urgent_offers (id, queue_entry_id, offered_time, option_type, status, response_deadline, created_at) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, device_info, ip_address, is_active, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, phone, password_hash, role, first_name, last_name, profile_image, language, is_verified, verification_code, is_active, created_at, updated_at) FROM stdin;
a3013b93-ae44-47c2-925e-f7f25ed2d5ae	test@gmail.com	\N	test123	client	Mariana	\N	\N	en	f	\N	t	2026-05-10 15:27:17.044406	2026-05-10 15:27:17.044416
\.


--
-- Data for Name: visit_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visit_history (id, visit_id, old_status, new_status, changed_by, note, created_at) FROM stdin;
\.


--
-- Data for Name: visits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visits (id, queue_entry_id, client_id, employee_id, service_id, planned_start, planned_end, actual_start, actual_end, standard_duration, actual_duration, delay_duration, status, created_at, updated_at) FROM stdin;
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: daily_reports daily_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_reports
    ADD CONSTRAINT daily_reports_pkey PRIMARY KEY (id);


--
-- Name: employee_services employee_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_pkey PRIMARY KEY (id);


--
-- Name: employee_statistics employee_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_statistics
    ADD CONSTRAINT employee_statistics_pkey PRIMARY KEY (id);


--
-- Name: employee_working_hours employee_working_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_working_hours
    ADD CONSTRAINT employee_working_hours_pkey PRIMARY KEY (id);


--
-- Name: institution_employees institution_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_employees
    ADD CONSTRAINT institution_employees_pkey PRIMARY KEY (id);


--
-- Name: institution_holidays institution_holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_holidays
    ADD CONSTRAINT institution_holidays_pkey PRIMARY KEY (id);


--
-- Name: institutions institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_pkey PRIMARY KEY (id);


--
-- Name: last_minute_offers last_minute_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.last_minute_offers
    ADD CONSTRAINT last_minute_offers_pkey PRIMARY KEY (id);


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: push_tokens push_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_tokens
    ADD CONSTRAINT push_tokens_pkey PRIMARY KEY (id);


--
-- Name: queue_entries queue_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_entries
    ADD CONSTRAINT queue_entries_pkey PRIMARY KEY (id);


--
-- Name: queue_logs queue_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_logs
    ADD CONSTRAINT queue_logs_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: service_slots service_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_slots
    ADD CONSTRAINT service_slots_pkey PRIMARY KEY (id);


--
-- Name: service_working_hours service_working_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_working_hours
    ADD CONSTRAINT service_working_hours_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_institution_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_institution_id_key UNIQUE (institution_id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: urgent_offers urgent_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.urgent_offers
    ADD CONSTRAINT urgent_offers_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visit_history visit_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_history
    ADD CONSTRAINT visit_history_pkey PRIMARY KEY (id);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: daily_reports daily_reports_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_reports
    ADD CONSTRAINT daily_reports_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: employee_services employee_services_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.institution_employees(id) ON DELETE CASCADE;


--
-- Name: employee_services employee_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: employee_statistics employee_statistics_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_statistics
    ADD CONSTRAINT employee_statistics_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.institution_employees(id);


--
-- Name: employee_working_hours employee_working_hours_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_working_hours
    ADD CONSTRAINT employee_working_hours_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.institution_employees(id);


--
-- Name: institution_employees institution_employees_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_employees
    ADD CONSTRAINT institution_employees_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: institution_employees institution_employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_employees
    ADD CONSTRAINT institution_employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: institution_holidays institution_holidays_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_holidays
    ADD CONSTRAINT institution_holidays_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: last_minute_offers last_minute_offers_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.last_minute_offers
    ADD CONSTRAINT last_minute_offers_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.institution_employees(id);


--
-- Name: last_minute_offers last_minute_offers_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.last_minute_offers
    ADD CONSTRAINT last_minute_offers_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: last_minute_offers last_minute_offers_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.last_minute_offers
    ADD CONSTRAINT last_minute_offers_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: last_minute_offers last_minute_offers_taken_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.last_minute_offers
    ADD CONSTRAINT last_minute_offers_taken_by_fkey FOREIGN KEY (taken_by) REFERENCES public.users(id);


--
-- Name: media_files media_files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: push_tokens push_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_tokens
    ADD CONSTRAINT push_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: queue_entries queue_entries_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_entries
    ADD CONSTRAINT queue_entries_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: queue_entries queue_entries_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_entries
    ADD CONSTRAINT queue_entries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.institution_employees(id);


--
-- Name: queue_entries queue_entries_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_entries
    ADD CONSTRAINT queue_entries_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: queue_entries queue_entries_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_entries
    ADD CONSTRAINT queue_entries_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: queue_entries queue_entries_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_entries
    ADD CONSTRAINT queue_entries_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.service_slots(id);


--
-- Name: queue_logs queue_logs_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_logs
    ADD CONSTRAINT queue_logs_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: queue_logs queue_logs_queue_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_logs
    ADD CONSTRAINT queue_logs_queue_entry_id_fkey FOREIGN KEY (queue_entry_id) REFERENCES public.queue_entries(id);


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: service_slots service_slots_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_slots
    ADD CONSTRAINT service_slots_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.institution_employees(id) ON DELETE CASCADE;


--
-- Name: service_slots service_slots_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_slots
    ADD CONSTRAINT service_slots_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_working_hours service_working_hours_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_working_hours
    ADD CONSTRAINT service_working_hours_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: services services_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: system_settings system_settings_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: urgent_offers urgent_offers_queue_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.urgent_offers
    ADD CONSTRAINT urgent_offers_queue_entry_id_fkey FOREIGN KEY (queue_entry_id) REFERENCES public.queue_entries(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: visit_history visit_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_history
    ADD CONSTRAINT visit_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: visit_history visit_history_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_history
    ADD CONSTRAINT visit_history_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id) ON DELETE CASCADE;


--
-- Name: visits visits_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: visits visits_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.institution_employees(id);


--
-- Name: visits visits_queue_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_queue_entry_id_fkey FOREIGN KEY (queue_entry_id) REFERENCES public.queue_entries(id);


--
-- Name: visits visits_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- PostgreSQL database dump complete
--

\unrestrict uDZZRR8kZOiylUKKbmVggGD2csabyBvpjHVCbgDkTl8Da5RgndlOZEmTCayWkwC
