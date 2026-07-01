--
-- PostgreSQL database dump
--

\restrict if4LAWSHLTD96kSkTlYq02ZD4SMaWVCwXDbWRmpWye1XhIOpA2v6HmD1HBOa1a2

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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
-- Name: enum_assets_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_assets_category AS ENUM (
    'IT',
    'Non-IT'
);


ALTER TYPE public.enum_assets_category OWNER TO postgres;

--
-- Name: enum_assets_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_assets_status AS ENUM (
    'active',
    'inactive',
    'disposed',
    'retired'
);


ALTER TYPE public.enum_assets_status OWNER TO postgres;

--
-- Name: enum_contracts_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_contracts_status AS ENUM (
    'active',
    'expired',
    'upcoming'
);


ALTER TYPE public.enum_contracts_status OWNER TO postgres;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_role AS ENUM (
    'admin',
    'staff',
    'viewer'
);


ALTER TYPE public.enum_users_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asset_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_details (
    id uuid NOT NULL,
    asset_id uuid NOT NULL,
    os_type character varying(255),
    os_version character varying(255),
    product_id character varying(255),
    os_activated boolean DEFAULT false,
    processor_name character varying(255),
    manufacturer character varying(255),
    cores integer,
    ram_gb double precision,
    disk_gb double precision,
    disk_model character varying(255),
    ms_office boolean DEFAULT false,
    office_key character varying(255),
    other_applications_installed boolean DEFAULT false,
    other_applications_description text,
    software_list text,
    configuration text,
    others text,
    created_at timestamp with time zone
);


ALTER TABLE public.asset_details OWNER TO postgres;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    id uuid NOT NULL,
    asset_tag character varying(255) NOT NULL,
    asset_name character varying(255) NOT NULL,
    category public.enum_assets_category NOT NULL,
    sub_type character varying(255) NOT NULL,
    other_subtype_description text,
    serial_no character varying(255),
    mac_address character varying(255),
    status public.enum_assets_status DEFAULT 'active'::public.enum_assets_status NOT NULL,
    purchase_id uuid,
    assigned_to character varying(255),
    created_at timestamp with time zone
);


ALTER TABLE public.assets OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    asset_id uuid,
    user_id uuid NOT NULL,
    action character varying(255) NOT NULL,
    old_value text,
    new_value text,
    changed_at timestamp with time zone
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contract_id character varying(255) NOT NULL,
    contract_name character varying(255) NOT NULL,
    vendor_name character varying(255) NOT NULL,
    vendor_contact character varying(255),
    vendor_email character varying(255),
    vendor_phone character varying(255),
    vendor_address text,
    vendor_contact_person character varying(255),
    active_from timestamp without time zone NOT NULL,
    active_till timestamp without time zone NOT NULL,
    contract_value numeric(12,2) DEFAULT 0,
    status character varying(100) DEFAULT 'upcoming'::character varying,
    notes text,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contracts OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_id character varying(255) NOT NULL,
    vendor_name character varying(255) NOT NULL,
    vendor_contact character varying(255),
    vendor_email character varying(255),
    vendor_address text,
    billing_address text,
    shipping_address text,
    invoice_number character varying(255),
    payment_method character varying(100),
    notes text,
    purchase_date timestamp without time zone NOT NULL,
    total_amount numeric(12,2) DEFAULT 0,
    status character varying(100) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- Name: software_licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.software_licenses (
    id uuid NOT NULL,
    asset_id uuid NOT NULL,
    license_key character varying(255),
    license_vendor character varying(255),
    license_expiry date,
    created_at timestamp with time zone
);


ALTER TABLE public.software_licenses OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying(255),
    email character varying(255),
    password_hash character varying(255) NOT NULL,
    role public.enum_users_role DEFAULT 'staff'::public.enum_users_role NOT NULL,
    created_at timestamp with time zone,
    username character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    contact character varying(50),
    email character varying(255),
    address text,
    contact_person character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: warranties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warranties (
    id uuid NOT NULL,
    asset_id uuid NOT NULL,
    warranty_provider character varying(255),
    warranty_type character varying(255),
    start_date date,
    end_date date,
    warranty_number character varying(255),
    contact_number character varying(255),
    notes text,
    created_at timestamp with time zone
);


ALTER TABLE public.warranties OWNER TO postgres;

--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Data for Name: asset_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_details (id, asset_id, os_type, os_version, product_id, os_activated, processor_name, manufacturer, cores, ram_gb, disk_gb, disk_model, ms_office, office_key, other_applications_installed, other_applications_description, software_list, configuration, others, created_at) FROM stdin;
317b6514-7e4d-4fa6-b602-7d00c5615ae8	cb3234ff-f59a-4542-9290-1cd4035c1150	Windows	Win 10 Edu	\N	f	\N	Dell	\N	\N	\N	\N	t	MS Office Pro Plus 2013	f	\N	\N	\N	Hostname: EOTPLLP004	2026-06-17 06:56:09.959+00
6e9856d4-b5aa-4d19-9c11-eff25c5b4e64	6b8f5d0e-4be3-4d35-9fec-697dfe18455d	Windows	Win 10 Pro	\N	f	\N	Dell	\N	\N	\N	\N	t	MS Office Pro Plus 2013	f	\N	\N	\N	Hostname: EOTPLLP0005	2026-06-17 06:56:09.959+00
130cb7f8-7e81-46c3-8d74-16e2d581ef34	60071c87-f963-4904-8801-0e618665b273	Windows	Win 11 Pro	\N	t	\N	Asus ExpertBook	\N	\N	\N	\N	t	MS Office Pro Plus 2019	f	\N	\N	\N	Hostname: LTEOTPL0014	2026-06-17 06:56:09.959+00
682653f3-6bd0-4c52-b240-5c297c7e622e	79df1c21-54f2-4009-8802-c5a912dde28b	Windows	Win 11 Pro	\N	t	\N	Lenovo	\N	\N	\N	\N	t	MS Office Pro Plus 2019	f	\N	\N	\N	Hostname: EOTPLLP0019	2026-06-17 06:56:09.959+00
53408ff6-a0a5-434b-a30e-d39d9b473142	abefa411-2854-4fa9-9312-d0b1239b4a2a	Windows	Win 10 pro	\N	t	\N	Dell	\N	\N	\N	\N	t	M365	f	\N	\N	\N	Hostname: EOTPLLP0012	2026-06-17 06:56:09.959+00
064ce015-9885-4048-a64f-a2c3c685c2ba	bf448c3d-87cd-4c02-b6df-8c1d57fd513f	Windows	Win 10 Pro	\N	t	\N	Dell	\N	\N	\N	\N	t	Ms Office Pro Plus 2016	f	\N	\N	\N	Hostname: EOTPLLP0021	2026-06-17 06:56:09.959+00
9287e0be-406e-4ed8-869c-c067e86dd25a	c7f55898-1a57-4259-bbb9-6434b57613d5	Windows	Win 11 Enterprise	\N	t	\N	Asus ExpertBook	\N	\N	\N	\N	t	M365	f	\N	\N	\N	Hostname: EOTPLLP006	2026-06-17 06:56:09.959+00
688fc7e3-2dcb-40a8-ae3a-43ddfe89388a	247ff3d4-f161-4415-af81-9c11ece547be	Windows	Win 10 Pro	\N	t	\N	Dell	\N	\N	\N	\N	t	Ms OfficePro Plus 2013	f	\N	\N	\N	Hostname: EOTPLLP003	2026-06-17 06:56:09.959+00
f5aaaeae-5a7f-4701-abe1-00306893de24	5d363886-9d8d-4d20-85b6-ada10b63591f	Windows	Win 10 Pro	\N	t	\N	Dell	\N	\N	\N	\N	t	M365	f	\N	\N	\N	Hostname: EOTPLLP008	2026-06-17 06:56:09.959+00
c61bc3b1-9970-498c-9605-3024cbfa2732	e2a2c8c4-5c1c-4deb-b949-b15915944340	Windows	Win 10 Pro	\N	t	\N	Dell	\N	\N	\N	\N	t	Ms Office Pro Plus 2013	f	\N	\N	\N	Hostname: EOTPLLP0022	2026-06-17 06:56:09.959+00
bb649aa4-4072-4987-8979-7dacf9f18c52	1d784429-788e-46f5-b1f8-266b15da875b	Windows	Win 10 Pro	\N	t	\N	Dell	\N	\N	\N	\N	t	Ms Office Home and Business 2021	f	\N	\N	\N	Hostname: EOTPLLP0011	2026-06-17 06:56:09.959+00
81bd74d5-9e58-45c5-97a1-0587bf193077	f3caae3d-1651-474d-afdd-244727a704c8	Windows	Win 10 Pro	\N	t	\N	Dell	\N	\N	\N	\N	t	Ms Office Pro Plus 2016	f	\N	\N	\N	Hostname: EOTPLLP0016	2026-06-17 06:56:09.959+00
c4da705e-8fe2-42df-8c23-22a869991dab	01955671-a50b-41a5-a661-f4ecadcf0f30	Windows	Win 11 Pro	\N	t	\N	Asus ExpertBook	\N	\N	\N	\N	t	M365	f	\N	\N	\N	Hostname: EOTPLLP007	2026-06-17 06:56:09.959+00
413873f8-c006-46e4-81ab-67e6230320d4	51f446b1-1892-407a-bbd2-7bf235bc939b	Windows	Win 11 Pro	\N	t	\N	Asus ExpertBook	\N	\N	\N	\N	t	M365	f	\N	\N	\N	Hostname: EOTPLLP0015	2026-06-17 06:56:09.959+00
781e573e-b15d-4fb6-bf44-0cd9fd351d80	b1bba834-73e4-4ffb-adc8-a4a94aee60ff	Windows	Win 11 Pro	\N	t	\N	Lenovo	\N	\N	\N	\N	t	Ms Office Home and Business 2021	t	Tally Prime	\N	\N	Hostname: EOTPLLP0018	2026-06-17 06:56:09.959+00
7eeb2002-4570-4a1a-a38d-c94f81e41901	fdfc2c47-10e9-408f-bacf-a1132cc923d0	Windows	Win 11 Pro	\N	t	\N	Hp	\N	\N	\N	\N	t	Ms Office Home and Business 2021	f	\N	\N	\N	Hostname: EOTPLLP001	2026-06-17 06:56:09.959+00
e6726394-8abd-444d-9e6f-6b60a9b6e6a6	8565e114-79d2-4031-8d2c-787af7e3c6fb	Windows	Win 11 Pro	\N	t	\N	Asus ExpertBook	\N	\N	\N	\N	t	Ms Office Pro Plus 2019	f	\N	\N	\N	Hostname: EOTPLLP0017	2026-06-17 06:56:09.959+00
09ad446c-db70-4d04-b300-8fc593d12ae6	f0fb7afc-c79e-4e16-b9a1-72afc65604cd	Windows	Win11 Pro	\N	t	\N	Dell	\N	\N	\N	\N	t	M365	f	\N	\N	\N	Hostname: EOTPLLP009	2026-06-17 06:56:09.96+00
ac73c3ab-a71e-432c-86f1-6922260e0fa7	8ab98195-61af-467b-a06c-067318f6ade2	Windows	Win 11 Pro	\N	t	\N	Dell	\N	\N	\N	\N	t	M365	f	\N	\N	\N	Hostname: EOTPLLP0010	2026-06-17 06:56:09.96+00
426d555d-a85e-4d0f-9df7-f466edd4b136	eb510ad2-f6e0-4c65-98e3-a054fb1171db	Windows	Windows 11 Pro	\N	t	\N	Asus ExpertBook	\N	\N	\N	\N	f	\N	f	\N	\N	\N	Hostname: LTEOTPL017	2026-06-17 06:56:09.96+00
65946436-db09-4319-b8d3-4cfe3b81eee6	9399a5b4-aeb1-443e-b349-dd8d482ceaa2	Windows	Win 11/M365	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	No | hand over to Jeevitha	2026-06-17 06:56:09.96+00
4254d85a-45e2-4b94-b7b9-1a23588a5ffc	0e2b0896-08d8-4d9c-b179-b3b4af34b47b	Windows	Win 11/M365	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	No | hand over to krishnan.ts	2026-06-17 06:56:09.96+00
04dcd2e2-583d-473d-b334-d906b8f516a7	9fa4695b-5954-47bf-ab26-a208abcf6b08	Windows	Win 11	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	No	2026-06-17 06:56:09.96+00
b4a323a2-dad6-45c5-b62f-775e69f93103	a5e09906-50d5-4a3a-b94d-6e45a5847bbc	Windows	Win 11	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	No	2026-06-17 06:56:09.96+00
29f12eac-1deb-4457-858e-b82bf217dacc	220f2835-175f-47db-81d0-fd93e549c5f5	Windows	Win 11	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	Charging port broken	2026-06-17 06:56:09.96+00
d81c6636-97a6-4e27-9a64-0cf331260451	b15fe696-69e6-4700-8fa2-580b73df2260	No	No	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	\N	2026-06-17 06:56:09.96+00
365a2c85-c535-4975-bf45-8471487e83cf	82d2e7ce-04b7-442f-84bb-e8ff5de0c5d7	Windows	Win 10	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	Battery problem	2026-06-17 06:56:09.96+00
12a785d8-cfd8-4865-ae69-7b4cb76afefa	fd4d6305-4c16-4e63-8340-7eb7b48a7b65	Windows	Win 10	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	Battery problem	2026-06-17 06:56:09.96+00
f0ee16a0-a5cb-444a-a55a-cb3edf5b0d0c	6d6f6405-b96b-4764-a0e5-fe5cdee8dfec	\N	\N	\N	f	\N	HP	\N	\N	\N	\N	f	\N	f	\N	\N	\N	M/b complaint	2026-06-17 06:56:09.96+00
50882b0e-bf9c-411b-8c4e-e82645ebef29	c4950f9d-6fc8-4885-8b63-167b7b7b3cf6	Windows	Win 10	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	Hand ovet to laptop and power adapter with mouse -Mohammed shazir(03.01.2026)	2026-06-17 06:56:09.96+00
3abd2d1e-5636-4235-8fe2-b77d668b4b21	a4bde757-4023-4659-8fb0-d0be73977d7d	Windows	Win 10	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	hand over to dell lap and power adapter -Pranav (18-02-2026)	2026-06-17 06:56:09.96+00
ae99f9fb-f2f6-48b5-b544-5a591b2bb61b	ab9f22fa-0e41-4703-89a5-44e2a0f1fc3c	Windows	Win 10	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	hand over to dell lap and power adapter -Pranav (08-01-2026)	2026-06-17 06:56:09.96+00
3283165f-6eed-482d-83cd-ed8fe1481f55	a4a498c7-3adf-4465-aa6c-c2fb13c64311	Windows	Win 10	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	\N	2026-06-17 06:56:09.96+00
ff364496-48fe-41ac-b96e-46b54196439c	1b3ccab1-15a2-43ce-a2b4-fe62c096f848	Windows	Win 10	\N	f	\N	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	\N	2026-06-17 06:56:09.96+00
0ca98f4c-cb7a-45f8-a1f2-c0a558e0f121	caf93615-43fa-42b3-b59e-7566b06ac84c	\N	\N	\N	f	Intel Xeon CPU E5-2440 V2@1.90GHZ	Dell	\N	48	\N	\N	f	\N	f	\N	\N	\N	Service Tag: HKM3842	2026-06-17 06:56:09.96+00
e20f0e0f-64f7-4d01-87c5-b9fa050290ed	8bdd31d4-e9bf-4c1f-834f-7934d8aabba5	\N	\N	\N	f	Intel Xeon CPU E5-2440 V2@1.90GHZ	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	Service Tag: 9LM3842	2026-06-17 06:56:09.96+00
45a54d0a-e2c2-4c50-a8cd-e13ea3bfd2d1	afb753c1-f3cc-4971-8159-e3f9bba36ac7	\N	\N	\N	f	Intel Xeon CPU E5-2440 V2@1.90GHZ	Dell	\N	\N	\N	\N	f	\N	f	\N	\N	\N	Service Tag: J6M3842	2026-06-17 06:56:09.96+00
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, asset_tag, asset_name, category, sub_type, other_subtype_description, serial_no, mac_address, status, purchase_id, assigned_to, created_at) FROM stdin;
cb3234ff-f59a-4542-9290-1cd4035c1150	LAP-001	Dell Latitude E7240	IT	Laptop	\N	HTM7152	\N	active	\N	Prakash	2026-06-17 06:56:09.918+00
6b8f5d0e-4be3-4d35-9fec-697dfe18455d	LAP-002	Dell Latitude 3480	IT	Laptop	\N	HZHFSJ2	\N	active	\N	\N	2026-06-17 06:56:09.918+00
60071c87-f963-4904-8801-0e618665b273	LAP-003	Asus ExpertBook B1402CBA	IT	Laptop	\N	R4NXCV08Z941161	\N	active	\N	Vaidiyanathan	2026-06-17 06:56:09.919+00
79df1c21-54f2-4009-8802-c5a912dde28b	LAP-004	Lenovo 82YU	IT	Laptop	\N	PF4GHZCH	\N	active	\N	Hema Priya	2026-06-17 06:56:09.919+00
abefa411-2854-4fa9-9312-d0b1239b4a2a	LAP-005	Dell Latitude 3480	IT	Laptop	\N	DWQP6F2	\N	active	\N	Leojude.j	2026-06-17 06:56:09.919+00
bf448c3d-87cd-4c02-b6df-8c1d57fd513f	LAP-006	Dell Lattitude E5470	IT	Laptop	\N	7ZJFKC2	\N	active	\N	\N	2026-06-17 06:56:09.919+00
c7f55898-1a57-4259-bbb9-6434b57613d5	LAP-007	Asus ExpertBook B1402CBA	IT	Laptop	\N	R5NXCV08V86620F	\N	active	\N	Srinivasan.r	2026-06-17 06:56:09.919+00
247ff3d4-f161-4415-af81-9c11ece547be	LAP-008	Dell Latitude E5470	IT	Laptop	\N	8D0T2G2	\N	active	\N	Ratchika	2026-06-17 06:56:09.919+00
5d363886-9d8d-4d20-85b6-ada10b63591f	LAP-009	Dell Latitude E3480	IT	Laptop	\N	6WQP6F2	\N	active	\N	Priyanka.s	2026-06-17 06:56:09.919+00
e2a2c8c4-5c1c-4deb-b949-b15915944340	LAP-010	Dell Lattitude E4380	IT	Laptop	\N	1WQP6F2	\N	active	\N	Kishore	2026-06-17 06:56:09.919+00
1d784429-788e-46f5-b1f8-266b15da875b	LAP-011	Dell Latitude E5450	IT	Laptop	\N	DPX6T32	\N	active	\N	Manjula.M	2026-06-17 06:56:09.919+00
f3caae3d-1651-474d-afdd-244727a704c8	LAP-012	Dell Latitude E5450	IT	Laptop	\N	DWJK662	\N	active	\N	Sivasamy R	2026-06-17 06:56:09.919+00
01955671-a50b-41a5-a661-f4ecadcf0f30	LAP-013	Asus ExpertBook B1402CBA	IT	Laptop	\N	R5NXCV08V76920B	\N	active	\N	Geetha	2026-06-17 06:56:09.92+00
51f446b1-1892-407a-bbd2-7bf235bc939b	LAP-014	Asus ExpertBook B1402CBA	IT	Laptop	\N	R4NXCV08Z938163	\N	active	\N	Leelavathi.m	2026-06-17 06:56:09.92+00
b1bba834-73e4-4ffb-adc8-a4a94aee60ff	LAP-015	Lenovo 82KD	IT	Laptop	\N	PF3VZ4LP	\N	active	\N	Vaishnavi	2026-06-17 06:56:09.92+00
fdfc2c47-10e9-408f-bacf-a1132cc923d0	LAP-016	Hp Zbook Firefly 14 inch G9 Mobile Workstation Pc	IT	Laptop	\N	5CG238271J	\N	active	\N	\N	2026-06-17 06:56:09.92+00
8565e114-79d2-4031-8d2c-787af7e3c6fb	LAP-017	Asus ExpertBook B1402CBA	IT	Laptop	\N	R4NXCV08Z937164	\N	active	\N	\N	2026-06-17 06:56:09.92+00
f0fb7afc-c79e-4e16-b9a1-72afc65604cd	LAP-018	Dell Dell Latitude 3400	IT	Laptop	\N	4V8XPT2	\N	active	\N	Jeevitha.R	2026-06-17 06:56:09.92+00
8ab98195-61af-467b-a06c-067318f6ade2	LAP-019	Dell Dell Latitude 3400	IT	Laptop	\N	5V8XPT2	\N	active	\N	Krishnan.ts	2026-06-17 06:56:09.92+00
eb510ad2-f6e0-4c65-98e3-a054fb1171db	LAP-020	Asus ExpertBook B1402CBA	IT	Laptop	\N	R4NXCV08Z947168	\N	active	\N	Siddhartha Ghosh	2026-06-17 06:56:09.92+00
9399a5b4-aeb1-443e-b349-dd8d482ceaa2	LAP-021	Dell Latitude 3400	IT	Laptop	\N	4V8XPT2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
0e2b0896-08d8-4d9c-b179-b3b4af34b47b	LAP-022	Dell Latitude 3400	IT	Laptop	\N	5V8XPT2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
9fa4695b-5954-47bf-ab26-a208abcf6b08	LAP-023	Dell Latitude 3400	IT	Laptop	\N	FC1HPT2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
a5e09906-50d5-4a3a-b94d-6e45a5847bbc	LAP-024	Dell Latitude 3400	IT	Laptop	\N	2V8XPT2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
220f2835-175f-47db-81d0-fd93e549c5f5	LAP-025	Dell Latitude 3400	IT	Laptop	\N	GC1HPT2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
b15fe696-69e6-4700-8fa2-580b73df2260	LAP-026	Dell Latitude 3480	IT	Laptop	\N	FWQP6F2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
82d2e7ce-04b7-442f-84bb-e8ff5de0c5d7	LAP-027	Dell Latitude 3470	IT	Laptop	\N	91W51C2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
fd4d6305-4c16-4e63-8340-7eb7b48a7b65	LAP-028	Dell Vostro15	IT	Laptop	\N	3VKCDL2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
6d6f6405-b96b-4764-a0e5-fe5cdee8dfec	LAP-029	HP Elitebook 840 G2	IT	Laptop	\N	5CG517209N	\N	inactive	\N	\N	2026-06-17 06:56:09.92+00
c4950f9d-6fc8-4885-8b63-167b7b7b3cf6	LAP-030	Dell Latitude 3480	IT	Laptop	\N	HZHFSJ2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
a4bde757-4023-4659-8fb0-d0be73977d7d	LAP-031	Dell Latitude 3480	IT	Laptop	\N	2CG26L2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
ab9f22fa-0e41-4703-89a5-44e2a0f1fc3c	LAP-032	Dell Latitude E5450	IT	Laptop	\N	1HL6T32	\N	active	\N	\N	2026-06-17 06:56:09.92+00
a4a498c7-3adf-4465-aa6c-c2fb13c64311	LAP-033	Dell Latitude 5480	IT	Laptop	\N	1ZRRNH2	\N	active	\N	\N	2026-06-17 06:56:09.92+00
1b3ccab1-15a2-43ce-a2b4-fe62c096f848	LAP-034	Dell Latitude E5450	IT	Laptop	\N	J3VWJ72	\N	active	\N	\N	2026-06-17 06:56:09.92+00
caf93615-43fa-42b3-b59e-7566b06ac84c	SRV-001	Dell Power Edge R420	IT	Other	\N	HKM3842	\N	active	\N	\N	2026-06-17 06:56:09.92+00
8bdd31d4-e9bf-4c1f-834f-7934d8aabba5	SRV-002	Dell Power Edge R420	IT	Other	\N	9LM3842	\N	active	\N	\N	2026-06-17 06:56:09.92+00
afb753c1-f3cc-4971-8159-e3f9bba36ac7	SRV-003	Dell Power Edge R420	IT	Other	\N	J6M3842	\N	active	\N	\N	2026-06-17 06:56:09.92+00
587cdaac-293a-4fed-9150-e9fa65fd1e73	IT-001	Dell optical ( mouse)	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
3f70d417-4aa4-4ffa-9423-8834c72e43ee	IT-002	Dell( Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
4fdbb90c-f7d0-47a2-8772-d9e91bbe3a8a	IT-003	Dell( Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
f868bdf1-74c5-4cf6-ba70-2bf6f5b6cec7	IT-004	Dell( Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
e3d332c9-1564-4c4f-804e-5b459c8c6bb1	IT-005	Dell( Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
b5631b21-8732-40f0-b67a-bb3ab1b35d0f	IT-006	Dell( Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
1512ac81-3013-4a9b-ba6e-35e901853d79	IT-007	Desktop hardisk WD(500GB)	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
af853f8e-7f13-41a6-8ebf-ffea6c40afa3	IT-008	EVM (mouse)	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
4c577dd1-8c0c-415f-9be3-deb35412eb7e	IT-009	EVM (mouse)	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
4dd217b3-e5f7-4560-bb1d-d1a7671709fe	IT-010	EVM (mouse)	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
a7cdd94d-e3f4-440a-9dce-53ff18660b74	IT-011	EVM (mouse)	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
425fde55-ba96-4e4d-a2f0-a700fb2b91d6	IT-012	EVM (mouse)	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
83050707-5f31-4161-a0ee-5572e9dcfcaa	IT-013	EVM (mouse)	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
8c77570b-6be7-47ea-8536-fbf6265048a0	IT-014	EVM (mouse)	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
a33a91d0-26ea-4ced-beef-2e242f1a8672	IT-015	EVM (mouse)	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
c50c1af7-6d12-4907-8f8c-61054d965739	IT-016	EVM (mouse)	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
9533bd87-ed9a-45b2-ad36-a9921b83f7fa	IT-017	EVM (Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
6133b52e-ba85-4cff-a496-3241a7b270ba	IT-018	EVM (Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
ba76d4b8-326c-4f16-9ccc-b407f6d507a2	IT-019	EVM (Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
cbc3594c-48da-4b6b-8090-812eaabdf75b	IT-020	EVM (Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
644bcc3d-98cc-4b24-9517-2f3497dc6baa	IT-021	EVM (Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
c5c775d8-b11b-43fd-a638-91073c7b5b16	IT-022	EVM (Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
966b118a-2b1e-4761-8fd9-edcc72ef06d8	IT-023	EVM (Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
a40e4352-7936-4a54-93f0-81c8179b145c	IT-024	EVM (Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
69adcbc9-df81-4295-b5ec-344741ead695	IT-025	EVM (Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
84796d6f-0402-452e-870e-4bf5e9e4e5c9	IT-026	Power cable(Laptop)	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
66bad4f5-b824-48b1-92fc-1ffb351f0a4f	IT-027	Laptop (Keyboard)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
69d115dc-76dd-47c4-bb31-32dd4ac17aa8	IT-028	Toner (Konica)	IT	Printer	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
5b7769fd-65a6-4011-b652-1ead7bf5d713	IT-029	Toner 12 A (Refilled)	IT	Printer	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
be6e0be8-7771-4f7f-950d-5556f6b5658c	IT-030	Toner 12 A (Refilled)	IT	Printer	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
7fdc7a24-9e73-40f4-83a9-8652a993e1de	IT-031	SSD Msata (128GB) old stock	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
e3e87dd4-f3e1-4e87-a2f5-68f09837342e	IT-032	Laptop Hard disk	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.921+00
a301df18-1daa-4109-a845-0f0bc4cdc51f	IT-033	776STB2ST (TOSHIBA)  500 GB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
e5380432-6d9d-4f13-a4b1-ce4f8f317865	IT-034	777STB90T(TOSHIBA)  500 GB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
119a5235-13db-4d8e-9ea0-96d9840a5e4b	IT-035	W62LB93X (SEAGATE) 500 GB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
0e6706d5-f328-4ea5-81c5-4fb6cc30a60f	IT-036	WM90MWS9(SEAGATE) 500 GB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
a797d205-229b-4b97-81aa-3a2dbd43a4d3	IT-037	WN90EE7K(SEAGATE) 500 GB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
a61de4fa-89fa-4abf-8511-ba397ee5d17d	IT-038	WN90MTMN(SEAGATE) 500 GB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
6f65ad32-ef8c-4fd9-a3e6-0bd139a9a9cd	IT-039	W62LB7MP(SEAGATE) 500 GB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
f48f5a0e-8044-4c75-9dd8-16b35bc06a45	IT-040	W62GXNXF(SEAGATE) 500 GB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
a818f5f8-33bb-4d76-85d2-a61e194b9077	IT-041	W020CN77(SEAGATE) 250 GB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
702c2778-ab1f-471f-a8f6-e7a2110433a4	IT-042	WXA1AB6DX46X(WESTERN DIGITAL) 1 TB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
9b4a6a6e-75c4-4cf2-8554-40b6e476aac9	IT-043	System hard disk	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
296fb6ca-6865-4c3a-b813-0f49967ffed6	IT-044	Z9A4NYGS(SEAGATE) 1 TB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
64dd4e03-43ad-4576-8fc4-f64e592d146e	IT-045	W9AGE4VR(SEAGATE) 1 TB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
54dbdebc-7008-4c9a-985c-80b6285f452c	IT-046	Z9A4N9G3(SEAGATE) 1 TB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
f60090f6-431a-4e6b-ab53-d5df3e0269e7	IT-047	Z9A4NYGS(SEAGATE) 1 TB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
6bb1fc32-9c4f-4637-8c99-5832c5a6e322	IT-048	Z2AAHC1W(SEGATE) 1 TB	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
ea80f307-d304-494d-8fb3-1371d4e2181a	IT-049	Mouse pad	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
53153d7b-282a-416e-b1fe-157a24ade9fb	IT-050	Mouse pad	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
8bcb737d-49ce-4ba8-9d3c-b230d3b30dbf	IT-051	Mouse pad	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
9ec40c6a-96c1-4218-aca7-d7a71c155616	IT-052	Mouse pad	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
79db0b86-8223-43f2-965e-feb152d7e908	IT-053	Mouse pad	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
c3c93638-69bb-4783-856b-9f1236f12108	IT-054	Mouse pad	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
4ee8ad14-2eae-4287-8ad2-72792421904c	IT-055	Keyboard(Laptop)	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
cb505053-4668-4f8f-bf1a-e2ea355c6106	IT-056	Asus(motherboard)H610M - CS	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
500778bd-2b65-43e1-9589-b6983cb73dbc	NIT-001	Laptop bag(HP)	Non-IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
3f95d4da-ace3-4640-a05a-84970ba2113f	NIT-002	Laptop bag(HP)	Non-IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
225a2efc-e1b1-498c-adf4-104704ac4106	NIT-003	Laptop bag(HP)	Non-IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
7aab1d8a-b653-45d0-acf0-be83a355ae85	NIT-004	Laptop bag(HP)	Non-IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
a5bccf66-ee37-4cbe-852e-bed1126df27a	NIT-005	Laptop bag(HP)	Non-IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
e27c72e5-8d5e-40e5-9b86-e56ddf78fd43	NIT-006	Laptop bag(HP)	Non-IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
65809896-0fe9-4b58-bd85-4006be27f67e	IT-057	Novoo (7 port hub)	IT	Switch	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
75583ed7-1baa-4b36-ad97-c8aeb06ed740	IT-058	Novoo(3 port hub)	IT	Switch	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.922+00
c60d144e-9297-4f5d-8508-3a86c486f60c	IT-059	Novoo(1 port hub)	IT	Switch	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
40cc5b86-b57b-421a-a185-439c2ec6c1a1	IT-060	Novoo (5 Port hub)	IT	Switch	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
e599e0ed-d2d8-42a0-90b1-5d24c0610bf3	IT-061	Novoo(8 port hub)	IT	Switch	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
cc8f0b1e-36bd-431f-8955-e75eeb7daf07	IT-062	Novoo(12 port hub)	IT	Switch	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
d0b3f0a1-d3e4-4bc7-a9cd-b9a931b1d59e	IT-063	Alogic	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
5204fe0f-b3b9-4e11-b3fd-e54058b78e02	IT-064	Dell power cable	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
346753e1-6fca-4798-856b-189027b53b79	IT-065	Hik vision camera	IT	Webcam	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
a8fc91bc-eb1d-4997-aeda-8bbbcd46c540	IT-066	Hik vision camera	IT	Webcam	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
c72e928d-ffeb-4915-9efd-b30db79a2c69	IT-067	Cooling fan	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
7b18dc3b-aee1-4553-9ced-b0f443fe5bf2	IT-068	Cooling fan	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
9feeee39-ab24-496d-9fa5-0207c130a825	IT-069	Cooling fan	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
0c5572ca-c348-43f4-9710-6018f8e9e730	IT-070	Cooling fan	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
fa7cf90b-7552-4504-9492-9f4427818e72	IT-071	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
f7312433-9be3-413c-9c87-9fecc3bc7f0d	IT-072	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
8fa6c2d8-db48-4487-9a93-05d80c2dccbf	IT-073	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
3c0e972e-242a-46a0-9823-395aac9518d7	IT-074	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
805972f3-91f2-4a40-9f8f-2d6f24647dad	IT-075	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
a2f42e9e-00fb-4c42-a1ee-46634bf12118	IT-076	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
a41dbff5-0d85-4ce3-8977-34f1dd744c13	IT-077	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
4ef21039-4501-42e3-8554-b983e99df16c	IT-078	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
0eb85db9-4b2f-4c95-81d0-8cd3ab3bf5fc	IT-079	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
c9e3a386-6724-4a3b-aaf4-e4369eaf7537	IT-080	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
e95e2e8c-4738-4151-8d96-7476c43a7275	IT-081	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
d43b0fbb-fb69-4667-a74a-d7d8cca5a952	IT-082	UPS battery(7 AH)	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
197128df-997a-495e-90d2-886345e83855	IT-083	UPS battery	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
bffc0c53-5019-466c-afab-263315eb0efe	IT-084	UPS battery	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
d6f90a01-9650-4a9f-b78a-84ababa6ad2d	IT-085	UPS battery	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
f146cc82-22a7-4c97-9e62-b2192368bcbe	IT-086	UPS battery	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
f8a5968f-ae0b-42ae-8c88-6dba41b33f97	IT-087	UPS battery	IT	UPS	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.923+00
7393f41d-d8ca-44d4-896e-f9859b52d226	IT-088	UPS battery	IT	UPS	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.923+00
bb5d151d-fe31-4a76-bc47-737aef9cebc6	IT-089	UPS battery	IT	UPS	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.923+00
0670abe0-56a4-47ba-ba45-d8f5da5f7dbe	IT-090	UPS battery	IT	UPS	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.923+00
89b2b24c-8d02-42bd-a9bd-15e1a7de1d0d	IT-091	UPS battery	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.923+00
89c2fe1d-3ae6-4731-bdc5-51ee6f092099	IT-092	UPS battery	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
23bef2fb-631e-4a18-a670-2becbb3515c6	IT-093	Exide battery(42 AH)New	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
1dc1b93f-315e-410d-ac87-4cbc3df72996	IT-094	Exide battery(42 AH)New	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
e77098e6-a367-4989-8c24-4f0f6eede898	IT-095	Exide battery(42 AH)Old	IT	UPS	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
32300f39-977b-4816-b782-08c0d205b373	IT-096	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
071124fe-7b0c-4120-a23e-bc2b51e63e8d	IT-097	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
8db68bc4-26c4-4aa2-b219-1af99b2ff2a4	IT-098	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
7c6b8002-1843-4701-a242-f3307633eda7	IT-099	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
187ea276-f513-4799-a7cb-899d40c97ee7	IT-100	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
38f3dce1-2ce2-403b-bfc9-1ba1edd6085c	IT-101	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
5d442ad3-fc7c-48ff-b658-69d78685ebf4	IT-102	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
ae230fd5-8970-419e-8ff3-f795010820d2	IT-103	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
a169ee94-0642-4264-b752-1983e78c9d86	IT-104	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
7a77962d-4e9b-4d3e-9c75-94827553e9d4	IT-105	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
0282d749-e15d-4ff8-9ab4-dcd873434129	IT-106	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
0317fdcb-7db1-4ebf-926b-7e932ef7221d	IT-107	Mouse	IT	Mouse	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
c823b19d-8b18-4ee7-84bd-f54c0c48863b	IT-108	Mouse	IT	Mouse	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.924+00
37768823-51cc-4e35-8fa1-804f7d7755e2	IT-109	Mouse	IT	Mouse	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.924+00
2261370a-9236-4016-a348-c6b4974d3989	IT-110	Mouse	IT	Mouse	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.924+00
d5d7feec-40e8-400a-8227-e78af4532e8d	IT-111	Mouse	IT	Mouse	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.924+00
73008f6a-1114-459b-8cf4-e8117e3dafac	IT-112	Mouse	IT	Mouse	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.924+00
6dca4d51-ad96-422d-b575-31daf027938d	IT-113	Mouse	IT	Mouse	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.924+00
f258d6b7-ef55-4539-a9d5-44a78f917f83	IT-114	Keyboard	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
0026fc9b-d6d3-4005-a7c9-11591213c879	IT-115	Keyboard	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
379bc062-a94b-472f-b2ac-d5be7666bd7c	IT-116	Keyboard	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
2f0405cf-f7da-406c-8072-648ae06a79d3	IT-117	Keyboard	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
21e05b7c-f561-4463-b2b7-ee3ca502bc4d	IT-118	Keyboard	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
af6f29c5-f5dd-4ddd-b87e-4bbdd521b7d0	IT-119	Keyboard	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
a2f3dd55-7fc1-4eac-b17f-35db6ec44666	IT-120	Keyboard	IT	Keyboard	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
84d94974-350f-40a4-b0cc-39b70ecc8cf9	IT-121	SMPS	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.924+00
b4e28b57-c29a-43d1-ae54-ba93f84c4566	IT-122	SMPS	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.925+00
ab6d2852-5a4d-4b9d-9a6d-037531f29f51	IT-123	SMPS	IT	Other	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.925+00
0cbf5751-f12a-45d8-ba4e-550d604e5e16	IT-124	SMPS	IT	Other	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
7fe0b1de-6479-40d6-8b01-dee2b8f13585	IT-125	Monitor	IT	Monitor	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.925+00
7c49d8a4-a6ee-4088-bc14-f4609e9babe7	IT-126	Monitor	IT	Monitor	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.925+00
0fe294c9-85d2-4a18-9f40-db113b11f775	IT-127	Monitor	IT	Monitor	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.925+00
1e600b52-233d-4c4a-ae91-177141649d58	IT-128	Monitor	IT	Monitor	\N	\N	\N	active	\N	\N	2026-06-17 06:56:09.925+00
8f735328-b163-4100-8c64-e06d029792b8	IT-129	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
c7c83c4a-8d7a-48e2-90d5-41b22a3eb1a8	IT-130	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
48ebdc60-1325-469e-9819-6c9180d7b12f	IT-131	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
705c13bb-8379-4736-83b7-1113c2bbd3f8	IT-132	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
329a86d7-5e66-44b4-8c8d-57c41ee75d99	IT-133	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
4758da67-40fa-4ddc-834b-d6098e0f3f13	IT-134	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
4d007756-be94-4fe2-a1be-95d979032c81	IT-135	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
fa1ae02d-d744-480c-ac4e-e216a4ecb54f	IT-136	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
1a5766b2-f504-4038-a27a-2cf1c3404a32	IT-137	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
433d3941-5b36-4110-b746-371a18e665b2	IT-138	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
4c421b1f-a8f3-498b-a568-a4b99f203b85	IT-139	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
14b2723b-564c-4ea3-b0e6-4f2345abb717	IT-140	Monitor	IT	Monitor	\N	\N	\N	inactive	\N	\N	2026-06-17 06:56:09.925+00
04167c5c-fd6a-496c-9645-b9eccf0d0776	IT-141	Monitor	IT	Monitor	\N	\N	\N	inactive	513dff68-b56c-47fc-8e7f-a5b399dd9e17	\N	2026-06-17 06:56:09.925+00
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, asset_id, user_id, action, old_value, new_value, changed_at) FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contracts (id, contract_id, contract_name, vendor_name, vendor_contact, vendor_email, vendor_phone, vendor_address, vendor_contact_person, active_from, active_till, contract_value, status, notes, description, created_at) FROM stdin;
330e4f84-73db-4b74-b50d-97fe1802c25f	CON-0001	demo contract	BEST BUY LAPTOP	\N	khbkhjb@uyfjfj.conm	1234567891	dfdf	jkjk	2026-06-15 00:00:00	2026-06-26 00:00:00	2000000.00	expiring_soon	\N	dfdf	2026-06-15 10:09:31.369
72fadb7b-3c86-4cc8-9f8d-ebed1daec8fc	CON-0002	demo contract 1	BRILYANT IT SOLUTIONS PVT LTD	\N	khbkhjb@uyfjfj.conm	9090909090	khjbkhjb	john	2026-06-16 00:00:00	2027-10-13 00:00:00	50000.00	active	\N	nothing to say	2026-06-16 05:09:23.246
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, name) FROM stdin;
1	Prakash
2	Vaidyanathan
3	Hema Priya
4	Leojudej
5	Srinivasan.r
6	Ratchika
7	Priyanka.s
8	Kishore
9	Manjula.M
10	Siyasamy R
11	Geetha
12	Leelavathi.m
13	Vaishnavi
14	Jyappan A
15	Jeevitha.R
16	Sree Sree
17	Siddhartha Gho
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, purchase_id, vendor_name, vendor_contact, vendor_email, vendor_address, billing_address, shipping_address, invoice_number, payment_method, notes, purchase_date, total_amount, status, created_at) FROM stdin;
513dff68-b56c-47fc-8e7f-a5b399dd9e17	PUR-GS-CH-24-25-0216	Premier Systems & Peripherals	\N	\N	\N	\N	\N	GS/CH/24-25/0216	\N	\N	2024-04-26 00:00:00	0.00	completed	2026-06-09 15:45:01.61698
beb3b070-d38c-4ca1-ad3b-e758e570f211	PUR-2425PSI24032588	SUPREME COMPUTERS INDIA PVT. LTD.	\N	\N	\N	\N	\N	2425PSI24032588	\N	\N	2025-07-19 00:00:00	0.00	completed	2026-06-09 15:45:01.61698
96d4a800-5bf6-4290-8ea3-f63dce8f4ea3	PUR-2223PSI22086262	SUPREME COMPUTERS INDIA PVT. LTD.	\N	\N	\N	\N	\N	2223PSI22086262	\N	\N	2022-12-19 00:00:00	0.00	completed	2026-06-09 15:45:01.61698
4b5dc6d3-7eba-4ccd-9874-c11ac291239d	PUR-BBLA000475	BEST BUY LAPTOP	\N	\N	\N	\N	\N	BBLA000475	\N	\N	2022-12-06 00:00:00	0.00	completed	2026-06-09 15:45:01.61698
075b060a-2a44-4b5e-b1e7-01fe7591c444	PUR-TN-22-23-S0285	BRILYANT IT SOLUTIONS PVT LTD	\N	\N	\N	\N	\N	TN/22-23/S0285	\N	\N	2022-12-13 00:00:00	0.00	completed	2026-06-10 10:39:04.883739
\.


--
-- Data for Name: software_licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.software_licenses (id, asset_id, license_key, license_vendor, license_expiry, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, created_at, username) FROM stdin;
dcef17f7-4362-4487-986f-0641ba7e0d56	Admin	\N	$2a$10$hkIFD.Ug2uq5XHR58Slf2./.NO3tJjONGxKbvIh6MQ7kmB6OL.OOG	admin	2026-06-17 08:01:48.213+00	admin
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, name, contact, email, address, contact_person, created_at) FROM stdin;
cace82d4-749b-4595-95e2-b146b1fceffc	Premier Systems & Peripherals	\N	\N	\N	\N	2026-06-09 15:45:01.61698
97027c11-e026-4fb9-aaf8-7d0a8304e465	SUPREME COMPUTERS INDIA PVT. LTD.	\N	\N	\N	\N	2026-06-09 15:45:01.61698
7f562d41-3335-4e44-b9ed-f91eb2228a7d	BEST BUY LAPTOP	\N	\N	\N	\N	2026-06-09 15:45:01.61698
8aa92e11-8c1c-40ef-9833-995264241365	BRILYANT IT SOLUTIONS PVT LTD	\N	\N	\N	\N	2026-06-10 10:39:04.883739
\.


--
-- Data for Name: warranties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warranties (id, asset_id, warranty_provider, warranty_type, start_date, end_date, warranty_number, contact_number, notes, created_at) FROM stdin;
\.


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 17, true);


--
-- Name: asset_details asset_details_asset_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_details
    ADD CONSTRAINT asset_details_asset_id_key UNIQUE (asset_id);


--
-- Name: asset_details asset_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_details
    ADD CONSTRAINT asset_details_pkey PRIMARY KEY (id);


--
-- Name: assets assets_asset_tag_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_tag_key UNIQUE (asset_tag);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_contract_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_contract_id_key UNIQUE (contract_id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: employees employees_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_name_key UNIQUE (name);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_purchase_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_purchase_id_key UNIQUE (purchase_id);


--
-- Name: software_licenses software_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.software_licenses
    ADD CONSTRAINT software_licenses_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: vendors vendors_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_name_key UNIQUE (name);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: warranties warranties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warranties
    ADD CONSTRAINT warranties_pkey PRIMARY KEY (id);


--
-- Name: idx_contract_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contract_id ON public.contracts USING btree (contract_id);


--
-- Name: idx_purchase_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchase_id ON public.purchases USING btree (purchase_id);


--
-- Name: idx_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_status ON public.contracts USING btree (status);


--
-- Name: idx_vendor_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_name ON public.purchases USING btree (vendor_name);


--
-- Name: asset_details asset_details_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_details
    ADD CONSTRAINT asset_details_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: software_licenses software_licenses_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.software_licenses
    ADD CONSTRAINT software_licenses_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warranties warranties_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warranties
    ADD CONSTRAINT warranties_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict if4LAWSHLTD96kSkTlYq02ZD4SMaWVCwXDbWRmpWye1XhIOpA2v6HmD1HBOa1a2

