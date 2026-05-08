--
-- PostgreSQL database dump
--

\restrict xFwoFMU0hRBdmtjbkZKB6hlEdDMYRBDiOO9vDa5zjqiTD7Wz7xqtTkQat1OVO7S

-- Dumped from database version 17.8 (ad62774)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: activity_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_action AS ENUM (
    'created',
    'updated',
    'deleted',
    'moved',
    'archived',
    'unarchived',
    'restored',
    'completed',
    'assigned',
    'unassigned',
    'commented',
    'invited',
    'removed',
    'role_changed'
);


--
-- Name: activity_entity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_entity_type AS ENUM (
    'project',
    'list',
    'task',
    'comment',
    'member'
);


--
-- Name: invitation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invitation_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'expired'
);


--
-- Name: list_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.list_type AS ENUM (
    'todo',
    'in_progress',
    'review',
    'done',
    'custom'
);


--
-- Name: member_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.member_role AS ENUM (
    'admin',
    'contributor',
    'viewer'
);


--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type AS ENUM (
    'invitation',
    'task_assigned',
    'task_moved',
    'comment_added',
    'project_updated',
    'mention'
);


--
-- Name: project_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_priority AS ENUM (
    'low',
    'medium',
    'high'
);


--
-- Name: project_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_status AS ENUM (
    'active',
    'completed'
);


--
-- Name: project_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_visibility AS ENUM (
    'public',
    'private'
);


--
-- Name: task_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.task_priority AS ENUM (
    'low',
    'medium',
    'high'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    user_id uuid NOT NULL,
    action public.activity_action NOT NULL,
    entity_type public.activity_entity_type NOT NULL,
    entity_id uuid,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    all_day boolean DEFAULT true NOT NULL,
    color text,
    project_id uuid,
    created_by_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: labels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.labels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6B7280'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    title text NOT NULL,
    color text,
    "position" double precision DEFAULT 0 NOT NULL,
    created_by_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    type public.list_type DEFAULT 'custom'::public.list_type NOT NULL,
    is_system boolean DEFAULT false NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type public.notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    action_url text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    invited_by_user_id uuid NOT NULL,
    email text NOT NULL,
    role public.member_role DEFAULT 'contributor'::public.member_role NOT NULL,
    status public.invitation_status DEFAULT 'pending'::public.invitation_status NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.member_role DEFAULT 'contributor'::public.member_role NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    color text DEFAULT '#2D6EF7'::text NOT NULL,
    status public.project_status DEFAULT 'active'::public.project_status NOT NULL,
    priority public.project_priority,
    start_date timestamp with time zone,
    due_date timestamp with time zone,
    is_archived boolean DEFAULT false NOT NULL,
    created_by_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    visibility public.project_visibility DEFAULT 'private'::public.project_visibility NOT NULL
);


--
-- Name: task_assignees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_assignees (
    task_id uuid NOT NULL,
    user_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: task_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    uploaded_by_id uuid NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    size integer NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: task_labels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_labels (
    task_id uuid NOT NULL,
    label_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    list_id uuid NOT NULL,
    project_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    priority public.task_priority,
    "position" double precision DEFAULT 0 NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    completed_at timestamp with time zone,
    start_date timestamp with time zone,
    due_date timestamp with time zone,
    created_by_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version integer DEFAULT 1 NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clerk_id text NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    image_url text,
    role text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    preferences jsonb DEFAULT '{"appearance": {"theme": "system", "language": "en"}, "notifications": {"memberJoined": true, "taskAssigned": true, "taskCommented": true, "taskCompleted": true, "projectUpdated": true, "invitationReceived": true}}'::jsonb
);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, project_id, user_id, action, entity_type, entity_id, metadata, created_at) FROM stdin;
38c7134e-0472-4780-b8ef-a8d7db40d7fe	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	8079b8e1-58e3-44cc-8cf9-92b922701620	{"title": "Test Delete color"}	2026-03-13 12:16:20.375609+00
77d2284c-6eed-4b4a-aa45-d10d061500af	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	04fb5aac-9023-4bf0-b145-4a2ec6015edd	{"title": "PIN WORKING"}	2026-03-13 14:10:49.983531+00
163f2fe2-bb78-45d0-a81f-00842db3d52c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Feature"}	2026-03-15 14:04:45.509021+00
875def14-0840-470d-8f44-7c1c33427732	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "in_progress", "color": "#64748B", "title": "To Do"}	2026-03-15 14:08:12.55866+00
9785386d-7804-4a72-bd9a-7e6a17b6fc83	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#64748B", "title": "To Do"}	2026-03-15 14:08:24.333379+00
b44377a4-fec9-4935-96e8-a096890de77b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"type": "review", "color": "#EC4899", "title": "Review"}	2026-03-15 14:09:29.25081+00
b8000121-2e27-4a26-99ac-efed20d73d15	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"type": "review", "color": "#F59E0B", "title": "Review"}	2026-03-15 14:09:39.906851+00
9322a428-516c-4a79-9f1b-c9dccb1b8da4	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	list	74e802ef-d44e-44db-8087-7302651dd651	{"title": "Archived"}	2026-03-15 14:12:59.829566+00
08802163-b415-4fcc-8772-e8f7ccd37aeb	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	list	74e802ef-d44e-44db-8087-7302651dd651	{"title": "Archived", "tasksMigrated": false}	2026-03-15 14:13:10.180609+00
bc1a2020-a335-454e-9921-c81925a9f6cb	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	115761d1-3726-402c-9066-9992ad89c3b1	{"title": "Task 1.7"}	2026-03-16 03:08:06.177202+00
53f14b01-4c4f-4eef-a319-2d96c86415f6	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	cd2ba9de-175e-418c-81d4-ec44ea56e026	{"title": "TAskk", "listType": "todo"}	2026-03-16 03:27:56.090096+00
b6e4aecc-7cab-4741-bd92-b43b24c53db0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	cd2ba9de-175e-418c-81d4-ec44ea56e026	{"title": "TAskk"}	2026-03-16 03:28:03.119203+00
832f6ce7-a7e5-44d9-bd21-19bbe51084db	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6 ", "dueDate": null, "priority": null, "startDate": null, "description": "Task description"}	2026-03-16 05:38:07.409094+00
6c195efd-94ba-490c-a752-d20e3abf86f5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	9b32cd8f-b5f1-439f-95a8-c26bdbffe513	{"title": "DelEte", "listType": "custom"}	2026-03-16 05:41:33.987718+00
fa86636c-cf9c-413c-86d1-15043041eae6	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (Dragged)", "newPosition": 1500}	2026-03-16 10:21:34.464673+00
338b6b2e-f318-47d3-8add-67f34aa747e8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (Dragged)", "newPosition": 3500}	2026-03-16 10:21:51.462553+00
c5b605bc-9ffd-4f99-afd8-9fb0712a7925	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#EF4444", "title": "To Do (Dragged)"}	2026-03-16 10:26:29.236812+00
03f0a2b6-0adb-497f-88a8-a97af1fd0a68	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (Dragged)", "newPosition": 5000}	2026-03-16 10:28:04.884889+00
0d8d24f5-3cf6-4d08-9bde-9be145a9e77b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (Dragged)", "newPosition": 0}	2026-03-16 10:28:20.376607+00
e7f611c4-1b2c-401e-ab64-cadffa8e61df	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	0c063c0e-c539-4f24-aafd-68cc86d02249	{"title": "Task 2.1", "listType": "todo"}	2026-03-16 10:36:00.573787+00
e2501296-01f3-4ec6-8dae-55b8db3a65e2	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	list	c01794c7-54fd-47f2-92f3-2101e96a2cd1	{"title": "New List (2)"}	2026-03-16 10:36:11.719888+00
780824c1-da5b-44af-8fdd-227469800228	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	c01794c7-54fd-47f2-92f3-2101e96a2cd1	{"type": "custom", "color": "#2D6EF7", "title": "New List"}	2026-03-16 10:36:20.283099+00
0fbf9e58-4e2c-49f4-8488-e1f966162f99	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	1dd89cb0-ede7-4395-a9f3-79f7e9d97818	{"title": "Test recent project"}	2026-03-11 13:51:51.300142+00
221da066-f061-492f-af71-f44399fac4f1	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	list	c01794c7-54fd-47f2-92f3-2101e96a2cd1	{"title": "New List", "tasksMigrated": false}	2026-03-16 10:36:30.787522+00
96c7aed6-b3e0-4515-93fa-68231dbbe0c1	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	0c063c0e-c539-4f24-aafd-68cc86d02249	{"title": "Task 2.1"}	2026-03-16 10:36:42.401429+00
b02456bd-475c-4e58-a0b7-9ef8abec3b5d	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 1500}	2026-03-17 03:32:41.651079+00
4f18d7a3-0b68-4eda-84ac-39e0d5d08fc8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 500}	2026-03-17 03:33:04.19577+00
1b3f1491-c2a4-4048-8a33-f52dfd1388e5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 1500}	2026-03-17 03:33:15.144223+00
0c333964-b720-4b2b-8197-707f56d3c215	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 500}	2026-03-17 03:33:24.673566+00
6516291c-6902-4655-8871-0662d232d578	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "To Do", "from": "In Progress", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.6", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 05:56:24.921511+00
d80a16ca-b0b5-4789-84f0-40aad505e0aa	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.5", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:04:21.742008+00
97ec6731-d5ef-467a-8f56-3015b388d71f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.6", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:04:23.15226+00
d1d54b38-08c5-413d-83a4-389e65d54244	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "Done", "from": "In Progress", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 1.5", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": true}	2026-03-17 06:04:39.221982+00
6d6fa5f4-62b1-41a8-b1c9-3a33bce9a7f8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "Done", "from": "In Progress", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 1.6", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": true}	2026-03-17 06:05:10.038118+00
8f4f06a9-74e6-4571-b08a-8bcd2b6dda01	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "Done", "from": "In Progress", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 2.0", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": true}	2026-03-17 06:05:13.207423+00
e6066857-8918-4267-a45c-c8a571d8d8a0	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	f723aeeb-d4f1-44b3-97dc-5bd5d3d73a99	{"title": "List color test"}	2026-03-12 01:46:32.84069+00
630ab3d6-dc7b-4ff0-a1dd-8e2029c4c292	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	b35e76f6-4301-4285-ae30-eca72b03d6ca	{"title": "czscs"}	2026-03-13 05:18:31.80259+00
21e971ae-0909-422a-96a7-f19afa91587c	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	c0d3d2ba-2ec3-426f-9789-3a341a5f8010	{"title": "Test complete project"}	2026-03-13 12:15:07.082261+00
194daf7a-92cb-4502-9561-54c53fd9def8	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	f8a3cbb6-27f0-4c29-a5a4-8f3713f4eab9	{"title": "List color"}	2026-03-13 12:15:45.265949+00
88611d01-a30d-45bf-b07b-5018d3a6c3ce	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	8acf8c01-4a1d-47b5-bcce-26af5064538c	{"title": "UI/UX Design "}	2026-03-15 13:52:36.864737+00
a485c4d3-ef67-4a87-81d3-ee4da53528ac	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	bdd91ef4-d7dd-4010-ab08-b89a99e66450	{"title": "Task 1", "listType": "todo"}	2026-03-16 02:44:07.179535+00
73432309-54a0-4c8f-87bb-8dd28b7518b8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	bdd91ef4-d7dd-4010-ab08-b89a99e66450	{"title": "Task 1"}	2026-03-16 02:44:29.107717+00
82bb4329-c77e-480e-89d5-d1643a3fd91b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	749a394d-249b-497a-8c5d-56ce35823508	{"title": "Task 1.5", "listType": "todo"}	2026-03-16 02:47:49.160047+00
78853ec5-de69-46ed-8752-1e8f76134545	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6", "listType": "todo"}	2026-03-16 02:47:59.838246+00
2cfaf8c6-d279-415c-9557-06df6697e3f9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	list	3a04c174-3809-4429-9d4d-b2253ec17e1e	{"title": "New List"}	2026-03-16 02:48:13.815492+00
1a6cfae1-d685-43a0-a338-2be684f616f5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	115761d1-3726-402c-9066-9992ad89c3b1	{"title": "Task 1.7", "listType": "custom"}	2026-03-16 02:48:30.667234+00
e5c044e4-8bb3-4c46-ab86-73f052897193	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"title": "Task 1.8", "listType": "done"}	2026-03-16 02:49:30.662721+00
66e0361d-170e-43fa-a5f5-a60dfb72c8b5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	b0d4938a-107f-4e38-9080-6d6d9f5d56cc	{"title": "Task 1.9", "listType": "todo"}	2026-03-16 03:11:08.195969+00
af487fe2-3f97-48f6-9e2b-e2fd8d4c7d35	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	b0d4938a-107f-4e38-9080-6d6d9f5d56cc	{"title": "Task 1.9"}	2026-03-16 03:26:09.642929+00
07abf38d-9b66-415f-98fe-9c0e1470af0f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"title": "Task 2.0", "listType": "todo"}	2026-03-16 03:26:18.105851+00
f37b4dcf-3181-4153-924f-c823e7b776d9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6 (Edited)", "dueDate": null, "priority": "low", "startDate": null, "description": "Task description"}	2026-03-16 05:34:52.993742+00
c043c0f4-445b-42bd-80b6-62edd3d85706	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6 (Edited)", "dueDate": null, "priority": null, "startDate": null, "description": "Task description"}	2026-03-16 05:35:06.91442+00
f0d2dadc-35bd-4da8-b5c7-0c0c0217f42c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"title": "Task 1.8", "dueDate": "2026-03-24T16:00:00.000Z", "priority": "medium", "startDate": "2026-03-15T16:00:00.000Z", "description": ""}	2026-03-16 06:02:08.121658+00
382180df-0efb-4298-9d94-de4b5834a68f	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	project	7fd647a9-f60c-4b54-8051-d5387818ceaa	{"title": "Task Management Feature"}	2026-03-16 06:10:55.632905+00
7af0dcef-1e50-4df5-8703-988d13d9fb24	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6", "dueDate": "2026-03-23T16:00:00.000Z", "priority": null, "startDate": "2026-03-15T16:00:00.000Z", "description": "Task description"}	2026-03-16 06:55:11.681275+00
ccc6716e-b8a3-4e99-ac17-318454d7f2c3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 1500}	2026-03-16 10:16:30.022503+00
f8c195a0-fd8a-4876-a71b-510abb768798	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#64748B", "title": "To Do (Dragged)"}	2026-03-16 10:17:59.079089+00
1cc6da59-17ef-497d-84c7-1eb28d517cc0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (Dragged)", "newPosition": 0}	2026-03-16 10:18:18.108615+00
8f1fdede-972d-4632-9645-861a499bb583	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (Dragged)", "newPosition": 0}	2026-03-16 10:21:56.641673+00
b3e24778-aaaa-4d09-802c-ded064748c2d	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress", "newPosition": 2500}	2026-03-16 10:26:05.262782+00
f50598ed-3217-48f5-bda7-ca61fa83f99e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress", "newPosition": 1000}	2026-03-16 10:26:10.241466+00
dadbdcda-49d3-466f-9d54-755247af1b74	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#EF4444", "title": "To Do"}	2026-03-16 10:42:16.057406+00
dff534df-52e7-475b-ad9f-7512d632f3c4	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 1500}	2026-03-16 11:14:11.498853+00
61a01c66-7046-4b6e-94fc-859290073f83	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 0}	2026-03-16 11:14:52.592429+00
66a409c6-8dba-44b2-b462-61693865901c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 1500}	2026-03-16 11:15:43.35724+00
69b895a9-808e-4e76-9568-b2a178d4b143	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 0}	2026-03-16 11:16:42.36967+00
55093e28-5013-477f-b517-9d0797855df8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress", "newPosition": 2500}	2026-03-16 11:16:53.285356+00
1348e997-7865-4dac-b7b6-ec85719f45d7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress", "newPosition": 1000}	2026-03-16 11:17:00.31367+00
ac77ed2e-8d9d-46b1-afd8-fe0d9742fb19	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 1500}	2026-03-17 02:19:10.553325+00
6e1229fe-3d04-4dd1-bc59-515331ff9c07	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 0}	2026-03-17 02:19:18.487567+00
b0fd1831-3661-44bb-a8a6-052af32796e0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 1500}	2026-03-17 02:34:12.598333+00
ce0e80d7-d91e-456e-bb8e-8948e974a194	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do", "newPosition": 0}	2026-03-17 02:34:18.598121+00
6c93c974-acfa-4112-85ef-fb6fb2331886	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	list	2247b78d-cdca-40e1-a23f-7a74b8d08a72	{"title": "New List 2"}	2026-03-17 04:46:11.247628+00
fa9c92c2-4ca5-4f71-9f96-dd78411e7331	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.6", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 05:55:14.075628+00
d9cb6572-9dec-48d3-898c-b0cf7e7fd57b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 2.0", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 05:57:35.287147+00
10a55f69-4155-46eb-a7b6-86171d684ed7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.6", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 05:57:37.842303+00
9d85d3b0-9f24-4b93-ad1e-5f71364b6144	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.5", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 05:57:40.296153+00
3d3ced66-1c64-43f2-b4f1-4c9795931ecf	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "To Do", "from": "In Progress", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.6", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 06:01:44.62067+00
61c2497c-6a7b-4178-a84d-7fe91288762b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "To Do", "from": "In Progress", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.5", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 06:01:49.331202+00
24e74a98-6553-4299-ad4b-242b766973b6	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{}	2026-03-22 17:51:12.969208+00
9a50f6b7-a004-48d2-b63b-ff6cac606e83	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"title": "Task test", "listType": "todo"}	2026-03-17 06:06:18.151166+00
979b47a8-dc57-4edc-b5af-35a47f24e1b2	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "To Do", "from": "Done", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.6", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-17 06:17:36.760169+00
8f26333b-70de-4d0a-8381-9a35fcac8c65	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "To Do", "from": "Done", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 2.0", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-17 06:17:38.177049+00
c3b9d394-f61c-4b48-bfb9-ae8664b4e027	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "To Do", "from": "Done", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.5", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-17 06:17:39.920858+00
2ca0c831-bfac-4d08-8346-71ddfa53910f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "To Do", "from": "Done", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.8", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-17 06:17:42.443524+00
4c14d7e7-85b7-498d-a9e9-91fc42e32c77	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.6", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:19:24.019406+00
2d20adb1-6ad4-4b34-8b3e-acfa0634bf66	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.8", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:19:25.903799+00
71ebfa4f-ad23-4b5f-b43f-2b7b5220b2c7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "To Do", "from": "In Progress", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.8", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 06:19:32.451324+00
86284665-5532-47bd-b45a-dd98173fa428	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.8", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:19:58.670123+00
ed62554d-1bc1-4e02-820b-89ff3d57e331	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "To Do", "from": "In Progress", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.8", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 06:20:06.606221+00
0e29c05c-2f71-4dac-bb6d-ccee6982b06a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 2.0", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:20:21.20211+00
068d9b68-5b3c-48fb-8d95-39576dbf5af1	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "To Do", "from": "In Progress", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.6", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 06:21:08.609121+00
fe83c87d-8c1d-4b19-8dd8-f46dcd0b574a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	9b32cd8f-b5f1-439f-95a8-c26bdbffe513	{"title": "DelEte"}	2026-03-17 06:21:19.211829+00
f0d7d361-9278-40d4-9628-03abe82de359	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "To Do", "from": "In Progress", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 2.0", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 06:21:34.788211+00
24efa931-9f96-4d7e-a908-5ac2a4fea032	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.5", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:30:09.088238+00
fde1c2b4-458f-409d-af5f-5d6d72dadeb0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 2.0", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:30:27.928548+00
7b707ed7-4f2c-4fa7-b396-555fbac96193	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.6", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:30:30.488436+00
cd2fa2e1-f723-4675-91b1-8f4870058495	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "To Do", "from": "In Progress", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.6", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 06:33:07.667109+00
ed229b95-6c80-402e-908b-16c798800cdb	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "To Do", "from": "In Progress", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.5", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 06:34:28.46681+00
a43164cb-638a-4e7b-bf4e-f609f9f36a68	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "In Progress", "from": "To Do", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.5", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:35:27.077105+00
ba5b38f4-7928-4314-acee-42df18b73986	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#EF4444", "title": "To Do (test)"}	2026-03-17 06:44:18.055434+00
6518e81c-9994-49d0-acd6-51b3117fbd70	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#EF4444", "title": "To Do (test)"}	2026-03-17 06:44:19.59895+00
73e6d93c-e55e-4af9-8560-52a47e512ae5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"type": "in_progress", "color": "#3B82F6", "title": "In Progress (test)"}	2026-03-17 06:44:33.374329+00
5f4cfd90-163a-4866-a686-9cc39e150ad4	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"type": "review", "color": "#F59E0B", "title": "Review (test)"}	2026-03-17 06:44:45.884754+00
de3e8703-8d50-46ce-92c9-e1c11226171c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	e552a873-872e-4ca1-bef3-ab02ee3b106c	{"type": "done", "color": "#10B981", "title": "Done (test)"}	2026-03-17 06:44:56.033979+00
bfd6d4cd-36c1-413a-a6f2-f760ac9612ce	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	3a04c174-3809-4429-9d4d-b2253ec17e1e	{"type": "custom", "color": "#8B5CF6", "title": "New List (test)"}	2026-03-17 06:45:11.069766+00
6a1d6c6c-13bf-4507-adbb-2b75a036fe7e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "To Do (test)", "from": "In Progress (test)", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 2.0", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 06:48:44.324636+00
e9def055-32cd-487d-8ecb-d63bc65e0708	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "In Progress (test)", "from": "To Do (test)", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.8", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 06:50:59.702294+00
ad035d1e-5a79-4b81-902d-553677b19654	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "To Do (test)", "from": "In Progress (test)", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.8", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 06:51:16.395842+00
b52e1c53-3c3a-46c7-a031-2f8df7c6f5ce	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	d640ff71-3a3e-46dc-b476-7630c9d8cf2f	{"title": "Test", "listType": "in_progress"}	2026-03-18 07:32:25.751086+00
452d6098-3beb-4d74-9c43-261ca98da679	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	d3518aec-540d-4a59-927c-4f0fef081edc	{}	2026-03-22 17:51:16.349436+00
5c744d51-0e3d-4ebc-a54b-cc72d3a2514b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "To Do (test)", "from": "In Progress (test)", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.5", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 07:08:02.020949+00
03c673de-280e-4a83-b8fb-6abb20111984	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "In Progress (test)", "from": "To Do (test)", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.6", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 07:19:13.753103+00
9f803e20-0daa-42da-82b6-74868c3e2117	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "To Do (test)", "from": "In Progress (test)", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.6", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 07:26:35.831647+00
9bd2707b-0beb-4153-a3f0-a7a77e299c62	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "In Progress", "from": "To Do", "toListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "taskTitle": "Task test", "fromListId": "f23b5c60-7d72-4589-927f-8062b37232df", "wasCompleted": false}	2026-03-17 07:26:51.836648+00
44981370-5ad3-41c8-971c-0646e47b264a	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Review", "from": "In Progress", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "taskTitle": "Task test", "fromListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "wasCompleted": false}	2026-03-17 07:27:14.474729+00
48ea598d-b318-4667-9be5-0ed30fafcffc	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Done", "from": "Review", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "taskTitle": "Task test", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-17 07:27:18.465785+00
79f77fc4-2d18-49e6-8393-d9ca6fa4a37a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "In Progress (test)", "from": "To Do (test)", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 1.8", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 07:27:35.785575+00
814800f1-d4db-4775-b82b-28665b9b0748	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "In Progress (test)", "from": "To Do (test)", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 2.0", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-17 07:30:08.116687+00
5e26a709-d2be-403a-9932-dd0b38fc150f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "Review (test)", "from": "In Progress (test)", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "taskTitle": "Task 2.0", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-17 07:30:11.668883+00
396b7155-1781-40c7-8ab3-2c78d838dea9	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Review", "from": "Done", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "taskTitle": "Task test", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-17 07:31:01.707451+00
348ac568-a018-4423-a559-9376430d5562	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Done", "from": "Review", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "taskTitle": "Task test", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-17 07:31:24.645346+00
5b9a8d4d-3c0c-4b4f-a67f-3cb286ba2d83	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "Done (test)", "from": "Review (test)", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 2.0", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-17 07:31:50.66349+00
5d626d8a-a733-4b57-952c-f09ae2952fd9	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	6a4e64be-597b-4bf5-af59-da6787755e0e	{"title": "Build task comment", "listType": "todo"}	2026-03-17 12:30:11.699501+00
a24d1863-e255-4db8-ad20-93419ec04050	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	6a4e64be-597b-4bf5-af59-da6787755e0e	{"to": "Done", "from": "To Do", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "taskTitle": "Build task comment", "fromListId": "f23b5c60-7d72-4589-927f-8062b37232df", "wasCompleted": true}	2026-03-17 12:30:25.38356+00
0b258de5-e6f4-4fb6-aeaa-c3812f3d0f56	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	6a4e64be-597b-4bf5-af59-da6787755e0e	{"to": "Review", "from": "Done", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "taskTitle": "Build task comment", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-17 12:34:05.920248+00
5483ba38-74e8-4642-97de-3d9bdc26e31d	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	archived	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Feature"}	2026-03-17 13:13:50.434405+00
b42e3836-a613-43f6-9921-c0dece7495ee	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	unarchived	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Feature"}	2026-03-17 13:16:09.489757+00
a5698afc-4f7b-437a-8d21-791982374f55	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	6a4e64be-597b-4bf5-af59-da6787755e0e	{"to": "In Progress", "from": "Review", "toListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "taskTitle": "Build task comment", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": false}	2026-03-18 01:36:04.56322+00
96aa5519-6489-4fd3-a141-dbcff6e1f125	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	6a4e64be-597b-4bf5-af59-da6787755e0e	{"to": "Review", "from": "In Progress", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "taskTitle": "Build task comment", "fromListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "wasCompleted": false}	2026-03-18 01:36:15.340271+00
fcc28937-1552-41f1-afe3-2f253eef98e3	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	archived	project	7fd647a9-f60c-4b54-8051-d5387818ceaa	{"title": "Task Management Feature"}	2026-03-18 02:07:51.05217+00
2eb0c307-c897-44c2-8b1d-d78b8a09bd32	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	unarchived	project	7fd647a9-f60c-4b54-8051-d5387818ceaa	{"title": "Task Management Feature"}	2026-03-18 02:08:00.698183+00
324060ba-ddb3-41e4-97be-eebf43e361ac	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	feee3aa3-2d5f-479e-bf74-a19d4dffa11e	{"title": "Team Collaboration Feature"}	2026-03-18 02:08:59.667526+00
1575a7cc-2322-469a-997e-94edd2fb56a2	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	6a4e64be-597b-4bf5-af59-da6787755e0e	{"to": "Done", "from": "Review", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "taskTitle": "Build task comment", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-18 02:12:09.507726+00
c34e5637-da8d-4d6a-81ad-07f05f83be70	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	6a4e64be-597b-4bf5-af59-da6787755e0e	{"to": "Review", "from": "Done", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "taskTitle": "Build task comment", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-18 02:27:30.909917+00
97864ec8-1c16-44c8-8ed8-7390b907dbdd	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "Done (test)", "from": "In Progress (test)", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 1.8", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": true}	2026-03-18 02:27:49.366318+00
7d84cb88-9b99-43f1-9d42-82683e536264	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	6a4e64be-597b-4bf5-af59-da6787755e0e	{"to": "Done", "from": "Review", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "taskTitle": "Build task comment", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-18 02:31:27.255305+00
99ad3b38-7f99-4100-ad61-62b577e4b3c2	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "Review (test)", "from": "Done (test)", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "taskTitle": "Task 2.0", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-18 02:33:24.881401+00
340d9716-63bd-4d21-a909-d02ab0a4883f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"color": "#EC4899", "title": "List Management Feature", "status": "active", "dueDate": "2026-03-16T00:00:00.000Z", "priority": "medium", "visibility": "private", "description": "Implement list/column management functionality."}	2026-03-18 02:41:25.701431+00
1acb6d34-5de8-4220-895e-1bbdd6f68639	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "Done (test)", "from": "Review (test)", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 2.0", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-18 02:50:23.107751+00
19d67d69-99d0-4172-9fac-d84170d2fcde	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "Review (test)", "from": "Done (test)", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "taskTitle": "Task 2.0", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-18 02:50:28.223351+00
2ad2bf31-6116-4d0d-a1f8-e20c0c0d693f	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Review", "from": "Done", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "taskTitle": "Task test", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-18 02:50:39.942044+00
f3808080-b9a8-4d83-8de6-d027a3362a26	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Done", "from": "Review", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "taskTitle": "Task test", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-18 02:51:01.233313+00
dc802e1c-42a1-4401-a294-8be25f597e33	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Review", "from": "Done", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "taskTitle": "Task test", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-18 02:58:44.249061+00
156750a7-a68c-4e88-97e7-5bf6c4b6e49e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#EF4444", "title": "To Do (test edit)"}	2026-03-18 02:59:08.508742+00
a8beb58d-00c7-4949-bfe1-5c14ba6c6784	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#EF4444", "title": "To Do (test)"}	2026-03-18 03:03:02.908868+00
75900ceb-f3e4-4557-9889-42a5dca1b8b4	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#EF4444", "title": "To Do (test)!"}	2026-03-18 03:11:04.861148+00
96dbc27a-e49c-4d59-b80b-3d16c2fb5b3f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	list	2247b78d-cdca-40e1-a23f-7a74b8d08a72	{"title": "New List 2", "tasksMigrated": false}	2026-03-18 03:11:16.099258+00
bcc0a2d1-70e4-4f24-b398-7c3252bc6169	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	list	bcf1fcd7-bb93-4de9-97ad-e91692819dbb	{"title": "Archived"}	2026-03-18 03:11:30.658484+00
6134c987-6b8e-4be0-ac0d-17e8746e4917	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Done", "from": "Review", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "taskTitle": "Task test", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-18 04:11:08.236151+00
65862d11-14fa-4ad4-a1d3-1414eba87b9e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Feature", "status": "completed"}	2026-03-18 04:37:15.977768+00
8bff9bdc-ee38-465c-9b19-ad5534c12c49	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Feature", "status": "active"}	2026-03-18 04:37:44.880008+00
fd72b396-ad03-4d96-a89b-6dde3d27e41a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "Done (test)", "from": "Review (test)", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 2.0", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-18 04:43:16.455723+00
385f5c7b-8a3f-4134-8fe5-449c32b8e2e9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "Done (test)", "from": "To Do (test)!", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 1.5", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": true}	2026-03-18 04:43:22.773653+00
a53eddc6-4c41-47f2-b72c-db4046b3e482	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "Done (test)", "from": "To Do (test)!", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 1.6", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": true}	2026-03-18 04:43:27.530292+00
3014749d-0d2d-41ad-87b8-c65ae054fda9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Feature", "status": "completed"}	2026-03-18 04:46:25.199873+00
5abcf2a1-f1fd-44cb-9e0b-6367ba4aa5a6	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Feature", "status": "active"}	2026-03-18 04:46:44.140885+00
ed929f9f-c7d0-462d-baac-d575633f2666	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "Review (test)", "from": "Done (test)", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "taskTitle": "Task 1.8", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-18 04:48:57.585679+00
8303582f-9819-4033-a8e8-2ffd38344b24	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	7fd647a9-f60c-4b54-8051-d5387818ceaa	{"title": "Task Management Feature", "status": "completed"}	2026-03-18 04:50:50.693477+00
2f1333e5-f017-4ab1-8294-9b5e788b8fdc	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "To Do (test)!", "from": "Done (test)", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.5", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-18 05:17:07.959297+00
63daeb1a-0e2c-45a9-84b7-b95191663d3a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "To Do (test)!", "from": "Done (test)", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Task 1.6", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-18 05:17:21.178908+00
337855ad-c4d6-4d5f-868b-4c9733bbbe49	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"to": "Done (test)", "from": "Review (test)", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 1.8", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-18 05:31:17.765822+00
85f4d0b1-3350-490f-91f9-998e3fa01506	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	749a394d-249b-497a-8c5d-56ce35823508	{"to": "Done (test)", "from": "To Do (test)!", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 1.5", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": true}	2026-03-18 05:31:23.847637+00
37d8e748-4432-4017-a394-0dad89137981	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "Done (test)", "from": "To Do (test)!", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task 1.6", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": true}	2026-03-18 05:31:29.899122+00
085e8abf-58a2-4615-a955-5735966da5b9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "Review (test)", "from": "Done (test)", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "taskTitle": "Task 1.6", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-18 05:31:37.880686+00
1e5d0e5a-5c6e-496b-8ff7-14fec0c5d3be	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	6a4e64be-597b-4bf5-af59-da6787755e0e	{"to": "Review", "from": "Done", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "taskTitle": "Build task comment", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-18 06:03:51.292406+00
79d1dd91-fb89-4b19-ba2a-2be02539bd48	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	945f4ff0-5487-468b-8f6e-bfdba89e4dce	{"title": "Created this from dashboard page", "listType": "custom"}	2026-03-18 06:20:52.848583+00
47b41969-3669-417b-8873-71c37986b539	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	1ebbd6e0-9e1b-4bde-a804-356cd254598e	{"title": "Initialize shadcn", "listType": "todo"}	2026-03-18 06:27:31.119352+00
ae5920e4-bc5d-47ce-a42f-ea678835c344	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	6a4e64be-597b-4bf5-af59-da6787755e0e	{"to": "Done", "from": "Review", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "taskTitle": "Build task comment", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-18 06:28:59.874369+00
c9874e0c-75df-45ca-8da3-0df56ff1d3d3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"title": "Add random color for labels", "listType": "todo"}	2026-03-18 07:20:42.103302+00
f1c87050-9973-4b6d-81e2-ac4413924fa8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	41a23fe7-144f-4047-8b39-41da20d6a7a1	{"title": "Another 1", "listType": "in_progress"}	2026-03-18 07:21:41.036135+00
a3b3b3d1-3cee-4616-b9fc-195b50180ae9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{}	2026-03-22 17:49:30.352357+00
cdb22a99-2d60-4591-88fd-3833b6abd704	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	d640ff71-3a3e-46dc-b476-7630c9d8cf2f	{"title": "Test edited", "dueDate": null, "priority": null, "startDate": null, "description": "kndlakn"}	2026-03-18 07:32:38.190509+00
9e6e58f8-078b-4c64-a41b-0692bb45c0f3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	e3a59abc-b749-476f-af30-375681d22f4c	{"title": "Test again from modal", "listType": "review"}	2026-03-18 07:33:21.412596+00
a79ae5c8-fb4f-4ab6-a2ae-8e73458ff711	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	e3a59abc-b749-476f-af30-375681d22f4c	{"title": "Test again from modal"}	2026-03-18 07:34:38.189717+00
f628e1b4-67b0-473e-bf7e-b04c409c1f2a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	41a23fe7-144f-4047-8b39-41da20d6a7a1	{"title": "Another 1"}	2026-03-18 07:34:44.5911+00
63015548-0d33-4a34-a77c-c41cf1377f56	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	d640ff71-3a3e-46dc-b476-7630c9d8cf2f	{"title": "Test edited"}	2026-03-18 07:34:49.087146+00
f239e3bd-5fba-4aa1-8696-b4f52b594355	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"title": "Task creation from Modal testt", "listType": "review"}	2026-03-18 07:36:20.723934+00
ba0b5560-16ea-496b-b6a6-0c4791fc62ab	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1ebbd6e0-9e1b-4bde-a804-356cd254598e	{"to": "In Progress (test)", "from": "To Do (test)!", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Initialize shadcn", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-18 07:41:51.887631+00
2db894d1-e12e-434f-a3b7-0f7113a33207	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1ebbd6e0-9e1b-4bde-a804-356cd254598e	{"to": "To Do (test)!", "from": "In Progress (test)", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Initialize shadcn", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-18 07:41:57.794801+00
67a53c9e-d736-4584-ba9a-49e81ffe7b78	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"title": "Labels Test", "listType": "review"}	2026-03-18 08:03:09.259269+00
1b2798dd-703f-4f46-b912-1026cb3d82f3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6", "dueDate": "2026-03-23T16:00:00.000Z", "priority": null, "startDate": "2026-03-15T16:00:00.000Z", "description": "Task description"}	2026-03-18 09:55:51.505535+00
65a57dcc-1869-42d6-9e04-1f2daf7fce8f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6", "dueDate": "2026-03-23T16:00:00.000Z", "priority": null, "startDate": "2026-03-15T16:00:00.000Z", "description": "Task description"}	2026-03-18 09:58:12.513917+00
51dde5f3-96d9-4227-89f4-bf0fd325d764	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6.2", "dueDate": "2026-03-23T16:00:00.000Z", "priority": null, "startDate": "2026-03-15T16:00:00.000Z", "description": "Task description"}	2026-03-18 09:58:26.436941+00
be50e87e-e427-471f-8de7-7b38cd4d6dea	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6.", "dueDate": "2026-03-23T16:00:00.000Z", "priority": null, "startDate": "2026-03-15T16:00:00.000Z", "description": "Task description"}	2026-03-18 10:03:42.170312+00
f4c86bf9-24e5-49a3-844d-197d0f495e43	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6", "dueDate": "2026-03-23T16:00:00.000Z", "priority": null, "startDate": "2026-03-15T16:00:00.000Z", "description": "Task description"}	2026-03-18 10:03:56.601487+00
8f54fb0d-71e8-4d49-946e-196a7909c063	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"title": "Task 1.6", "dueDate": "2026-03-23T16:00:00.000Z", "priority": null, "startDate": "2026-03-15T16:00:00.000Z", "description": "Task description"}	2026-03-18 10:04:16.240125+00
73994af0-861d-4bf9-ba53-b3775b660eeb	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"to": "Done (test)", "from": "Review (test)", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Task creation from Modal testt", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-18 10:06:41.318811+00
6574807c-d79d-4240-aa5f-fcc357d9ba28	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"title": "Task creation from Modal testt", "dueDate": "2026-03-17T16:00:00.000Z", "priority": null, "startDate": null, "description": "smfklanfkla"}	2026-03-18 10:06:43.815403+00
51fa4b5c-2061-429d-af8e-81bfe6c147d5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"to": "Review (test)", "from": "Done (test)", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "taskTitle": "Task creation from Modal testt", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-18 10:06:50.733312+00
bdd2a4cc-e27b-4f93-b00a-3401bcf099d2	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"title": "Task creation from Modal testt", "dueDate": "2026-03-17T16:00:00.000Z", "priority": null, "startDate": null, "description": "<p>Normal <strong>Bold</strong> <em>Italic</em> <s>Strikethrough</s><br><br>Apple <br>Banana</p><p></p>"}	2026-03-18 10:43:49.932776+00
0e3b089b-f17e-4fa2-a267-05638dda9d72	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"title": "Task creation from Modal testt", "dueDate": "2026-03-17T16:00:00.000Z", "priority": null, "startDate": null, "description": "<ul><li><p>A</p></li><li><p>B</p></li><li><p>C</p></li></ul><p>Normal <strong>Bold</strong> <em>Italic</em> <s>Strikethrough</s><br><br></p>"}	2026-03-18 10:47:48.306478+00
ce802903-bcda-4b6f-9a54-e7298c740482	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	09b40f31-54b8-4c7a-a41e-7ddce1e3d51b	{"title": "Namumula", "listType": "in_progress"}	2026-03-18 10:54:38.629186+00
1f948def-282f-42e9-b6c0-bbc4d9d4eff6	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "In Progress (test)", "from": "Done (test)", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Task 2.0", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-18 11:10:54.993261+00
3cb72fc9-4b7b-4663-a99e-04c48199c1d5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"to": "Review (test)", "from": "In Progress (test)", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "taskTitle": "Task 2.0", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-18 11:13:22.232679+00
ad5f8e1d-138c-4892-8a5f-0d0129f84cd3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	09b40f31-54b8-4c7a-a41e-7ddce1e3d51b	{"title": "Namumula", "dueDate": null, "priority": "low", "startDate": null, "description": "<p>Normal <strong>Bold </strong><em>Italic</em> <s>Strike </s></p><ul><li><p>1</p></li><li><p>2</p></li></ul><p></p>"}	2026-03-18 11:37:44.213017+00
27d462d2-4ff5-4162-b253-35b3f2c7cce3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	09b40f31-54b8-4c7a-a41e-7ddce1e3d51b	{"to": "To Do (test)!", "from": "In Progress (test)", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "taskTitle": "Namumula", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-18 11:47:17.278437+00
04e25c41-6289-4c65-b70d-c26a4fdd12d7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	09b40f31-54b8-4c7a-a41e-7ddce1e3d51b	{"to": "Done (test)", "from": "To Do (test)!", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "taskTitle": "Namumula", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": true}	2026-03-18 11:47:27.727606+00
9cda3715-7d30-47f0-a942-c58ccd055a07	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"title": "Task creation from Modal testt", "dueDate": "2026-03-15T16:00:00.000Z", "priority": null, "startDate": null, "description": "<ul><li><p>A</p></li><li><p>B</p></li><li><p>C</p></li></ul><p>Normal <strong>Bold</strong> <em>Italic</em> <s>Strikethrough</s><br><br></p>"}	2026-03-18 12:27:27.847907+00
7964bb11-de9f-4ed1-8a0b-c35e020fdba4	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#64748B", "title": "To Do (test)!"}	2026-03-18 12:34:57.754931+00
e52b6300-1c95-41e9-9e9f-b8ad577cbe92	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	09b40f31-54b8-4c7a-a41e-7ddce1e3d51b	{"title": "Make description rich text", "dueDate": null, "priority": "low", "startDate": null, "description": "<p>Normal <strong>Bold </strong><em>Italic</em> <s>Strike </s></p><ul><li><p>1</p></li><li><p>2</p></li></ul><p></p>"}	2026-03-18 12:54:57.03887+00
8f3b9de2-3220-49b5-beed-231efa34f660	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	f15453ca-130b-42d3-b0d1-e71e5a45f02e	{"title": "Drag and drop functionality", "listType": "custom"}	2026-03-18 13:07:06.678368+00
a699d04f-e08f-46de-b20c-8468a10e8de9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	d3518aec-540d-4a59-927c-4f0fef081edc	{}	2026-03-22 17:49:33.838819+00
a79eb1cd-0fff-40da-b1b3-ef53bde62474	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	945f4ff0-5487-468b-8f6e-bfdba89e4dce	{"title": "Created this from dashboard page"}	2026-03-18 13:07:30.28475+00
4525497e-1d37-4688-a09e-845bfb845421	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	069e8fd5-5f3e-4630-8b4a-7fd1c918b48c	{"title": "Task 2.1", "listType": "in_progress"}	2026-03-18 13:10:25.334517+00
fd670432-01c7-46ab-84f9-293273249c1d	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	069e8fd5-5f3e-4630-8b4a-7fd1c918b48c	{"title": "Task 2.1"}	2026-03-18 13:11:18.33226+00
d6f05530-cc1f-4d04-80b7-7d7dc55e9285	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"title": "Task 2.2", "listType": "in_progress"}	2026-03-18 13:11:23.795302+00
716d6bb8-6e7b-4b2f-86db-97e24911f61b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"title": "Change list color feature", "listType": "in_progress"}	2026-03-18 13:16:24.222656+00
a81f1a03-6665-4890-9529-d4907bc96e51	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	commented	comment	3abdb259-e9eb-4284-99a4-74928e8cf963	{"taskId": "847c0886-1fa5-457f-a0e9-0351e21e0fc1", "preview": "Comment test", "taskTitle": "Change list color feature"}	2026-03-19 01:44:24.112925+00
c5dffd8d-eb55-4752-a9a7-8eb0fcbb4cf5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	comment	3abdb259-e9eb-4284-99a4-74928e8cf963	{"taskId": "847c0886-1fa5-457f-a0e9-0351e21e0fc1", "preview": "Comment test"}	2026-03-19 01:46:13.182637+00
7ca71201-ac97-44ac-ab8c-d63257f9aa21	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"title": "Task creation from Modal testt", "dueDate": "2026-03-15T16:00:00.000Z", "priority": null, "startDate": null, "description": "<ul><li><p>A</p></li><li><p>B</p></li><li><p>C</p></li></ul><p>Normal <strong>Bold</strong> <em>Italic</em> <s>Strikethrough</s><br><br></p>"}	2026-03-19 01:51:55.588706+00
007f4875-6e4b-4f74-a301-3cbc1886f2c9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	commented	comment	4727ef25-8b99-449a-a49e-9dac87b05f13	{"taskId": "09b40f31-54b8-4c7a-a41e-7ddce1e3d51b", "preview": "This task is done !", "taskTitle": "Make description rich text"}	2026-03-19 01:52:35.949865+00
e230c472-8288-41b3-934c-aa6b3260c09a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	commented	comment	878b1ee3-c6ef-450e-9761-8899181da156	{"taskId": "09b40f31-54b8-4c7a-a41e-7ddce1e3d51b", "preview": "Yay", "taskTitle": "Make description rich text"}	2026-03-19 01:52:48.97284+00
b7f6beb0-73da-4052-85a3-33fbb6f70d3e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	commented	comment	a1bee4d5-7cfc-423e-b80a-3050791ae92f	{"taskId": "847c0886-1fa5-457f-a0e9-0351e21e0fc1", "preview": "Make it colorful", "taskTitle": "Change list color feature"}	2026-03-19 01:53:26.748393+00
7dbcbfc9-59bb-41b7-8cca-7442456c1981	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	comment	a1bee4d5-7cfc-423e-b80a-3050791ae92f	{"taskId": "847c0886-1fa5-457f-a0e9-0351e21e0fc1", "preview": "Make it colorful !"}	2026-03-19 01:59:30.895071+00
d4ffe690-2cf3-410b-a2b2-5cbe38f8b9d7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	comment	878b1ee3-c6ef-450e-9761-8899181da156	{"taskId": "09b40f31-54b8-4c7a-a41e-7ddce1e3d51b", "preview": "Yay"}	2026-03-19 02:02:08.573497+00
6caa63bf-a8ff-479a-baa2-805c478dc8e1	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	commented	comment	337ef324-2385-4ea1-8f6b-226c149a9397	{"taskId": "09b40f31-54b8-4c7a-a41e-7ddce1e3d51b", "preview": "?", "taskTitle": "Make description rich text"}	2026-03-19 02:27:09.383862+00
013d8b02-3381-4e54-ae4b-d39fdc3ca9aa	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "In Progress (test)", "from": "To Do (test)!", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "taskTitle": "Add random color for labels", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-19 03:04:59.700482+00
de090a22-84cf-4136-a8e5-556d7d5021d0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	commented	comment	00275e12-bd26-42cd-a7f1-5984b313a3de	{"taskId": "c5c8da72-bdd3-4657-bb44-d1398ae8324e", "preview": "This is a comment", "taskTitle": "Task 2.2"}	2026-03-19 10:03:44.767101+00
c85b29bc-c7f3-432e-81c5-9ab7c6509ba9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	f4dc8763-7096-4454-a608-1386735664c0	{"title": "Improve Types", "listType": "in_progress"}	2026-03-19 10:04:51.833768+00
15764673-e457-4c40-8802-3cfd572cb5da	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Review", "from": "Done", "toColor": "#8B5CF6", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "fromColor": "#10B981", "taskTitle": "Task test", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-19 10:05:43.432051+00
d6a3b727-5106-4dd2-b64c-311aa371cf80	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	564cd3a0-aac0-48cd-9cd1-2d6fcd87cb7c	{"title": "Implement task attachments ", "listType": "todo"}	2026-03-19 11:26:46.2164+00
671329b1-ae72-46fb-b719-306c2c890cde	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	64a4ab3f-75d4-4d02-9ded-bae04eb6f7a0	{"title": "Task Attachment test", "listType": "todo"}	2026-03-19 12:26:53.106724+00
e0c94b07-1e61-4ab7-b4f9-2f2282f186bb	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	564cd3a0-aac0-48cd-9cd1-2d6fcd87cb7c	{"title": "Implement task attachments "}	2026-03-19 12:30:57.286721+00
41a9adc3-bfa8-4013-ae97-a8a071a2f4e3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	64a4ab3f-75d4-4d02-9ded-bae04eb6f7a0	{"title": "Task Attachment test"}	2026-03-19 12:31:02.25449+00
8aa95e52-0ecf-4c09-8bf7-a52ce9b600e7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"title": "Test uploadthing", "listType": "todo"}	2026-03-19 12:31:41.364782+00
8728337d-ebd5-43f3-aea9-b51b3ec85067	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	7fd647a9-f60c-4b54-8051-d5387818ceaa	{"title": "Task Management Feature", "status": "active"}	2026-03-19 21:09:36.571243+00
5fbae0d5-86fe-4a25-a8f7-52afadd5e6b7	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"title": "Task Attachment", "listType": "todo"}	2026-03-19 21:28:45.866998+00
c81923a9-8c04-4fa1-a8b3-afa063883f8b	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"type": "attachments_added", "count": 1, "fileNames": ["Sample Document.pdf"]}	2026-03-19 21:30:04.443306+00
ef49567a-5b4d-445b-930b-ca5f43ea9d31	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"title": "Task Attachment", "dueDate": null, "priority": null, "startDate": null, "description": "<p>Implement adding attachments in a task using UploadThing</p>"}	2026-03-19 21:30:06.55899+00
07f7aef8-b402-45a9-9ad0-bcaaaca53b45	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	commented	comment	ccbbd732-a07e-40c7-bb0a-9b6aed0725c4	{"taskId": "2c88a52e-ba01-4ba1-8013-63fbbed299b7", "preview": "Where can I view the attachments?", "taskTitle": "Task Attachment"}	2026-03-19 21:39:06.998656+00
6a36183a-dc13-45d9-8857-a50034d271ea	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"type": "attachment_deleted", "fileName": "GOOGLE-FORM-HEADERS.png"}	2026-03-19 21:53:33.922133+00
6d58acdb-949a-49bd-a78c-9025dece147b	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "Review", "from": "To Do", "toColor": "#8B5CF6", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "fromColor": "#64748B", "taskTitle": "Task Attachment", "fromListId": "f23b5c60-7d72-4589-927f-8062b37232df", "wasCompleted": false}	2026-03-19 21:54:24.238105+00
48179ef7-f816-4936-ad7d-14a4d21294e0	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#8B5CF6", "taskTitle": "Task Attachment", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-19 21:54:29.020099+00
70f6a789-ce35-41eb-8d04-7ea8dc3c7f85	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "Review", "from": "Done", "toColor": "#8B5CF6", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "fromColor": "#10B981", "taskTitle": "Task Attachment", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-19 21:54:35.96936+00
443392c9-7cc3-4640-8b0d-211db6d63343	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"type": "attachments_added", "count": 1, "fileNames": ["NBI-CLEARANCE.pdf"]}	2026-03-19 22:05:52.780354+00
f39436d4-0e0d-4d2e-855e-a14cd9542825	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"title": "Attach documentation file", "listType": "in_progress"}	2026-03-19 22:05:52.829404+00
170a2eea-260d-42f9-a6da-909948d119d2	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	729790eb-c38a-4380-a271-80e88ea14d25	{"title": "Task 2.1", "listType": "review"}	2026-03-19 22:46:13.039723+00
3d1fa3ad-efef-4b23-a574-2a63f05ab83b	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#8B5CF6", "taskTitle": "Task test", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-20 00:33:23.723701+00
26098303-ad24-4a1a-b6ce-d6ae2210655a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	invited	member	10d82719-0dcf-47a3-97c8-425d092c657b	{"role": "contributor", "email": "flordeliza112370@gmail.com"}	2026-03-20 03:08:04.306397+00
6f7f4357-6830-4663-9089-9fede12e8195	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1ebbd6e0-9e1b-4bde-a804-356cd254598e	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Initialize shadcn", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-20 05:30:54.830899+00
6d6e5fee-0b4a-4a35-93f0-2a0d6410010e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Task 1.6", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-20 05:31:38.24725+00
79faa47d-a55f-4f90-9708-fc1156f812ad	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Task creation from Modal testt", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-20 06:43:47.634675+00
9d8d3bc9-888b-4d69-ba31-75b745e680b0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"color": "#EC4899", "title": "List Management Feature", "status": "active", "dueDate": "2026-03-16T00:00:00.000Z", "priority": "medium", "visibility": "public", "description": "Implement list/column management functionality."}	2026-03-20 07:58:56.948452+00
26883b1c-bb22-45ca-a5f6-3ec8491e2db5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"taskTitle": "Change list color feature", "assigneeId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9"}	2026-03-20 13:16:38.544055+00
707e1dc2-be6c-4694-a8cf-19137865ffa4	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"taskTitle": "Task 2.2", "assigneeId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9"}	2026-03-20 13:16:58.107173+00
68951753-cec7-44f6-90b4-394a228ad490	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	e5d9891c-4790-401b-9b77-59d242467d04	{"title": "Test assign", "listType": "review"}	2026-03-20 13:17:27.921436+00
e4e6463d-4a3b-4933-bfc4-c03aa8d4938a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	e5d9891c-4790-401b-9b77-59d242467d04	{"taskTitle": "Test assign", "assigneeId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9"}	2026-03-20 13:17:29.440304+00
6b434afc-f0a1-431d-bb88-d6d84df83cef	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	e5d9891c-4790-401b-9b77-59d242467d04	{"title": "Test assign"}	2026-03-20 13:19:04.070028+00
1878d681-599a-4e05-9338-a4acf6ee4ea0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Task 2.2", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-20 13:21:40.705812+00
144b32b9-c0e2-4f82-a3ac-b5826dcd806b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Task 2.2", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-20 13:23:27.974843+00
06e4bf09-43c7-4cf4-93e1-04bf91dc422d	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"dueDate": "2026-03-19T16:00:00.000Z"}	2026-03-20 13:32:46.592794+00
4f136327-ff3a-4586-bcca-80e527bae80e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"taskTitle": "Labels Test", "assigneeId": "68bb7995-6f4b-4a39-ad45-5243343eecfe"}	2026-03-20 13:33:18.626361+00
5a18e8db-5284-4a4f-8c89-e07ce815d325	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"dueDate": "2026-03-04T16:00:00.000Z"}	2026-03-20 21:45:13.525721+00
844a68dc-82eb-4f38-83b2-23e24c8bc1d7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"dueDate": "2026-03-30T16:00:00.000Z"}	2026-03-20 21:45:21.816764+00
95546da2-84b6-4079-ab5e-4892e4899d71	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	f4dc8763-7096-4454-a608-1386735664c0	{"taskTitle": "Improve Types", "assigneeId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9"}	2026-03-20 21:45:41.753327+00
d192ca3f-3b5c-4b5d-a903-7526c5792832	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	unassigned	task	f4dc8763-7096-4454-a608-1386735664c0	{"taskTitle": "Improve Types", "assigneeId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9"}	2026-03-20 21:45:50.249537+00
6faaa959-167e-48e5-bb60-e05a86b69410	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Add random color for labels", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-20 22:07:20.335363+00
c534f097-7d6c-4757-bd5f-d29e7856d314	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Add random color for labels", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-20 21:45:31.0297+00
3362d272-e97d-4b3a-ae78-476bbee9adff	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Review (test)", "from": "Done (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Add random color for labels", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-20 22:07:26.885017+00
2660d7a9-ef6b-48a3-a193-4c52d190d39f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"taskTitle": "Add random color for labels", "assigneeId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9", "assigneeName": "Flor deLiza"}	2026-03-20 22:15:47.812227+00
c0cb53af-ed8d-40f0-9e59-86b7c93acd6b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"title": "Task 2.2", "labels": [], "dueDate": null, "priority": "medium", "startDate": null, "description": ""}	2026-03-20 23:51:49.923101+00
701d9bb3-7685-4153-881c-553cdabb5eb1	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"title": "Change list color feature", "labels": [], "dueDate": "2026-03-19T16:00:00.000Z", "priority": "low", "startDate": null, "description": ""}	2026-03-20 23:52:08.185602+00
a9598643-ab73-45e1-84b8-838b104f9e68	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"title": "Labels Test", "labels": [], "dueDate": "2026-03-17T16:00:00.000Z", "priority": "medium", "startDate": null, "description": "This is a tests "}	2026-03-20 23:53:27.202669+00
0d8fc6be-dbfb-4721-affa-d74e76898d38	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	f4dc8763-7096-4454-a608-1386735664c0	{"title": "Improve Types", "labels": [], "dueDate": null, "priority": "high", "startDate": null, "description": ""}	2026-03-20 23:53:35.524822+00
7a9529b8-9486-4a27-869a-26f83647e79b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	f4dc8763-7096-4454-a608-1386735664c0	{"taskTitle": "Improve Types", "assigneeId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9", "assigneeName": "Flor deLiza"}	2026-03-21 12:52:23.08676+00
791ab877-9385-4207-b9a2-22c1a019513e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	f4dc8763-7096-4454-a608-1386735664c0	{"title": "Improve Types", "labels": [], "dueDate": null, "priority": "high", "startDate": null, "description": ""}	2026-03-21 12:52:29.781454+00
1ba1ccd7-ad6e-47d1-bf36-40c3ee7c370e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"taskTitle": "Test uploadthing", "assigneeId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9", "assigneeName": "Flor deLiza"}	2026-03-21 12:53:05.012186+00
f38a5af6-facb-4a6e-9175-62df41277d3f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	unassigned	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"taskTitle": "Test uploadthing", "assigneeId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9", "assigneeName": "Flor deLiza"}	2026-03-21 12:53:11.096561+00
ea66a5ab-9cb1-4d2c-9fec-74910abb90a9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	f15453ca-130b-42d3-b0d1-e71e5a45f02e	{"taskTitle": "Drag and drop functionality", "assigneeId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9", "assigneeName": "Flor deLiza"}	2026-03-21 12:53:18.038868+00
1fa0d283-9404-4987-b0c6-91dbc3f9739a	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"to": "Done", "from": "In Progress", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#3B82F6", "taskTitle": "Attach documentation file", "fromListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "wasCompleted": true}	2026-03-21 14:06:48.49711+00
185e4c78-984b-47da-a1fc-fb6064a16420	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#8B5CF6", "taskTitle": "Task Attachment", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-21 14:06:55.689175+00
f7ee8069-3b7d-4f62-a03d-d29b3cfcba90	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	729790eb-c38a-4380-a271-80e88ea14d25	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#8B5CF6", "taskTitle": "Task 2.1", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-21 14:07:00.400872+00
8fdf673e-d3f5-4bfb-b206-e6516bf1eb5c	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	729790eb-c38a-4380-a271-80e88ea14d25	{"to": "Review", "from": "Done", "toColor": "#8B5CF6", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "fromColor": "#10B981", "taskTitle": "Task 2.1", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-21 14:07:11.773546+00
af8dcb7c-cea9-466d-933d-1bc42f90aed7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	role_changed	member	cb6e7ed1-2c62-411a-9647-ffbd81b0afc9	{"to": "admin", "from": "contributor", "memberName": "Flor deLiza"}	2026-03-21 14:14:39.01105+00
d92c5f0e-4ce5-447c-86cd-2cc63357d775	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	role_changed	member	cb6e7ed1-2c62-411a-9647-ffbd81b0afc9	{"to": "contributor", "from": "admin", "memberName": "Flor deLiza"}	2026-03-21 14:15:09.696648+00
5173b200-f401-48df-8b83-050383c1247d	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Labels Test", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-22 17:40:24.677241+00
eb837a57-75d1-4aa5-b5fb-25fc8d177f73	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Labels Test", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-22 17:40:33.990852+00
893c7e6e-3772-469e-9e3f-e60a057b98b3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Add random color for labels", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-22 17:43:55.273371+00
abfd6279-cac3-4141-a6c0-a1919fdd7a55	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Review (test)", "from": "Done (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Add random color for labels", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-22 17:44:02.588532+00
84db7774-ff28-4da8-8772-df205420b921	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"to": "Review (test)", "from": "Done (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Test uploadthing", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-22 17:44:10.474988+00
a9f63d1a-94f2-416e-ad5c-90f9feabb070	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "Review (test)", "from": "Done (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Task 2.2", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-22 17:44:17.17391+00
40f6f893-22a4-499e-b3af-9be0aff1b34f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"taskTitle": "Test uploadthing", "assigneeId": "68bb7995-6f4b-4a39-ad45-5243343eecfe", "assigneeName": "Kianna Gragg"}	2026-03-22 17:50:14.512182+00
4f00d418-fbe4-4b10-893b-dcccdc9010d7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"taskTitle": "Task creation from Modal testt", "assigneeId": "68bb7995-6f4b-4a39-ad45-5243343eecfe", "assigneeName": "Kianna Gragg"}	2026-03-22 17:50:16.81239+00
6c000adf-a451-42a9-be46-dbad4dbd199a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	9ded37ce-c937-4c49-8256-169529ab62e2	{"title": "Task 2.0"}	2026-03-22 17:50:52.755659+00
9aa45914-dff6-4498-91ff-cbe174b6d35f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	c36378cd-94e7-4e19-a44e-3764d29546cb	{"title": "Task creation from Modal testt"}	2026-03-22 17:50:57.206504+00
05349389-5660-420c-87cb-1ce0f6a87eef	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{}	2026-03-22 17:57:56.840882+00
fc20b0c7-b107-4f6b-8fc8-2d0ff919040c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	d3518aec-540d-4a59-927c-4f0fef081edc	{}	2026-03-22 17:58:00.530339+00
92d79adb-4827-42b7-ba5e-d75f6292f0dc	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{}	2026-03-22 17:58:49.38682+00
ebced0c9-fdfa-4221-8358-9fcaf004e999	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	d3518aec-540d-4a59-927c-4f0fef081edc	{}	2026-03-22 17:58:52.81277+00
7b53ffb0-8f4b-4054-8962-e21553058b89	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Change list color feature", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-22 18:05:17.8866+00
4214f7b6-bceb-41e3-9d04-cf958c103d14	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Labels Test", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-22 18:05:20.032685+00
4d62b32c-7fc5-4e75-984c-3703403721cf	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "To Do (test)!", "from": "Review (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#F59E0B", "taskTitle": "Add random color for labels", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-22 18:09:22.109657+00
b4067187-6c74-42b5-b044-4e4346606b64	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	commented	comment	59d50c62-8b26-4e1c-ade2-9384e1e96013	{"taskId": "729790eb-c38a-4380-a271-80e88ea14d25", "preview": "Who is assigned in this task?", "taskTitle": "Task 2.1"}	2026-03-23 06:26:22.851029+00
b0d9daab-ab8c-4a37-8394-3d798af978b9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	role_changed	member	cb6e7ed1-2c62-411a-9647-ffbd81b0afc9	{"to": "viewer", "from": "contributor", "memberName": "Flor deLiza"}	2026-03-23 06:31:30.524207+00
a76250f5-d13d-451e-9108-1e1ee7e2755b	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	06220b0d-fcb7-44e8-89e5-3e70ebd7b046	{"title": "Volunteer Management System (Edited)"}	2026-03-23 09:56:16.649019+00
af173b4a-a4d9-4907-b849-f52ef628de83	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	926cf536-f707-4871-917a-bdbd8ad8eeac	{"title": "Optimize database queries"}	2026-03-23 09:56:44.765423+00
d86cf414-dba0-4fc8-a151-74bd8ff7c417	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Add random color for labels", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 10:05:51.23835+00
b5d40996-1a3c-41bb-9159-d4d4520e146b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Add random color for labels", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:06:45.434685+00
e71d6fc4-ca7c-4dd8-9eb8-e26dd711a87c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f15453ca-130b-42d3-b0d1-e71e5a45f02e	{"to": "Review (test)", "from": "Archived", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#EF4444", "taskTitle": "Drag and drop functionality", "fromListId": "bcf1fcd7-bb93-4de9-97ad-e91692819dbb", "wasCompleted": false}	2026-03-23 10:10:57.508961+00
d94061f7-2b89-4ded-b0cb-5da0ed2b9f7e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	list	bcf1fcd7-bb93-4de9-97ad-e91692819dbb	{"title": "Archived", "tasksMigrated": false}	2026-03-23 10:11:05.296804+00
f6cb7f73-a953-4ffc-92e4-2c9e4f9cc398	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Task 2.2", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-23 10:16:07.335736+00
fb2edbd5-d35a-45a0-961f-a93be05baf98	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f4dc8763-7096-4454-a608-1386735664c0	{"to": "Done (test)", "from": "In Progress (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#3B82F6", "taskTitle": "Improve Types", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": true}	2026-03-23 10:20:25.959018+00
3807cb8d-ec90-491f-a1b1-b9c874f669b8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f4dc8763-7096-4454-a608-1386735664c0	{"to": "Review (test)", "from": "Done (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Improve Types", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-23 10:24:04.164496+00
54c2d1d5-b374-402f-9435-c242a609c44b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "Review (test)", "from": "Done (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Task 2.2", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-23 10:24:13.249661+00
a5764062-68ce-4462-bc2f-3325ec154cbd	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Add random color for labels", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 10:24:20.066801+00
e6b41e28-6f63-4bfa-bb3b-8bc2d6083046	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f15453ca-130b-42d3-b0d1-e71e5a45f02e	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Drag and drop functionality", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-23 10:24:28.312509+00
1b462e0d-eb9c-42bd-98e0-d9e54cf76999	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "Review (test)", "from": "Done (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Task 1.6", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-23 10:24:45.267272+00
50a9c0cb-173b-4ff8-942e-676defed1f78	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 2500}	2026-03-23 10:27:48.675939+00
6d21f503-99e6-41c8-8393-2332202da6e6	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Add random color for labels", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:24:50.418215+00
21f9fa6e-7ceb-4f4f-b4c5-241ce9898aac	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 2250}	2026-03-23 10:31:53.452035+00
b3fc510b-e9c3-4bb5-94b2-b092f8f5d84a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Labels Test", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:32:16.402852+00
4e26b966-a38c-456f-b218-30b41984773e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f4dc8763-7096-4454-a608-1386735664c0	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Improve Types", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:32:21.850537+00
dfcc3c8a-f9db-4269-beb4-d5fc3932a870	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f4dc8763-7096-4454-a608-1386735664c0	{"to": "Done (test)", "from": "To Do (test)!", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#64748B", "taskTitle": "Improve Types", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": true}	2026-03-23 10:32:27.575191+00
7af3ea91-cd50-4edf-ab79-fdebb6416f98	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 1000}	2026-03-23 10:32:38.889008+00
0d71c9d8-0bc5-420c-994b-6d820e868770	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Test uploadthing", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-23 10:35:10.826095+00
2d904eb0-54cc-460d-90ab-7a14402ef148	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"to": "Review (test)", "from": "Done (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Test uploadthing", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-23 10:35:16.921925+00
9070e87b-dbb7-42ee-bdb0-8c6930867c92	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "In Progress (test)", "from": "Review (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Labels Test", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 10:35:22.495073+00
836fd28e-dfb1-4873-b0aa-82fb7465ee30	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f4dc8763-7096-4454-a608-1386735664c0	{"to": "To Do (test)!", "from": "Done (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#10B981", "taskTitle": "Improve Types", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-23 10:35:26.894914+00
e720b79e-e2d1-4069-929e-c151dc90231e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1ebbd6e0-9e1b-4bde-a804-356cd254598e	{"to": "To Do (test)!", "from": "Done (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#10B981", "taskTitle": "Initialize shadcn", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-23 10:35:31.494036+00
bae87ccf-7fff-41c4-9b36-19ba62786c99	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"to": "In Progress (test)", "from": "Review (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Test uploadthing", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 10:36:07.345365+00
2cd3dd81-9ab2-4314-b554-96f369c2aa81	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Task 2.2", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:37:51.010381+00
19fbc842-ac68-4305-9f03-ba9487e24445	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "In Progress (test)", "from": "Review (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Task 2.2", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 10:37:55.942488+00
4240a438-ca57-479b-a948-ac359abc77b6	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Change list color feature", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 10:38:01.140202+00
1a3bcd47-061d-4dfd-9223-def0375e8841	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "In Progress (test)", "from": "Review (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Task 1.6", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 10:38:10.878667+00
b87536bf-4b9a-4f29-aa59-7d2363f110bb	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1ebbd6e0-9e1b-4bde-a804-356cd254598e	{"to": "Done (test)", "from": "In Progress (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#3B82F6", "taskTitle": "Initialize shadcn", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": true}	2026-03-23 10:38:20.48321+00
30924efa-9c25-4d80-8758-de842fbd2e0a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"to": "Review (test)", "from": "Done (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Test uploadthing", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-23 10:38:24.338061+00
9dd0c877-02f6-4f65-bcfb-ce8e4bd9bafb	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Add random color for labels", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:38:29.466694+00
5f096125-7771-43aa-abdc-336ae440f896	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Task 1.6", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:38:35.592325+00
0adf0693-ba96-44e3-85a0-dddbe7784ebe	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Change list color feature", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:38:43.789617+00
c47d3142-9097-49a7-b0e4-d498a6840e7e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "Review (test)", "from": "To Do (test)!", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#64748B", "taskTitle": "Change list color feature", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 10:38:49.36046+00
ea60cf61-2766-4d17-b736-aaba88a6a07b	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 1500}	2026-03-23 14:15:36.138748+00
76c74286-846a-4313-af9f-0ae720d4909e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f4dc8763-7096-4454-a608-1386735664c0	{"to": "In Progress (test)", "from": "Review (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Improve Types", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 10:32:10.737936+00
be9f94c4-1cd2-4511-b5b8-e23195dceabf	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Add random color for labels", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 10:32:32.707123+00
2f74f004-3b6b-44f2-9188-7ea0ff8d4d55	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"title": "Review (test)", "newPosition": 2625}	2026-03-23 10:32:44.924116+00
6f9c606a-83f8-4f77-b3c7-248fc8c2c799	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 68536}	2026-03-23 10:33:29.24361+00
4de7da99-16bc-4a93-a813-7e67c609de44	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 1125}	2026-03-23 10:35:53.476398+00
ed2d9492-9044-4452-9817-6551f6077221	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Change list color feature", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:35:58.595704+00
b7701432-109d-4c30-9e62-835d7eb49942	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Labels Test", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:36:12.652217+00
014750c1-1c61-4d7a-a9d1-64d8a89bf78a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Labels Test", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-23 10:36:18.437316+00
b2443e0e-31e7-4499-ad1c-6fcdb374394c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Change list color feature", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 10:36:50.374771+00
cb7e7021-69e1-44bc-ace5-b4560def452a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Test uploadthing", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:37:23.283552+00
0d03f6d8-8b63-4df8-94ee-1828537889fa	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Change list color feature", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:37:28.466576+00
5f189331-6f14-4199-ae78-078527fb04c8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Test uploadthing", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-23 10:37:36.886089+00
5f9c5df8-4195-4f01-94e4-3732043b40ae	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "In Progress (test)", "from": "Review (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Task 2.2", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 10:37:41.805213+00
33f70120-c01c-4672-8ae4-f3b3d85d0d16	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1ebbd6e0-9e1b-4bde-a804-356cd254598e	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Initialize shadcn", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 10:38:16.08452+00
33ef5c2b-c826-4239-9ab2-b5c09782c1a1	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "In Progress (test)", "from": "Review (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Change list color feature", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 10:38:54.253389+00
d99346c8-d815-4997-8518-b33dbf4f1aaf	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Task 2.2", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:38:58.755909+00
332a17b7-5b3c-4fe7-8577-b8358c566ce9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "In Progress (test)", "from": "Done (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#10B981", "taskTitle": "Labels Test", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-23 10:39:07.675913+00
ec0f3718-ee30-44f0-8ef3-d06ca0793fde	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Change list color feature", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:39:12.358058+00
27e53698-b582-42e7-ac6d-737fa69cce28	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Labels Test", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 10:39:17.575285+00
ae9ac051-94e4-41ba-9493-d389e3a2bd7b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "In Progress (test)", "from": "Review (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Task 1.6", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 10:39:22.768998+00
827d5ae9-c24c-4e04-a77f-cb8c44be4a8c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f4dc8763-7096-4454-a608-1386735664c0	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Improve Types", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 10:39:26.033008+00
ee0b5c89-40f9-488f-8abc-05b23f118af7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Task 2.2", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 10:39:31.225899+00
2a4deb2b-5ac8-407b-93a5-76f3fe955dca	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "To Do (test)!", "from": "Review (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#F59E0B", "taskTitle": "Labels Test", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 10:39:36.249708+00
77ef08b0-30b5-40ea-8950-0d58b2d9feea	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Change list color feature", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 11:00:19.602325+00
05339bcf-102c-477f-b05e-68f2b07936d2	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "In Progress (test)", "from": "Review (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Add random color for labels", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 11:00:36.184572+00
2e2163aa-13d5-4af0-ab61-f2f48803dc3b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 2438}	2026-03-23 11:00:43.393716+00
f8d078eb-1eb9-4c56-8a85-9511fc774d37	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 1125}	2026-03-23 11:00:51.931795+00
0465272a-628d-45e2-9ee5-af470626fa72	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Test uploadthing", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-23 11:00:57.645296+00
25f749a0-34f2-4c8b-a7a1-e713b82e353f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Add random color for labels", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 11:01:13.359452+00
52b2c810-4627-49d6-9de8-eaa7a5f78611	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Change list color feature", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 11:01:18.773318+00
72bc549a-a424-483e-bad7-671d56ba6827	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Labels Test", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-23 11:01:24.331391+00
02ee9cad-9a88-4d94-b47a-533194399362	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"title": "Review (test)", "newPosition": 68536}	2026-03-23 11:01:33.283412+00
2e0ee50e-7929-48a2-8999-70f9766e96d1	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"title": "Review (test)", "newPosition": 2625}	2026-03-23 11:08:42.944238+00
e26631b9-466d-440e-a1c0-24261b8f5de3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	4bb1bbe9-ec82-415d-bca3-19778041ee5c	{"to": "Done (test)", "from": "In Progress (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#3B82F6", "taskTitle": "Task 1.6", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": true}	2026-03-23 11:09:06.819334+00
58097552-fcf6-4ba3-af0d-8d60df20e3d6	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 2438}	2026-03-23 12:02:29.343993+00
02dff36d-0704-4c30-ab97-6967ed024e92	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 1125}	2026-03-23 12:02:35.986944+00
b766c74a-9f1a-476e-b363-3aeb087a9c28	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-23 14:14:47.560107+00
b4a9f0b4-74e7-4340-9d1a-70b456917e02	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-23 14:14:52.5079+00
fc8c17ac-1371-490e-9892-3c310f898dbe	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 2500}	2026-03-23 14:15:11.391677+00
a99ed35e-c56b-43a8-9df5-25aa1748c80a	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 2750}	2026-03-23 14:15:18.881191+00
cc482d32-badb-44d5-a469-db5b55196281	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-23 14:15:24.745791+00
287bf40a-2e6d-4b3c-8bf3-735bab5e11ee	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 68536}	2026-03-23 14:15:30.23111+00
7f7d084f-1f7f-4f92-a60d-e9589c2e3cc8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 563}	2026-03-23 14:15:48.818771+00
ea1036ba-3a6b-4df9-8ec2-dce551df58c5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 1875}	2026-03-23 14:16:01.676524+00
6a654ed0-239e-40e9-aa36-4c7a7d99987c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 563}	2026-03-23 14:17:46.51203+00
7d25bac9-3004-4b61-b705-aee224c05df5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 1875}	2026-03-23 14:17:53.840428+00
2dc51e7f-4f42-41e5-928a-defe441dd03b	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-23 14:18:03.663961+00
cd6e821b-9e00-47d6-bdb1-4d611db2dcf9	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 0}	2026-03-23 14:18:15.21975+00
15c97795-a056-471d-ba7b-e007a57acff6	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 0}	2026-03-23 14:18:20.54351+00
be6e98d2-4442-485e-bfd2-1cf95274ec41	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "To Do", "from": "Done", "toColor": "#64748B", "toListId": "f23b5c60-7d72-4589-927f-8062b37232df", "fromColor": "#10B981", "taskTitle": "Task Attachment", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-23 14:18:37.420282+00
ad4ae7af-079e-4a2c-87b4-0b8f33e7d46a	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"to": "Review", "from": "Done", "toColor": "#8B5CF6", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "fromColor": "#10B981", "taskTitle": "Attach documentation file", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-23 14:18:44.063181+00
d2a9af17-e368-444a-a63b-c722dc701b5f	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 0}	2026-03-23 14:18:48.700426+00
726a15c3-3152-4e02-acbf-89ca7b79bcd3	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-23 14:19:03.191076+00
034333d3-e437-456d-bdcc-667ed9c997d7	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-23 14:19:10.624551+00
365b5dad-8b3d-42d1-b5c8-27cc5a80424c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 2813}	2026-03-23 14:19:30.291515+00
b0fe8e1e-248a-4741-95ec-8c3699fd0bc2	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 1875}	2026-03-23 14:19:37.248573+00
1bc7cbfb-183c-4366-8991-4bbc6ea23ade	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "In Progress (test)", "from": "Review (test)", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Add random color for labels", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-23 14:16:11.761204+00
41b58cab-c086-4d1b-90bf-f5f6dac23b70	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-23 14:16:49.457097+00
1188ede0-cab9-43af-9d35-c6cd3e292b83	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	729790eb-c38a-4380-a271-80e88ea14d25	{"to": "In Progress", "from": "Review", "toColor": "#3B82F6", "toListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "fromColor": "#8B5CF6", "taskTitle": "Task 2.1", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": false}	2026-03-23 14:16:57.937006+00
23cce3e4-f013-42b4-a48e-c83e02d8dc21	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-23 14:17:04.6052+00
5c883466-d57e-4b76-9b4f-a2cbafa454a0	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 750}	2026-03-23 14:17:10.521206+00
6b339787-9097-49a1-90ea-0f12a7d8eab8	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 0}	2026-03-23 14:17:15.46245+00
3ee7d7c0-5367-4d03-abb5-7f48d21653f7	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 1500}	2026-03-23 14:19:16.246461+00
754a45e0-df62-4278-b4f7-b2d187bd6d31	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-23 14:50:54.005815+00
2657b5ce-e86a-4056-8e6b-cd260b51de15	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 750}	2026-03-23 14:55:00.424254+00
83967134-6803-4fdc-8690-4525d201c96e	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 0}	2026-03-23 14:56:15.484272+00
3e518a74-5bcd-4013-9bf5-a5602b1223e1	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Labels Test", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-23 14:57:14.121971+00
e1c871d1-a031-47ae-8540-c0b2e664901b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 563}	2026-03-23 15:01:20.524507+00
7a5e8bef-b06a-4d5f-a77d-7b12d11a8df2	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 1875}	2026-03-23 15:01:28.84472+00
7b838bed-90c4-455f-9704-ae160f7ba1c7	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	project	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	{"title": "Kanban Board Feature"}	2026-03-23 15:02:13.61161+00
ded7fd7d-42c0-4ef8-875f-d721d5524d45	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	b9a216a2-2f7a-4b03-9c22-0d00575426ed	{"title": "In Progress", "newPosition": 0}	2026-03-23 15:02:23.782347+00
877f790c-de18-46dd-877a-b7b8bd2fbae0	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	b9a216a2-2f7a-4b03-9c22-0d00575426ed	{"title": "In Progress", "newPosition": 0}	2026-03-23 15:02:31.35413+00
971fa5df-92db-40c9-b06f-d643096ccd9e	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	b9a216a2-2f7a-4b03-9c22-0d00575426ed	{"title": "In Progress", "newPosition": 1000}	2026-03-23 15:02:39.908308+00
f8aeed7b-374b-4a5f-be1c-13bbfa9ac565	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	305f72ef-25cb-4c10-bbd9-873cda630978	{"title": "To Do", "newPosition": 1500}	2026-03-24 00:28:11.912916+00
3dc520aa-efa9-44b7-87b0-767343cb8605	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	305f72ef-25cb-4c10-bbd9-873cda630978	{"title": "To Do", "newPosition": 500}	2026-03-24 00:28:17.926914+00
a046aeb2-1c4d-4672-b805-ffe2df17a832	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	acf263bd-0cbb-4940-8aa5-9e918c7de284	{"title": "Review", "newPosition": 750}	2026-03-24 00:28:22.862064+00
d73fafcb-2ae5-4bd2-bee8-fa4ee32077f3	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	acf263bd-0cbb-4940-8aa5-9e918c7de284	{"title": "Review", "newPosition": 2000}	2026-03-24 00:28:27.562639+00
cece221b-cf2f-4202-852d-55b3a297415b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"title": "Review (test)", "newPosition": 68536}	2026-03-24 00:28:36.710414+00
6bfe847f-2e27-4216-a9e5-74e06e79fac3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"title": "Review (test)", "newPosition": 2438}	2026-03-24 00:28:42.135388+00
cd927bd9-bd7c-46c7-82c5-ef921dc36bc3	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-24 00:28:50.632006+00
54699019-d36b-495a-abf0-e32e90365f8e	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 750}	2026-03-24 00:28:58.706131+00
36ea6d26-c7be-4a8e-a775-dc2a65b4e84c	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 0}	2026-03-24 00:29:04.417027+00
03cfb24c-4659-49d9-8e86-d5e651bb9fbf	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 0}	2026-03-24 00:29:10.487744+00
bc796624-f968-48a0-91aa-03a2c65efb0b	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 1500}	2026-03-24 00:29:17.389091+00
044cf60f-ad77-4a26-a0e1-e4a7a8e8ac72	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-24 00:29:56.079421+00
23486a18-791c-4598-ba90-72e6a6a149d9	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 750}	2026-03-24 00:30:00.991184+00
c721f4bd-311b-462e-bdca-b30a2218fa4a	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 0}	2026-03-24 00:30:06.866493+00
6b49c5f3-2cbe-4674-8e35-4d267b2dccb0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 563}	2026-03-24 00:30:16.140497+00
e3cd0de2-f135-43ad-a010-71a2513ef388	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 1782}	2026-03-24 00:30:20.849404+00
caf596f2-c371-40a2-927c-02a96c40fbfc	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"title": "Review (test)", "newPosition": 563}	2026-03-24 00:30:26.249844+00
82f8872f-06a8-4395-86a4-2ce0514678bd	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"title": "Review (test)", "newPosition": 2391}	2026-03-24 00:30:31.032308+00
5a19ac2f-b038-48ab-a55b-ddb20a1b8193	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	f4dc8763-7096-4454-a608-1386735664c0	{"dueDate": "2026-03-17T16:00:00.000Z"}	2026-03-24 01:32:14.032585+00
1082ae24-7ea8-4b82-8ab9-0dd65e827b52	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Review (test)", "from": "In Progress (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#3B82F6", "taskTitle": "Add random color for labels", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-24 01:42:36.250851+00
007b4bab-d16f-4cd3-bd83-6df039c8bdbb	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Add random color for labels", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-24 01:42:44.539557+00
d2959193-9433-443d-87a0-9b39bd1a1baa	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#8B5CF6", "taskTitle": "Attach documentation file", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-24 01:50:50.052225+00
13b56d28-e6b6-4e60-ab79-ffdd3f325485	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	commented	comment	75d913d3-7dda-427c-b36d-35a8d8a74611	{"taskId": "d3518aec-540d-4a59-927c-4f0fef081edc", "preview": "Okay", "taskTitle": "Labels Test"}	2026-03-24 02:50:35.991799+00
b9424cb1-3e81-48e2-81fc-48f57b2dec92	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": -65536}	2026-03-24 03:39:04.855277+00
c895062a-9570-4c9a-b97a-843ae742c6e4	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"title": "Labels Test", "labels": ["Label"], "dueDate": "2026-03-17T16:00:00.000Z", "priority": "medium", "startDate": null, "description": "This is a tests "}	2026-03-24 02:51:14.648886+00
b9506574-c612-41ef-be88-15104f5a713b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 563}	2026-03-24 03:03:30.957935+00
1b1d683a-8946-43e4-923e-0a12fb6f01a2	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 1758}	2026-03-24 03:03:37.138571+00
65911407-9823-4d61-90a8-900f57436d9c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 563}	2026-03-24 03:24:51.284883+00
9de1580d-0954-4916-a220-be3ba27dd3e8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 1758}	2026-03-24 03:24:57.104235+00
0a459200-0e07-4212-b04a-7a3459ce770e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 2075}	2026-03-24 03:25:02.328257+00
5a2874d0-5fd8-41ce-83cc-7631ec6c20ec	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 879}	2026-03-24 03:25:07.019332+00
52446cd4-d69e-41a3-a0ad-16a73f2638a9	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-24 03:25:28.384008+00
f7e2d1bc-d3e1-4b4b-a6e4-f25e59d485e2	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 750}	2026-03-24 03:25:34.562227+00
dab1a491-c454-4815-a454-84a34acac736	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 0}	2026-03-24 03:25:39.140724+00
a3993b57-cd66-42b0-bc43-b026602f6b19	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "In Progress", "from": "To Do", "toColor": "#3B82F6", "toListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "fromColor": "#64748B", "taskTitle": "Task Attachment", "fromListId": "f23b5c60-7d72-4589-927f-8062b37232df", "wasCompleted": false}	2026-03-24 03:25:51.190089+00
2c7ef048-3200-499a-859b-a9e8c4e2bf64	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-24 03:25:55.907812+00
e7962013-9162-4b21-a4d3-d9d377e46888	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 0}	2026-03-24 03:26:01.781054+00
045233ea-a132-4813-bf15-58f6ec9bd639	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-24 03:26:07.441113+00
a4a86573-1493-4f42-ada2-3bdb900c1ef7	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-24 03:26:16.475031+00
5ee73806-7ca2-4e62-8819-6bd7b4a92eba	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	eb14dbdb-cdc9-454e-a2f5-8d5c38638e22	{"title": "Done", "newPosition": 0}	2026-03-24 03:26:22.014002+00
10007ae3-d0e3-4bfe-af91-0ba324c35abe	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	eb14dbdb-cdc9-454e-a2f5-8d5c38638e22	{"title": "Done", "newPosition": 65536}	2026-03-24 03:26:28.181697+00
314cf88f-82c8-4ae7-83db-9c527f5200a6	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-24 03:26:33.617352+00
8e238518-4c67-4ec3-9d95-0430bbaa3f78	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-24 03:26:39.42157+00
b76b4e54-72fb-4f12-b0a6-7c0b4d79993d	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e0a68e06-5900-4451-8a87-5da5230ecc86	{"title": "Review", "newPosition": 32768}	2026-03-24 03:26:43.978892+00
286bdb78-62df-4d27-9fc3-8c4bb0e9cfb4	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	acf263bd-0cbb-4940-8aa5-9e918c7de284	{"title": "Review", "newPosition": 750}	2026-03-24 03:26:53.549014+00
297ea6ee-fc46-419a-829d-08b71bb44eb5	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	acf263bd-0cbb-4940-8aa5-9e918c7de284	{"title": "Review", "newPosition": 2000}	2026-03-24 03:26:58.566429+00
7ecff1d5-490e-4d84-9b40-52ef98bc3613	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	b9a216a2-2f7a-4b03-9c22-0d00575426ed	{"title": "In Progress", "newPosition": 250}	2026-03-24 03:27:02.614223+00
342da003-981c-41bc-9310-733a5f6b05b8	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	b9a216a2-2f7a-4b03-9c22-0d00575426ed	{"title": "In Progress", "newPosition": 1250}	2026-03-24 03:27:06.786211+00
db408ea8-20f1-4c65-8f9f-8b5c62b0e0c4	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	305f72ef-25cb-4c10-bbd9-873cda630978	{"title": "To Do", "newPosition": 1625}	2026-03-24 03:29:12.962595+00
2793af28-bc73-43de-b8f3-71b0c189702f	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	305f72ef-25cb-4c10-bbd9-873cda630978	{"title": "To Do", "newPosition": 625}	2026-03-24 03:29:21.560271+00
0f22726c-fa0b-4dd6-87dc-06b6d2858547	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	b9a216a2-2f7a-4b03-9c22-0d00575426ed	{"title": "In Progress", "newPosition": 313}	2026-03-24 03:29:26.684943+00
c6e43398-66bf-45eb-abea-764e39261ea2	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	b9a216a2-2f7a-4b03-9c22-0d00575426ed	{"title": "In Progress", "newPosition": 1313}	2026-03-24 03:29:31.385381+00
f50e0bce-28f5-4fb0-bfcd-64dca919d879	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 0}	2026-03-24 03:29:42.869343+00
a9a62b34-a338-4962-8b49-ea59745be32d	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 16384}	2026-03-24 03:29:48.225393+00
bdc71acc-77b7-470a-ac49-363959826b8d	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": 0}	2026-03-24 03:29:53.867963+00
00b68e51-440b-4f5f-9cc3-0131bb759272	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 440}	2026-03-24 03:30:05.016419+00
f0cb8479-261a-4f73-a730-9fb7cd03a95e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 1635}	2026-03-24 03:30:10.777415+00
56421992-0924-4682-99fb-00cdba5db631	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e552a873-872e-4ca1-bef3-ab02ee3b106c	{"title": "Done (test)", "newPosition": 440}	2026-03-24 03:30:15.875627+00
97b9c9b0-a100-4ae1-a19f-274ea523c6f8	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e552a873-872e-4ca1-bef3-ab02ee3b106c	{"title": "Done (test)", "newPosition": 67927}	2026-03-24 03:30:21.138535+00
9d89f950-ff79-42b8-9f8d-1d3865e52554	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": -64657}	2026-03-24 03:38:10.213129+00
366383e9-f4b3-4e1a-a939-583f26e542db	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 1635}	2026-03-24 03:38:16.030637+00
36c56640-fc47-4f03-87c4-9344a41b3e55	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "To Do (test)!", "from": "In Progress (test)", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#3B82F6", "taskTitle": "Task 2.2", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-24 03:38:30.673159+00
832385af-19d6-41cf-aec4-02232716ea22	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "In Progress (test)", "from": "To Do (test)!", "toColor": "#3B82F6", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Task 2.2", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-24 03:38:35.142599+00
ffce9076-9d4d-4274-a40c-4a50ed7359a9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Review (test)", "from": "Done (test)", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Add random color for labels", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-24 03:38:40.200427+00
34ecc43c-6a9e-47b5-9719-aad158adf821	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": -65536}	2026-03-24 03:38:50.462692+00
6680516f-165a-415b-a5b9-a2cb90ef447b	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": 16384}	2026-03-24 03:38:59.391065+00
1b4f819e-7bc4-47b9-bf65-dcb1c4b1e34c	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": -131072}	2026-03-24 03:39:13.070352+00
d2fdb1c2-3142-40be-b026-e7e729f346ed	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": -196608}	2026-03-24 03:39:17.838455+00
fa00385b-9f4f-4750-8bcf-b8525c67d9ae	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	729790eb-c38a-4380-a271-80e88ea14d25	{"to": "Done", "from": "In Progress", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#3B82F6", "taskTitle": "Task 2.1", "fromListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "wasCompleted": true}	2026-03-24 03:39:22.358708+00
30ae134f-e4be-4f15-a116-f2b062ff585e	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "Done", "from": "In Progress", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#3B82F6", "taskTitle": "Task Attachment", "fromListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "wasCompleted": true}	2026-03-24 03:39:26.875128+00
c9e0d38e-0f32-4253-a8de-8fcb986478d6	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	7b100d41-73e5-4d67-8e26-93a9ddcbb015	{"title": "Tas 2.3", "listType": "todo"}	2026-03-24 03:41:43.912201+00
52eb70b7-5d61-410e-ac2e-aa69bacdcdb9	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	7b100d41-73e5-4d67-8e26-93a9ddcbb015	{"taskTitle": "Tas 2.3", "assigneeId": "68bb7995-6f4b-4a39-ad45-5243343eecfe", "assigneeName": "Kianna Gragg"}	2026-03-24 03:41:44.36345+00
492421a1-2f53-4cf9-abf9-2216440a725d	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": -262144}	2026-03-24 03:55:49.565437+00
0cace4fb-7eb1-4d64-81fc-c82f2138b665	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": -131072}	2026-03-24 03:55:54.524733+00
5afa0a7a-0e02-49d5-aff9-7876f7e8b51c	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": -262144}	2026-03-24 04:00:08.132331+00
146a4c8b-a1a0-4c5f-a68a-8100545f8809	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	{"title": "In Progress", "newPosition": -131072}	2026-03-24 04:00:12.719516+00
d28ba62a-99d7-4743-8cb6-98457613018f	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	list	8ca48dca-b1fd-4d74-b2bd-fd7fa22217ae	{"title": "Archived"}	2026-03-24 04:00:24.327643+00
06652ef3-416a-438a-bc36-d48789975106	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "Archived", "from": "Done", "toColor": "#EC4899", "toListId": "8ca48dca-b1fd-4d74-b2bd-fd7fa22217ae", "fromColor": "#10B981", "taskTitle": "Task Attachment", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-24 04:00:48.017195+00
da0a6e86-061b-440e-be26-20c27a18a30a	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	729790eb-c38a-4380-a271-80e88ea14d25	{"to": "Archived", "from": "Done", "toColor": "#EC4899", "toListId": "8ca48dca-b1fd-4d74-b2bd-fd7fa22217ae", "fromColor": "#10B981", "taskTitle": "Task 2.1", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-24 04:00:49.248709+00
745860c0-286e-477b-8e5e-fc9bec82ceab	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"to": "Archived", "from": "Done", "toColor": "#EC4899", "toListId": "8ca48dca-b1fd-4d74-b2bd-fd7fa22217ae", "fromColor": "#10B981", "taskTitle": "Attach documentation file", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-24 04:00:50.362751+00
819f804d-075f-4e52-bc77-d353d0528186	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	729790eb-c38a-4380-a271-80e88ea14d25	{"to": "Review", "from": "Archived", "toColor": "#8B5CF6", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "fromColor": "#EC4899", "taskTitle": "Task 2.1", "fromListId": "8ca48dca-b1fd-4d74-b2bd-fd7fa22217ae", "wasCompleted": false}	2026-03-24 04:01:11.706404+00
3e1e2fc1-2624-44cc-85c4-aa876b9c34d4	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "In Progress", "from": "Archived", "toColor": "#3B82F6", "toListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "fromColor": "#EC4899", "taskTitle": "Task Attachment", "fromListId": "8ca48dca-b1fd-4d74-b2bd-fd7fa22217ae", "wasCompleted": false}	2026-03-24 04:01:16.21152+00
19f8ed5d-c85d-49c6-ae02-d52245c2fa1e	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	729790eb-c38a-4380-a271-80e88ea14d25	{"to": "In Progress", "from": "Review", "toColor": "#3B82F6", "toListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "fromColor": "#8B5CF6", "taskTitle": "Task 2.1", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": false}	2026-03-24 04:01:17.243507+00
bf2e3a35-264e-4905-a8e3-a4acfbbe41a2	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"to": "In Progress", "from": "Archived", "toColor": "#3B82F6", "toListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "fromColor": "#EC4899", "taskTitle": "Attach documentation file", "fromListId": "8ca48dca-b1fd-4d74-b2bd-fd7fa22217ae", "wasCompleted": false}	2026-03-24 04:01:18.181654+00
7396d6d7-dcae-4ab1-bce8-9d9599249366	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	list	8ca48dca-b1fd-4d74-b2bd-fd7fa22217ae	{"title": "Archived", "tasksMigrated": false}	2026-03-24 04:01:31.112513+00
a0cab968-badb-413c-9341-a7d07ef6e1a2	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "Review", "from": "In Progress", "toColor": "#8B5CF6", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "fromColor": "#3B82F6", "taskTitle": "Task Attachment", "fromListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "wasCompleted": false}	2026-03-24 04:01:35.869655+00
310689b5-b5b3-4a44-b169-86958d01f9b0	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	729790eb-c38a-4380-a271-80e88ea14d25	{"title": "Task 2.1"}	2026-03-24 04:02:00.032881+00
3160345d-4bac-4ec8-80ef-de3e1faeceb4	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	749a394d-249b-497a-8c5d-56ce35823508	{"title": "Task 1.5"}	2026-03-24 04:02:36.135456+00
dde05b5f-9a87-4b56-b4b0-d6ffe73118b0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	f6192b9e-d900-4c87-8ad3-ce681e7458f8	{"title": "Task 1.8"}	2026-03-24 04:02:39.07486+00
2bd38a80-f433-4da1-9a83-852533ead6df	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": -64657}	2026-03-24 04:18:54.444815+00
8daa5484-404f-4783-bdc4-eec601e091c9	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)", "newPosition": 1635}	2026-03-24 04:18:58.860424+00
14179120-2d42-4b4a-987c-697f2d5e83a0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"type": "in_progress", "color": "#EC4899", "title": "In Progress (test)!"}	2026-03-24 04:19:16.4558+00
c5741e2d-0722-4cdf-88a4-d5299c893c83	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"type": "todo", "color": "#F59E0B", "title": "Review (test)"}	2026-03-24 04:19:32.073805+00
2aef8a6f-78fd-4dc5-85e8-097c40e6d7b2	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"type": "review", "color": "#F59E0B", "title": "Review (test)"}	2026-03-24 04:19:41.317586+00
957c33df-6bd3-4213-8e33-f71913edf513	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"title": "Review (test)", "newPosition": 133463}	2026-03-24 04:19:50.169066+00
2ff6ce0a-4be1-42aa-87ab-32ba9636015e	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"title": "Review (test)", "newPosition": 34781}	2026-03-24 04:19:54.90517+00
91a44db2-0d18-4144-9ced-bb0c9be8c0c4	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	7b100d41-73e5-4d67-8e26-93a9ddcbb015	{"to": "In Progress", "from": "To Do", "toColor": "#3B82F6", "toListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "fromColor": "#64748B", "taskTitle": "Tas 2.3", "fromListId": "f23b5c60-7d72-4589-927f-8062b37232df", "wasCompleted": false}	2026-03-25 01:32:17.767124+00
4554eb04-31e7-4626-b345-df69c39cea80	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	2c88a52e-ba01-4ba1-8013-63fbbed299b7	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#8B5CF6", "taskTitle": "Task Attachment", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-25 04:40:40.515874+00
d5db6c01-d053-41ac-967f-77b171e43fe4	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 133463}	2026-03-25 07:43:50.015803+00
a62542a0-4df7-4de9-bf29-d0615a3a6c65	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 51354}	2026-03-25 07:43:54.269265+00
02e1faa5-3387-409c-bb98-931acc606b92	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 18208}	2026-03-25 07:43:58.877375+00
ee1ab96d-eb8f-44c5-9a01-3b74441e6169	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"title": "In Progress (test)!", "newPosition": 26495}	2026-03-25 07:44:03.239828+00
1ba8a06c-6fb6-4075-b3a6-826415f88afa	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"to": "Review", "from": "In Progress", "toColor": "#8B5CF6", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "fromColor": "#3B82F6", "taskTitle": "Attach documentation file", "fromListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "wasCompleted": false}	2026-03-25 04:40:53.733481+00
a24387a8-8cdb-4b7f-9587-455e16d43a7a	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Review", "from": "Done", "toColor": "#8B5CF6", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "fromColor": "#10B981", "taskTitle": "Task test", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-25 04:41:12.267399+00
5acc05e2-2001-4dad-9f16-75d734ca29a1	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1fba538c-74d7-4f03-a382-22702c09f44f	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#8B5CF6", "taskTitle": "Task test", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-25 04:41:19.638284+00
d9163901-eccc-492f-908e-036bc66297f0	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	project	d0f00e62-a5b7-4828-b206-9d88c819d721	{"title": "Volunteer Management System"}	2026-03-25 05:03:07.612947+00
f0343ac2-26bd-40d1-a830-076fbc9927ab	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	d0f00e62-a5b7-4828-b206-9d88c819d721	{"color": "#10B981", "title": "Volunteer Management System", "status": "active", "dueDate": "2026-06-28T16:00:00.000Z", "priority": null, "startDate": "2026-03-27T16:00:00.000Z", "visibility": "public", "description": "Development of a volunteer management system for Armed Forces of the Philippines"}	2026-03-25 06:51:49.450502+00
e60b0f05-d413-49aa-8306-ebe1fc19f68b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	invited	member	092d3ee7-5d4a-403e-99d2-50b810f435e4	{"role": "contributor", "email": "i_kiannaalexandra.gragg@stratpoint.com"}	2026-03-25 06:52:51.982986+00
08d1691a-fb19-4277-8506-ba6f092dfde7	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	7850e0e5-418c-45e0-b48b-5c561aac9fdc	{"type": "attachments_added", "count": 1, "fileNames": ["preview-2.webp"]}	2026-03-25 07:00:04.506333+00
739cbf88-01b7-4adc-a1f1-1f6404a3d242	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	7850e0e5-418c-45e0-b48b-5c561aac9fdc	{"title": "Create Wireframe", "listType": "todo"}	2026-03-25 07:00:04.547466+00
cc7722cf-9192-4877-89f4-33ae0b5bc147	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	5e78978f-14c6-430e-ae1c-40e1622a1de3	{"title": "Test Create"}	2026-03-25 07:07:11.994568+00
ac3fa413-21bd-48eb-97fc-8016aeffb53c	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	d42471fb-33f8-4841-8dc9-fb45c61c93d1	{"title": "Project 4 (Edited)"}	2026-03-25 07:12:53.375756+00
89f3e34d-f73d-408c-b230-8c51b699364f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	removed	member	5e1a2321-5fa7-4a94-b86c-9f0b52b18537	{"role": "contributor", "memberName": "Kianna Alexandra Gragg"}	2026-03-25 07:21:54.828533+00
273ddc62-7544-4ec3-8afc-b35e543bbdcc	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	project	1dd03e33-6c81-4dfc-bcda-c3ffbd7dda67	{"type": "calendar_event", "title": "Deployment"}	2026-03-25 07:27:29.238953+00
53658505-7b94-4566-85bc-18d7f224312a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	invited	member	3432dc7e-cf26-44e6-81d9-4cb6b5a25806	{"role": "contributor", "email": "i_kiannaalexandra.gragg@stratpoint.com"}	2026-03-25 07:38:45.769973+00
e8be695f-3578-441f-aa5b-49b4b77cc919	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "To Do (test)!", "from": "In Progress (test)!", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#EC4899", "taskTitle": "Task 2.2", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-25 07:40:45.813576+00
46cbe911-7e15-43a3-a380-d0ba735df3a6	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "In Progress (test)!", "from": "To Do (test)!", "toColor": "#EC4899", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Change list color feature", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-25 07:41:37.068154+00
2928639f-cacc-43ee-80c2-8e8e9fefbcfa	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "To Do (test)!", "from": "In Progress (test)!", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#EC4899", "taskTitle": "Change list color feature", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-25 07:41:44.166493+00
e559130e-aa76-4a7e-a4d3-0b271880e0ff	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "In Progress (test)!", "from": "To Do (test)!", "toColor": "#EC4899", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Task 2.2", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-25 07:41:49.629738+00
59fdd8f9-8f89-42d8-becd-6d785c8ed845	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "Review (test)", "from": "In Progress (test)!", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#EC4899", "taskTitle": "Task 2.2", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-25 07:41:55.613196+00
b9d0f384-df37-4baa-a119-5d639e10a78b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f4dc8763-7096-4454-a608-1386735664c0	{"to": "Review (test)", "from": "In Progress (test)!", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#EC4899", "taskTitle": "Improve Types", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-25 07:42:00.603+00
4912b049-eb6e-4d85-8dbb-922a9aa86154	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	1d80c066-427d-46ce-b1c1-4a77451c3551	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Add random color for labels", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-25 07:42:28.745391+00
a1ef0f3c-82a9-45fb-bfcf-bc950606cdd0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": 18208}	2026-03-25 07:43:38.631959+00
35f1b7b9-08e6-4337-be7b-5dc5f0d0d823	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	bef31450-59df-4916-9ead-6174b1f6d149	{"title": "To Do (test)!", "newPosition": -63901}	2026-03-25 07:43:43.723622+00
20589c9d-ef01-49b8-9019-a074968cf465	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	09b40f31-54b8-4c7a-a41e-7ddce1e3d51b	{"taskTitle": "Make description rich text", "assigneeId": "5e1a2321-5fa7-4a94-b86c-9f0b52b18537", "assigneeName": "Kianna Alexandra Gragg"}	2026-03-25 07:44:55.760044+00
dfbc0d94-13c3-4af4-b5bb-f1e329a32b5c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	f15453ca-130b-42d3-b0d1-e71e5a45f02e	{"title": "Drag and drop functionality"}	2026-03-25 07:46:20.664303+00
bae5bafe-b522-4340-82fe-da5eb18ef1b7	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	list	57139b6e-6755-4d56-807a-6a7268faee7a	{"title": "New List"}	2026-03-25 07:46:42.679848+00
e70e7a9c-01de-40a3-a80b-2bbaa8f8bbbb	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	57139b6e-6755-4d56-807a-6a7268faee7a	{"type": "todo", "color": "#8B5CF6", "title": "New List for on Hold"}	2026-03-25 07:48:01.250554+00
cc7e8b43-1d33-4ada-a6bc-04c89dd1b086	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	list	57139b6e-6755-4d56-807a-6a7268faee7a	{"title": "New List for on Hold", "tasksMigrated": false}	2026-03-25 07:48:23.171573+00
6cc25133-635f-4b3f-91fe-3f5e2b83b3ce	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	83a53668-058e-4fa5-8a31-8c762a61a3af	{"title": "Inline Task Creation", "listType": "in_progress"}	2026-03-25 07:49:01.782004+00
3acc84f0-ffd2-446c-81be-7d82e8c35b9c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	83a53668-058e-4fa5-8a31-8c762a61a3af	{"taskTitle": "Inline Task Creation", "assigneeId": "5e1a2321-5fa7-4a94-b86c-9f0b52b18537", "assigneeName": "Kianna Alexandra Gragg"}	2026-03-25 07:49:02.285736+00
86b0ad47-de84-459d-a389-0f6a2d0bdc61	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	83a53668-058e-4fa5-8a31-8c762a61a3af	{"taskTitle": "Inline Task Creation", "assigneeId": "68bb7995-6f4b-4a39-ad45-5243343eecfe", "assigneeName": "Kianna Gragg"}	2026-03-25 07:49:02.670635+00
2e01a32b-6e55-4a03-bf08-7b5afb4b2a45	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	83a53668-058e-4fa5-8a31-8c762a61a3af	{"type": "attachments_added", "count": 1, "fileNames": ["preview-2.webp"]}	2026-03-25 07:53:04.861212+00
e9bd981b-41c9-4ae0-84e4-a55e0e989b75	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	83a53668-058e-4fa5-8a31-8c762a61a3af	{"title": "Inline Task Creation", "labels": [], "dueDate": "2026-03-10T16:00:00.000Z", "priority": "low", "startDate": "2026-02-28T16:00:00.000Z", "description": "<p>Edited version</p>"}	2026-03-25 07:53:08.268206+00
3d21a3ea-9d86-410f-8cc8-4445adfaed1d	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"color": "#EC4899", "title": "List Management Features", "status": "active", "dueDate": "2026-03-26T16:00:00.000Z", "priority": "low", "visibility": "public", "description": "Implement list/column management functionality by Saturday"}	2026-03-25 07:54:31.829063+00
0b483a7f-00e5-4e79-9692-f1fc66a7a6b5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	archived	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Features"}	2026-03-25 07:54:53.417705+00
ac5d6041-03c9-4cca-a69d-2ef2ddea5a19	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	unarchived	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Features"}	2026-03-25 07:55:16.804255+00
d0dbcc1c-f19c-4c67-bab9-b7e6a199deeb	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#8B5CF6", "taskTitle": "Attach documentation file", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": true}	2026-03-25 07:56:12.732911+00
7b3061be-f05c-4476-b27f-f55690bcfeda	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	assigned	task	1ebbd6e0-9e1b-4bde-a804-356cd254598e	{"taskTitle": "Initialize shadcn", "assigneeId": "5e1a2321-5fa7-4a94-b86c-9f0b52b18537", "assigneeName": "Kianna Alexandra Gragg"}	2026-03-25 07:44:57.348773+00
fb9dc05c-60dd-411a-8fd0-e5c9e1dbe1df	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"to": "In Progress (test)!", "from": "Done (test)", "toColor": "#EC4899", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#10B981", "taskTitle": "Test uploadthing", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-25 07:45:48.21197+00
f2b9d7d3-d89c-44a2-b561-034f117f330f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f15453ca-130b-42d3-b0d1-e71e5a45f02e	{"to": "In Progress (test)!", "from": "Done (test)", "toColor": "#EC4899", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#10B981", "taskTitle": "Drag and drop functionality", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-03-25 07:45:49.429473+00
13348a8a-c289-4741-a498-9aa095848a10	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	978a44bc-de2f-4d54-9749-41fcf425976a	{"title": "Test uploadthing"}	2026-03-25 07:46:17.505269+00
2b711249-ced2-4f71-837f-0a01dd0aec92	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	57139b6e-6755-4d56-807a-6a7268faee7a	{"type": "custom", "color": "#8B5CF6", "title": "New List for on Hold"}	2026-03-25 07:47:28.161513+00
dba1b099-09db-4539-8f5f-046b0a482b83	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	task	53624a48-bc81-458d-8786-78f3e8d34e78	{"title": "Add", "listType": "in_progress"}	2026-03-25 07:49:32.894338+00
8595fa6b-2fea-406a-bb9b-d880adfc6555	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	task	53624a48-bc81-458d-8786-78f3e8d34e78	{"title": "Add"}	2026-03-25 07:49:43.18367+00
c1518d2c-8a82-426b-bc7c-99d88d34d3f1	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	unassigned	task	83a53668-058e-4fa5-8a31-8c762a61a3af	{"taskTitle": "Inline Task Creation", "assigneeId": "68bb7995-6f4b-4a39-ad45-5243343eecfe", "assigneeName": "Kianna Gragg"}	2026-03-25 07:51:43.047512+00
a3b3894f-2032-4db7-b300-a3fd51e897db	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	commented	comment	a558d460-f361-44e1-8aef-f613b209fd04	{"taskId": "83a53668-058e-4fa5-8a31-8c762a61a3af", "preview": "I am unassigning myself here", "taskTitle": "Inline Task Creation"}	2026-03-25 07:52:26.18112+00
f259b0b0-c55a-4f52-972f-0abae870c0dc	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	task	83a53668-058e-4fa5-8a31-8c762a61a3af	{"title": "Inline Task Creation", "labels": ["Test"], "dueDate": "2026-03-10T16:00:00.000Z", "priority": "low", "startDate": null, "description": "<p>Edited version</p>"}	2026-03-25 07:52:29.906746+00
54987fd9-547e-4667-b4b3-f8b006a27044	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Feature", "status": "completed"}	2026-03-25 07:53:22.799123+00
86fc383d-0acb-433a-bcc9-aac9ffa98dcd	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"title": "List Management Feature", "status": "active"}	2026-03-25 07:53:28.689381+00
d84e811d-376f-4223-837a-033a5642a24b	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	7b100d41-73e5-4d67-8e26-93a9ddcbb015	{"to": "Done", "from": "In Progress", "toColor": "#10B981", "toListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "fromColor": "#3B82F6", "taskTitle": "Tas 2.3", "fromListId": "5fbba8a0-d5e5-454f-aba7-107fc3ea26f0", "wasCompleted": true}	2026-03-25 07:56:17.417208+00
615522b9-39c6-4d39-a2c3-b00d0b80f2d3	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	project	7fd647a9-f60c-4b54-8051-d5387818ceaa	{"title": "Task Management Feature", "status": "completed"}	2026-03-25 07:56:23.271764+00
2fa73b93-8574-4e5d-86ed-0f2be064de39	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	7850e0e5-418c-45e0-b48b-5c561aac9fdc	{"to": "In Progress", "from": "To Do", "toColor": "#3B82F6", "toListId": "32e4a13a-dc63-482b-b449-e908f146c970", "fromColor": "#64748B", "taskTitle": "Create Wireframe", "fromListId": "15e89f5f-9187-40f7-9ff7-fe02fe65cf4d", "wasCompleted": false}	2026-03-25 12:09:42.791492+00
c7b05d7b-27ad-4ba6-9065-0f36bdd2b710	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	7850e0e5-418c-45e0-b48b-5c561aac9fdc	{"to": "Done", "from": "In Progress", "toColor": "#10B981", "toListId": "48d77f23-0da9-48b3-aa88-0ca469380859", "fromColor": "#3B82F6", "taskTitle": "Create Wireframe", "fromListId": "32e4a13a-dc63-482b-b449-e908f146c970", "wasCompleted": true}	2026-03-25 12:09:49.51942+00
1077276b-70c0-4d33-bf5c-0f0896357493	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	7850e0e5-418c-45e0-b48b-5c561aac9fdc	{"to": "Review", "from": "Done", "toColor": "#8B5CF6", "toListId": "a13507eb-6ae3-48f5-8e9e-13f6aa8e6e9f", "fromColor": "#10B981", "taskTitle": "Create Wireframe", "fromListId": "48d77f23-0da9-48b3-aa88-0ca469380859", "wasCompleted": false}	2026-03-25 12:10:10.531876+00
531daa65-cbf2-41f4-8009-6a6828da8cd5	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	deleted	project	9e1c3bbf-356e-47dc-9db1-7b9c0159f127	{"title": "Deployed Create Project Test"}	2026-03-25 12:10:59.03323+00
bc74b3ff-c94c-4c86-a3b7-3e3c939161c7	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	15e89f5f-9187-40f7-9ff7-fe02fe65cf4d	{"title": "To Do", "newPosition": 1500}	2026-03-25 12:11:43.758129+00
9f658c46-579e-46bb-833c-9c23f00a95ef	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	15e89f5f-9187-40f7-9ff7-fe02fe65cf4d	{"title": "To Do", "newPosition": -64536}	2026-03-25 12:11:52.420633+00
6872cb2e-f170-4beb-9100-5ee67583a72f	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": -98304}	2026-03-25 12:21:53.163268+00
b8228c69-87fa-4d0f-b76f-c04bba940a3a	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	f23b5c60-7d72-4589-927f-8062b37232df	{"title": "To Do", "newPosition": -196608}	2026-03-25 12:22:02.017991+00
2c7afe56-9486-4357-aebe-e10a7479ce42	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	83a53668-058e-4fa5-8a31-8c762a61a3af	{"to": "Review (test)", "from": "In Progress (test)!", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#EC4899", "taskTitle": "Inline Task Creation", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-25 12:22:18.739942+00
995dcf1e-ce9d-4298-9236-93a58632bb0d	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f4dc8763-7096-4454-a608-1386735664c0	{"to": "Done (test)", "from": "Review (test)", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Improve Types", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-25 12:22:27.41618+00
dcab1270-41b1-409e-b818-7bce0de9e616	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#64748B", "title": "To Do"}	2026-03-25 13:31:50.608398+00
bbde3760-bc70-4b20-b985-58ef5b53e141	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	bef31450-59df-4916-9ead-6174b1f6d149	{"type": "todo", "color": "#64748B", "title": "To Do"}	2026-03-25 13:31:59.065218+00
20d88420-d51f-466a-80d5-3fd143165082	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	035b432e-0e08-456f-857d-eeb22ca39c2b	{"type": "in_progress", "color": "#EC4899", "title": "In Progress"}	2026-03-25 13:32:17.437124+00
e398369a-13a9-43db-94f1-e485c74ebd95	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	fe23abba-eeac-4414-aa09-e4dbaffc49a0	{"type": "review", "color": "#F59E0B", "title": "Review"}	2026-03-25 13:32:32.399332+00
fb00bc9b-848d-48aa-b155-2e29554dc09f	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	updated	list	e552a873-872e-4ca1-bef3-ab02ee3b106c	{"type": "done", "color": "#10B981", "title": "Done"}	2026-03-25 13:32:51.641388+00
66cf8b18-9c76-4a1e-9197-392d3ed82de6	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "In Progress", "from": "To Do", "toColor": "#EC4899", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Change list color feature", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-03-25 13:37:53.658479+00
bdedac94-8713-48cf-b425-dac249f34a19	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "To Do", "from": "In Progress", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#EC4899", "taskTitle": "Change list color feature", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-03-25 13:38:15.671577+00
08a1c75c-51e8-4355-943c-21cfcf65c636	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "In Progress", "from": "Review", "toColor": "#EC4899", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#F59E0B", "taskTitle": "Labels Test", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": false}	2026-03-25 13:40:07.53238+00
6986f741-5dbc-4c70-ad90-12436acd6680	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"to": "Review", "from": "Done", "toColor": "#8B5CF6", "toListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "fromColor": "#10B981", "taskTitle": "Attach documentation file", "fromListId": "eb14dbdb-cdc9-454e-a2f5-8d5c38638e22", "wasCompleted": false}	2026-03-26 00:40:17.345712+00
f4453f08-e8ab-42a3-9596-3d06e88e5480	e6f8a610-8afa-4735-9b53-86b632a8d373	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	project	e6f8a610-8afa-4735-9b53-86b632a8d373	{"title": "Test"}	2026-03-26 01:05:22.169689+00
0bffd551-690d-47f3-a9d1-193405b3671d	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	d3518aec-540d-4a59-927c-4f0fef081edc	{"to": "Done", "from": "In Progress", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#EC4899", "taskTitle": "Labels Test", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": true}	2026-03-26 01:51:44.247908+00
46d7a425-ca47-4a4a-bd9e-f8c70846af5c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Task 2.2", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-03-26 01:51:47.847054+00
db153057-c0ad-48ac-ac4f-322d30ff3373	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	{"to": "To Do", "from": "Review", "toColor": "#64748B", "toListId": "f23b5c60-7d72-4589-927f-8062b37232df", "fromColor": "#8B5CF6", "taskTitle": "Attach documentation file", "fromListId": "e0a68e06-5900-4451-8a87-5da5230ecc86", "wasCompleted": false}	2026-03-31 07:19:07.13894+00
7d266c7a-f874-4856-93ba-172abc2a9fe2	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "In Progress", "from": "To Do", "toColor": "#EC4899", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Change list color feature", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-04-12 07:35:55.979938+00
1a42a8b6-2de9-41a4-91f0-cb997da1fcbd	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "To Do", "from": "In Progress", "toColor": "#64748B", "toListId": "bef31450-59df-4916-9ead-6174b1f6d149", "fromColor": "#EC4899", "taskTitle": "Change list color feature", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": false}	2026-04-12 07:37:23.745267+00
77df62f6-e905-4580-82a4-40598f403028	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	83a53668-058e-4fa5-8a31-8c762a61a3af	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Inline Task Creation", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-04-12 07:37:27.046069+00
0b4c0294-24be-45ca-a600-4b0f73f883d3	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "In Progress", "from": "To Do", "toColor": "#EC4899", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#64748B", "taskTitle": "Change list color feature", "fromListId": "bef31450-59df-4916-9ead-6174b1f6d149", "wasCompleted": false}	2026-04-30 03:40:47.972905+00
129d331a-fab9-4c7b-bb9a-85425e09c69a	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	847c0886-1fa5-457f-a0e9-0351e21e0fc1	{"to": "Done", "from": "In Progress", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#EC4899", "taskTitle": "Change list color feature", "fromListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "wasCompleted": true}	2026-04-30 03:40:55.406936+00
c3f9d2ce-8548-4575-8f3d-589b39e01b88	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "Review", "from": "Done", "toColor": "#F59E0B", "toListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "fromColor": "#10B981", "taskTitle": "Task 2.2", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-04-30 03:41:14.705147+00
29c2d389-b08a-40f9-806f-56ce2fd07095	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	c5c8da72-bdd3-4657-bb44-d1398ae8324e	{"to": "Done", "from": "Review", "toColor": "#10B981", "toListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "fromColor": "#F59E0B", "taskTitle": "Task 2.2", "fromListId": "fe23abba-eeac-4414-aa09-e4dbaffc49a0", "wasCompleted": true}	2026-04-30 03:41:18.217274+00
fd4bc602-ea26-40d0-9296-578a70809737	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e552a873-872e-4ca1-bef3-ab02ee3b106c	{"title": "Done", "newPosition": 30638}	2026-04-30 03:41:35.711158+00
96337123-df6f-4d91-8c9d-3d7189c16bbe	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	list	e552a873-872e-4ca1-bef3-ab02ee3b106c	{"title": "Done", "newPosition": 100317}	2026-04-30 03:41:46.638908+00
a3c400f6-1a60-437f-a9e2-ef2b7fa3f8a5	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	moved	task	83a53668-058e-4fa5-8a31-8c762a61a3af	{"to": "In Progress", "from": "Done", "toColor": "#EC4899", "toListId": "035b432e-0e08-456f-857d-eeb22ca39c2b", "fromColor": "#10B981", "taskTitle": "Inline Task Creation", "fromListId": "e552a873-872e-4ca1-bef3-ab02ee3b106c", "wasCompleted": false}	2026-04-30 03:45:53.31321+00
83696a37-1cb8-4622-94ea-d4b70996213e	d0ff59f5-5d75-421d-92aa-b4f7c1691a36	68bb7995-6f4b-4a39-ad45-5243343eecfe	created	project	d0ff59f5-5d75-421d-92aa-b4f7c1691a36	{"title": "Dockerfile"}	2026-05-02 05:29:46.384073+00
\.


--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendar_events (id, title, description, start_date, end_date, all_day, color, project_id, created_by_id, created_at, updated_at) FROM stdin;
05c9d410-3c97-4f37-9e41-4fd1427314ef	!!! Capstone Defense	\N	2026-03-25 16:00:00+00	2026-03-26 15:59:59.999+00	t	#EC4899	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-21 07:08:07.309798+00	2026-03-24 00:07:35.089+00
1dfa4274-2ce8-471c-8502-609978a54864	Kianna's Birthday	My 23rd birthday	2026-03-22 16:00:00+00	2026-03-23 15:59:59.999+00	t	#F59E0B	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-25 07:27:00.763649+00	2026-03-25 07:27:00.763649+00
bb52cf4b-0a8c-4b32-a712-9fec5d7a6b5c	Event	\N	2026-03-19 16:00:00+00	2026-03-20 15:59:59.999+00	t	#2D6EF7	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-26 01:43:53.210942+00	2026-03-26 01:43:53.210942+00
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comments (id, task_id, user_id, content, created_at, updated_at) FROM stdin;
4727ef25-8b99-449a-a49e-9dac87b05f13	09b40f31-54b8-4c7a-a41e-7ddce1e3d51b	68bb7995-6f4b-4a39-ad45-5243343eecfe	This task is done !	2026-03-19 01:52:35.901983+00	2026-03-19 01:52:35.901983+00
337ef324-2385-4ea1-8f6b-226c149a9397	09b40f31-54b8-4c7a-a41e-7ddce1e3d51b	68bb7995-6f4b-4a39-ad45-5243343eecfe	?	2026-03-19 02:27:09.333151+00	2026-03-19 02:27:09.333151+00
00275e12-bd26-42cd-a7f1-5984b313a3de	c5c8da72-bdd3-4657-bb44-d1398ae8324e	68bb7995-6f4b-4a39-ad45-5243343eecfe	This is a comment	2026-03-19 10:03:44.697589+00	2026-03-19 10:03:44.697589+00
ccbbd732-a07e-40c7-bb0a-9b6aed0725c4	2c88a52e-ba01-4ba1-8013-63fbbed299b7	68bb7995-6f4b-4a39-ad45-5243343eecfe	Where can I view the attachments?	2026-03-19 21:39:06.880781+00	2026-03-19 21:39:06.880781+00
75d913d3-7dda-427c-b36d-35a8d8a74611	d3518aec-540d-4a59-927c-4f0fef081edc	68bb7995-6f4b-4a39-ad45-5243343eecfe	Okay	2026-03-24 02:50:35.92279+00	2026-03-24 02:50:35.92279+00
a558d460-f361-44e1-8aef-f613b209fd04	83a53668-058e-4fa5-8a31-8c762a61a3af	68bb7995-6f4b-4a39-ad45-5243343eecfe	I am unassigning myself here	2026-03-25 07:52:26.138273+00	2026-03-25 07:52:26.138273+00
\.


--
-- Data for Name: labels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.labels (id, project_id, name, color, created_at) FROM stdin;
a13b88cf-6ba0-4ee0-b528-eb7cbc386c18	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Label	#6B7280	2026-03-18 07:20:42.007346+00
2beb65b1-30b5-4abc-be9c-4c3ffd4f5124	d0f00e62-a5b7-4828-b206-9d88c819d721	Planning	#6B7280	2026-03-25 07:00:04.3671+00
d06e05a7-2fac-4cfd-81aa-d4d47ba53b84	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Test	#6B7280	2026-03-25 07:52:29.828815+00
\.


--
-- Data for Name: lists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lists (id, project_id, title, color, "position", created_by_id, created_at, updated_at, type, is_system) FROM stdin;
2c3baa62-ec84-4d72-aeef-d8ae60f25400	e6f8a610-8afa-4735-9b53-86b632a8d373	To Do	#64748B	0	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-26 01:05:21.940601+00	2026-03-26 01:05:21.940601+00	todo	t
d2a676c1-e081-4d38-ae96-79363a467eee	e6f8a610-8afa-4735-9b53-86b632a8d373	In Progress	#3B82F6	1000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-26 01:05:21.940601+00	2026-03-26 01:05:21.940601+00	in_progress	t
e3bda632-4ec5-4ff0-884d-b5572a76c84f	e6f8a610-8afa-4735-9b53-86b632a8d373	Review	#8B5CF6	2000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-26 01:05:21.940601+00	2026-03-26 01:05:21.940601+00	review	t
546f4fe6-b3c5-4648-bbde-01fd0da52e14	e6f8a610-8afa-4735-9b53-86b632a8d373	Done	#10B981	3000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-26 01:05:21.940601+00	2026-03-26 01:05:21.940601+00	done	t
e552a873-872e-4ca1-bef3-ab02ee3b106c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Done	#10B981	100317	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-15 14:04:45.451326+00	2026-04-30 03:41:46.294+00	done	t
dc394f81-add5-4223-8da1-13bab8b61d44	d0ff59f5-5d75-421d-92aa-b4f7c1691a36	To Do	#64748B	0	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-05-02 05:29:46.316616+00	2026-05-02 05:29:46.316616+00	todo	t
fc7b6ec5-7be4-43d5-b3ed-764dceea4300	d0ff59f5-5d75-421d-92aa-b4f7c1691a36	In Progress	#3B82F6	1000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-05-02 05:29:46.316616+00	2026-05-02 05:29:46.316616+00	in_progress	t
90445e88-b493-49b9-86ac-7c15e4966d80	d0ff59f5-5d75-421d-92aa-b4f7c1691a36	Review	#8B5CF6	2000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-05-02 05:29:46.316616+00	2026-05-02 05:29:46.316616+00	review	t
0df47e5e-b6c3-4b68-ab85-e0bae8ec68a2	d0ff59f5-5d75-421d-92aa-b4f7c1691a36	Done	#10B981	3000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-05-02 05:29:46.316616+00	2026-05-02 05:29:46.316616+00	done	t
5fbba8a0-d5e5-454f-aba7-107fc3ea26f0	7fd647a9-f60c-4b54-8051-d5387818ceaa	In Progress	#3B82F6	-131072	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-16 06:10:55.581227+00	2026-03-24 04:00:12.547+00	in_progress	t
32e4a13a-dc63-482b-b449-e908f146c970	d0f00e62-a5b7-4828-b206-9d88c819d721	In Progress	#3B82F6	1000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-25 05:03:07.547603+00	2026-03-25 05:03:07.547603+00	in_progress	t
a13507eb-6ae3-48f5-8e9e-13f6aa8e6e9f	d0f00e62-a5b7-4828-b206-9d88c819d721	Review	#8B5CF6	2000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-25 05:03:07.547603+00	2026-03-25 05:03:07.547603+00	review	t
48d77f23-0da9-48b3-aa88-0ca469380859	d0f00e62-a5b7-4828-b206-9d88c819d721	Done	#10B981	3000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-25 05:03:07.547603+00	2026-03-25 05:03:07.547603+00	done	t
a8337500-96df-4563-b521-ff4c9e627973	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	Done	#10B981	3000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-23 15:02:13.54961+00	2026-03-23 15:02:13.54961+00	done	t
15e89f5f-9187-40f7-9ff7-fe02fe65cf4d	d0f00e62-a5b7-4828-b206-9d88c819d721	To Do	#64748B	-64536	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-25 05:03:07.547603+00	2026-03-25 12:11:52.085+00	todo	t
f23b5c60-7d72-4589-927f-8062b37232df	7fd647a9-f60c-4b54-8051-d5387818ceaa	To Do	#64748B	-196608	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-16 06:10:55.581227+00	2026-03-25 12:22:01.68+00	todo	t
035b432e-0e08-456f-857d-eeb22ca39c2b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	In Progress	#EC4899	26495	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-15 14:04:45.451326+00	2026-03-25 13:32:17.094+00	in_progress	t
bef31450-59df-4916-9ead-6174b1f6d149	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	To Do	#64748B	18208	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-15 14:04:45.451326+00	2026-03-25 13:31:58.728+00	todo	t
fe23abba-eeac-4414-aa09-e4dbaffc49a0	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Review	#F59E0B	34781	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-15 14:04:45.451326+00	2026-03-25 13:32:32.06+00	review	t
b9a216a2-2f7a-4b03-9c22-0d00575426ed	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	In Progress	#3B82F6	1313	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-23 15:02:13.54961+00	2026-03-24 03:29:31.205+00	in_progress	t
eb14dbdb-cdc9-454e-a2f5-8d5c38638e22	7fd647a9-f60c-4b54-8051-d5387818ceaa	Done	#10B981	65536	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-16 06:10:55.581227+00	2026-03-24 03:26:28.017+00	done	t
acf263bd-0cbb-4940-8aa5-9e918c7de284	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	Review	#8B5CF6	2000	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-23 15:02:13.54961+00	2026-03-24 03:26:58.404+00	review	t
305f72ef-25cb-4c10-bbd9-873cda630978	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	To Do	#64748B	625	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-23 15:02:13.54961+00	2026-03-24 03:29:21.382+00	todo	t
e0a68e06-5900-4451-8a87-5da5230ecc86	7fd647a9-f60c-4b54-8051-d5387818ceaa	Review	#8B5CF6	-65536	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-16 06:10:55.581227+00	2026-03-24 03:39:04.672+00	review	t
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, message, is_read, action_url, metadata, created_at) FROM stdin;
f5889c77-0ae0-49ae-8d40-5017482efa88	68bb7995-6f4b-4a39-ad45-5243343eecfe	invitation	Invitation Accepted	Flor deLiza accepted your invitation to "List Management Feature".	t	/projects/f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"projectId": "f0a3f96f-0a13-4bc7-aff1-8745257d90f1", "acceptedByUserId": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9"}	2026-03-20 03:16:27.840601+00
c2823a8c-7f4b-4724-91c7-f6d460d80ecb	68bb7995-6f4b-4a39-ad45-5243343eecfe	task_assigned	Task Assigned	Flor deLiza assigned you to "Improve Types" in List Management Feature.	t	/projects/f0a3f96f-0a13-4bc7-aff1-8745257d90f1?taskId=f4dc8763-7096-4454-a608-1386735664c0	{"taskId": "f4dc8763-7096-4454-a608-1386735664c0", "projectId": "f0a3f96f-0a13-4bc7-aff1-8745257d90f1", "assignedBy": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9"}	2026-03-20 21:56:37.618702+00
343d5ceb-00e1-409c-9c99-b7bea2d803fa	68bb7995-6f4b-4a39-ad45-5243343eecfe	task_assigned	Task Unassigned	Flor deLiza removed you from "Improve Types" in List Management Feature.	t	/projects/f0a3f96f-0a13-4bc7-aff1-8745257d90f1?taskId=f4dc8763-7096-4454-a608-1386735664c0	{"taskId": "f4dc8763-7096-4454-a608-1386735664c0", "projectId": "f0a3f96f-0a13-4bc7-aff1-8745257d90f1", "removedBy": "cb6e7ed1-2c62-411a-9647-ffbd81b0afc9"}	2026-03-20 21:56:43.337888+00
b4424f71-3f61-4502-8c67-a938003f3bb8	68bb7995-6f4b-4a39-ad45-5243343eecfe	invitation	Invitation Declined	Kianna Alexandra Gragg declined your invitation to "Volunteer Management System".	t	/projects/d0f00e62-a5b7-4828-b206-9d88c819d721	{"projectId": "d0f00e62-a5b7-4828-b206-9d88c819d721", "declinedByUserId": "5e1a2321-5fa7-4a94-b86c-9f0b52b18537"}	2026-03-25 05:09:35.456275+00
28852a85-a711-4a24-9117-88f304266aaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	invitation	Invitation Accepted	Kianna Alexandra Gragg accepted your invitation to "List Management Feature".	t	/projects/f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"projectId": "f0a3f96f-0a13-4bc7-aff1-8745257d90f1", "acceptedByUserId": "5e1a2321-5fa7-4a94-b86c-9f0b52b18537"}	2026-03-25 07:17:49.712994+00
c179fb0a-b628-4f62-9de2-ae1f7ee6a9c7	68bb7995-6f4b-4a39-ad45-5243343eecfe	invitation	Invitation Accepted	Kianna Alexandra Gragg accepted your invitation to "List Management Feature".	f	/projects/f0a3f96f-0a13-4bc7-aff1-8745257d90f1	{"projectId": "f0a3f96f-0a13-4bc7-aff1-8745257d90f1", "acceptedByUserId": "5e1a2321-5fa7-4a94-b86c-9f0b52b18537"}	2026-03-25 07:40:11.949853+00
\.


--
-- Data for Name: project_invitations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_invitations (id, project_id, invited_by_user_id, email, role, status, token, expires_at, created_at) FROM stdin;
10d82719-0dcf-47a3-97c8-425d092c657b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	flordeliza112370@gmail.com	contributor	accepted	db19d728-1df2-4afd-a902-4e645ab63e28	2026-03-27 03:08:03.679+00	2026-03-20 03:08:03.801149+00
349d769c-9835-454f-9970-8cd3c7d70165	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	i_kiannaalexandra.gragg@stratpoint.com	contributor	declined	0c5ecb38-b013-49ee-b9de-93e07accde06	2026-04-01 05:03:07.584+00	2026-03-25 05:03:07.67385+00
092d3ee7-5d4a-403e-99d2-50b810f435e4	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	i_kiannaalexandra.gragg@stratpoint.com	contributor	accepted	bb6d8321-be7f-43f7-b6e9-fb2af93851a2	2026-04-01 06:52:51.607+00	2026-03-25 06:52:51.724151+00
3432dc7e-cf26-44e6-81d9-4cb6b5a25806	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	i_kiannaalexandra.gragg@stratpoint.com	contributor	accepted	0c7da226-d5a2-4802-afd7-339712f17b61	2026-04-01 07:38:45.421+00	2026-03-25 07:38:45.530273+00
\.


--
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_members (id, project_id, user_id, role, is_pinned, joined_at) FROM stdin;
1d6ab0f0-aedb-449c-b958-9cdcb12f8a15	7fd647a9-f60c-4b54-8051-d5387818ceaa	68bb7995-6f4b-4a39-ad45-5243343eecfe	admin	f	2026-03-16 06:10:55.524265+00
e80ed93e-e851-4df4-b948-64d6c4c0fa8d	f0ca63d7-acf0-43b3-a7ac-119d020a84f0	68bb7995-6f4b-4a39-ad45-5243343eecfe	admin	f	2026-03-23 15:02:13.38639+00
b7d2e0f0-e516-4e7f-a250-0cc4e3760d41	d0f00e62-a5b7-4828-b206-9d88c819d721	68bb7995-6f4b-4a39-ad45-5243343eecfe	admin	f	2026-03-25 05:03:07.448388+00
d7e5a1cf-c440-4646-b13c-dc3e60319fea	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	68bb7995-6f4b-4a39-ad45-5243343eecfe	admin	f	2026-03-15 14:04:45.35919+00
ee14eda9-14cb-4b35-8722-e8adecbdcac7	e6f8a610-8afa-4735-9b53-86b632a8d373	68bb7995-6f4b-4a39-ad45-5243343eecfe	admin	f	2026-03-26 01:05:21.71209+00
d71870a9-60ae-4ca2-827d-43b12df17607	d0ff59f5-5d75-421d-92aa-b4f7c1691a36	68bb7995-6f4b-4a39-ad45-5243343eecfe	admin	f	2026-05-02 05:29:46.255236+00
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, title, description, color, status, priority, start_date, due_date, is_archived, created_by_id, created_at, updated_at, visibility) FROM stdin;
d0f00e62-a5b7-4828-b206-9d88c819d721	Volunteer Management System	Development of a volunteer management system for Armed Forces of the Philippines	#10B981	active	\N	2026-03-27 16:00:00+00	2026-06-28 16:00:00+00	f	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-25 05:03:07.253149+00	2026-03-25 12:11:52.536+00	public
f0a3f96f-0a13-4bc7-aff1-8745257d90f1	List Management Features	Implement list/column management functionality by Saturday	#EC4899	active	low	\N	2026-03-26 16:00:00+00	f	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-15 14:04:45.238629+00	2026-04-30 03:45:53.421+00	public
d0ff59f5-5d75-421d-92aa-b4f7c1691a36	Dockerfile	Create a Dockerfile for the Kanban-style Project Management Web Application Tool	#2D6EF7	active	high	2026-04-27 16:00:00+00	2026-05-05 16:00:00+00	f	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-05-02 05:29:46.192374+00	2026-05-02 05:29:46.192374+00	private
e6f8a610-8afa-4735-9b53-86b632a8d373	Test		#2D6EF7	active	\N	\N	\N	f	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-26 01:05:21.484851+00	2026-03-26 01:05:21.484851+00	private
f0ca63d7-acf0-43b3-a7ac-119d020a84f0	Kanban Board Feature	Implement Drag and Drop functionality 	#2D6EF7	active	high	\N	2026-03-23 16:00:00+00	f	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-23 15:02:13.233137+00	2026-03-24 03:29:31.312+00	private
7fd647a9-f60c-4b54-8051-d5387818ceaa	Task Management Feature		#EF4444	completed	medium	2026-03-19 16:00:00+00	2026-03-20 16:00:00+00	f	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-16 06:10:55.38244+00	2026-03-31 07:19:07.261+00	private
\.


--
-- Data for Name: task_assignees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_assignees (task_id, user_id, assigned_at) FROM stdin;
d3518aec-540d-4a59-927c-4f0fef081edc	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-20 13:33:18.287752+00
7b100d41-73e5-4d67-8e26-93a9ddcbb015	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-24 03:41:44.263207+00
\.


--
-- Data for Name: task_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_attachments (id, task_id, uploaded_by_id, name, url, size, type, created_at) FROM stdin;
b182ba26-b0cd-4e89-bc9b-19bbfb3e8e90	2c88a52e-ba01-4ba1-8013-63fbbed299b7	68bb7995-6f4b-4a39-ad45-5243343eecfe	Sample Document.pdf	https://uecvvljc6l.ufs.sh/f/RrNe25XNj9iIAaFLDTqjGVO1tEfsZFHgCeovp8KucY4DRy9Q	14376	application/pdf	2026-03-19 21:30:04.385521+00
46f4b7f8-ad64-4b71-8888-ffffe25addd8	f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	68bb7995-6f4b-4a39-ad45-5243343eecfe	NBI-CLEARANCE.pdf	https://uecvvljc6l.ufs.sh/f/RrNe25XNj9iIJj0ESqVzNiv9eJdV83ycOwolBI0EHKLf7mrR	28773	application/pdf	2026-03-19 22:05:52.721814+00
f6e3e3a5-5b47-4b13-b2c9-42645de0362e	7850e0e5-418c-45e0-b48b-5c561aac9fdc	68bb7995-6f4b-4a39-ad45-5243343eecfe	preview-2.webp	https://uecvvljc6l.ufs.sh/f/RrNe25XNj9iI7GobAWIRJcdGbamxi92AUrzMIWKsPwBEHoSX	9016	image/webp	2026-03-25 07:00:04.457148+00
231edbac-4fbb-4882-9108-c8ea8d011004	83a53668-058e-4fa5-8a31-8c762a61a3af	68bb7995-6f4b-4a39-ad45-5243343eecfe	preview-2.webp	https://uecvvljc6l.ufs.sh/f/RrNe25XNj9iIRlbT5tXNj9iIvJqASdPoe2UVrw5uZCybsFmz	9016	image/webp	2026-03-25 07:53:04.819748+00
\.


--
-- Data for Name: task_labels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_labels (task_id, label_id, assigned_at) FROM stdin;
09b40f31-54b8-4c7a-a41e-7ddce1e3d51b	a13b88cf-6ba0-4ee0-b528-eb7cbc386c18	2026-03-18 10:54:38.560866+00
d3518aec-540d-4a59-927c-4f0fef081edc	a13b88cf-6ba0-4ee0-b528-eb7cbc386c18	2026-03-24 02:51:14.596421+00
7850e0e5-418c-45e0-b48b-5c561aac9fdc	2beb65b1-30b5-4abc-be9c-4c3ffd4f5124	2026-03-25 07:00:04.411594+00
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, list_id, project_id, title, description, priority, "position", is_completed, completed_at, start_date, due_date, created_by_id, created_at, updated_at, version) FROM stdin;
09b40f31-54b8-4c7a-a41e-7ddce1e3d51b	e552a873-872e-4ca1-bef3-ab02ee3b106c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Make description rich text	<p>Normal <strong>Bold </strong><em>Italic</em> <s>Strike </s></p><ul><li><p>1</p></li><li><p>2</p></li></ul><p></p>	low	704	t	2026-03-25 07:41:07.592+00	\N	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-18 10:54:38.403897+00	2026-03-25 07:41:07.592+00	5
1d80c066-427d-46ce-b1c1-4a77451c3551	e552a873-872e-4ca1-bef3-ab02ee3b106c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Add random color for labels	Replace the hardcoded color with a small utility that generates clean, visually balanced colors.	\N	-65472	t	2026-03-25 07:42:28.513+00	\N	2026-03-30 16:00:00+00	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-18 07:20:41.898038+00	2026-03-25 07:42:28.514+00	22
4bb1bbe9-ec82-415d-bca3-19778041ee5c	e552a873-872e-4ca1-bef3-ab02ee3b106c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Task 1.6	Task description	\N	64	t	2026-03-23 11:09:06.637+00	2026-03-15 16:00:00+00	2026-03-23 16:00:00+00	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-16 02:47:59.788424+00	2026-03-23 11:09:06.637+00	54
7b100d41-73e5-4d67-8e26-93a9ddcbb015	eb14dbdb-cdc9-454e-a2f5-8d5c38638e22	7fd647a9-f60c-4b54-8051-d5387818ceaa	Tas 2.3	\N	\N	16384	t	2026-03-25 07:56:17.226+00	\N	2026-04-02 16:00:00+00	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-24 03:41:43.862403+00	2026-03-25 07:56:17.226+00	3
7850e0e5-418c-45e0-b48b-5c561aac9fdc	a13507eb-6ae3-48f5-8e9e-13f6aa8e6e9f	d0f00e62-a5b7-4828-b206-9d88c819d721	Create Wireframe	<p>Create a wireframe in Figma</p>	medium	65536	f	\N	2026-03-24 16:00:00+00	2026-03-30 16:00:00+00	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-25 07:00:04.188717+00	2026-03-25 12:10:09.978+00	4
f4dc8763-7096-4454-a608-1386735664c0	e552a873-872e-4ca1-bef3-ab02ee3b106c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Improve Types		high	-131008	t	2026-03-25 12:22:26.874+00	\N	2026-03-17 16:00:00+00	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-19 10:04:51.766104+00	2026-03-25 12:22:26.874+00	14
d3518aec-540d-4a59-927c-4f0fef081edc	e552a873-872e-4ca1-bef3-ab02ee3b106c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Labels Test	This is a tests 	medium	66240	t	2026-03-26 01:51:43.684+00	\N	2026-03-17 16:00:00+00	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-18 08:03:09.205219+00	2026-03-26 01:51:43.685+00	22
f5b5ac3d-ad29-40ac-b0d5-212c0fe9b0f2	f23b5c60-7d72-4589-927f-8062b37232df	7fd647a9-f60c-4b54-8051-d5387818ceaa	Attach documentation file	\N	\N	65536	f	\N	\N	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-19 22:05:52.66343+00	2026-03-31 07:19:06.565+00	10
847c0886-1fa5-457f-a0e9-0351e21e0fc1	e552a873-872e-4ca1-bef3-ab02ee3b106c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Change list color feature		low	-180160	t	2026-04-30 03:41:07.142+00	\N	2026-03-19 16:00:00+00	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-18 13:16:24.162782+00	2026-04-30 03:41:07.142+00	40
c5c8da72-bdd3-4657-bb44-d1398ae8324e	e552a873-872e-4ca1-bef3-ab02ee3b106c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Task 2.2		medium	-245696	t	2026-04-30 03:41:17.633+00	\N	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-18 13:11:23.737697+00	2026-04-30 03:41:17.633+00	29
83a53668-058e-4fa5-8a31-8c762a61a3af	035b432e-0e08-456f-857d-eeb22ca39c2b	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Inline Task Creation	<p>Edited version</p>	low	65536	f	\N	2026-02-28 16:00:00+00	2026-03-10 16:00:00+00	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-25 07:49:01.744758+00	2026-04-30 03:45:52.767+00	5
2c88a52e-ba01-4ba1-8013-63fbbed299b7	eb14dbdb-cdc9-454e-a2f5-8d5c38638e22	7fd647a9-f60c-4b54-8051-d5387818ceaa	Task Attachment	<p>Implement adding attachments in a task using UploadThing</p>	\N	49152	t	2026-03-25 04:40:40.327+00	\N	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-19 21:28:45.741953+00	2026-03-25 04:40:40.329+00	12
6a4e64be-597b-4bf5-af59-da6787755e0e	eb14dbdb-cdc9-454e-a2f5-8d5c38638e22	7fd647a9-f60c-4b54-8051-d5387818ceaa	Build task comment	\N	\N	65536	t	2026-03-19 05:13:30.508+00	\N	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-17 12:30:11.637023+00	2026-03-19 05:13:30.51+00	14
1fba538c-74d7-4f03-a382-22702c09f44f	eb14dbdb-cdc9-454e-a2f5-8d5c38638e22	7fd647a9-f60c-4b54-8051-d5387818ceaa	Task test	\N	\N	-16384	t	2026-03-25 04:41:19.413+00	\N	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-17 06:06:18.093925+00	2026-03-25 04:41:19.413+00	15
1ebbd6e0-9e1b-4bde-a804-356cd254598e	e552a873-872e-4ca1-bef3-ab02ee3b106c	f0a3f96f-0a13-4bc7-aff1-8745257d90f1	Initialize shadcn	\N	\N	128	t	2026-03-23 10:38:20.315+00	\N	\N	68bb7995-6f4b-4a39-ad45-5243343eecfe	2026-03-18 06:27:31.059386+00	2026-03-23 10:38:20.315+00	13
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, clerk_id, email, first_name, last_name, image_url, role, created_at, updated_at, preferences) FROM stdin;
68bb7995-6f4b-4a39-ad45-5243343eecfe	user_3Aed9qdIpyNt4xf4fLuas2dpXxU	k.alexandra.gragg@gmail.com	Annika	Gragg	https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18zQWJpOXk3WnY5c2RBOUJQR1V0WVBEWm9jcUciLCJyaWQiOiJ1c2VyXzNBZWQ5cWRJcHlOdDR4ZjRmTHVhczJkcFh4VSIsImluaXRpYWxzIjoiQUcifQ	Scrum Master	2026-03-08 08:00:22.75225+00	2026-03-25 12:13:50.577+00	{"appearance": {"theme": "light", "language": "en"}, "notifications": {"memberJoined": true, "taskAssigned": false, "taskCommented": true, "taskCompleted": true, "projectUpdated": true, "invitationReceived": true}}
138848a3-8c5a-4c3b-99d8-d5d1735ea99b	user_3BSb3cKxPmeoOhtQdyo3ClfhJro	i_kiannaalexandra.gragg@stratpoint.com	Kianna Alexandra	Gragg	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zQlNiM2I5eXpQeU9UTVpUVXUxd2tOS1VZbDgifQ	Developer	2026-03-26 00:33:41.68581+00	2026-03-26 00:34:32.429+00	{"appearance": {"theme": "system", "language": "en"}, "notifications": {"memberJoined": true, "taskAssigned": true, "taskCommented": true, "taskCompleted": true, "projectUpdated": true, "invitationReceived": true}}
5067dcf9-4896-4c99-b9f6-d4e065f59c4b	user_3BSjGi6r3k4lnjXekNB5iE3WIS6	flordeliza112370@gmail.com	Flor	deLiza	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zQlNqR2dpMXBzcTJjNUdrWGw4Z2Q2enJqREwifQ	Developer	2026-03-26 01:41:14.42017+00	2026-03-26 01:41:50.472+00	{"appearance": {"theme": "system", "language": "en"}, "notifications": {"memberJoined": true, "taskAssigned": true, "taskCommented": true, "taskCompleted": true, "projectUpdated": true, "invitationReceived": true}}
6a55d296-9cef-43f9-b678-c0187f53d79d	user_3BQ0wSjaCjodu8liv2XPmMDQQVX	testuser+clerk_test@example.com	Test	User	https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18zQWJpOXk3WnY5c2RBOUJQR1V0WVBEWm9jcUciLCJyaWQiOiJ1c2VyXzNCUTB3U2phQ2pvZHU4bGl2MlhQbU1EUVFWWCIsImluaXRpYWxzIjoiVFUifQ	\N	2026-03-26 04:56:07.22185+00	2026-03-26 04:56:07.22185+00	{"appearance": {"theme": "system", "language": "en"}, "notifications": {"memberJoined": true, "taskAssigned": true, "taskCommented": true, "taskCompleted": true, "projectUpdated": true, "invitationReceived": true}}
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: labels labels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.labels
    ADD CONSTRAINT labels_pkey PRIMARY KEY (id);


--
-- Name: lists lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: project_invitations project_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_invitations
    ADD CONSTRAINT project_invitations_pkey PRIMARY KEY (id);


--
-- Name: project_invitations project_invitations_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_invitations
    ADD CONSTRAINT project_invitations_token_unique UNIQUE (token);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: task_attachments task_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_clerk_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_clerk_id_unique UNIQUE (clerk_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: activity_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_action_idx ON public.activity_logs USING btree (action);


--
-- Name: activity_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_created_at_idx ON public.activity_logs USING btree (created_at);


--
-- Name: activity_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_project_idx ON public.activity_logs USING btree (project_id);


--
-- Name: activity_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_user_idx ON public.activity_logs USING btree (user_id);


--
-- Name: calendar_events_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calendar_events_created_by_idx ON public.calendar_events USING btree (created_by_id);


--
-- Name: calendar_events_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calendar_events_date_idx ON public.calendar_events USING btree (start_date, end_date);


--
-- Name: calendar_events_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calendar_events_project_idx ON public.calendar_events USING btree (project_id);


--
-- Name: comments_task_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_task_idx ON public.comments USING btree (task_id);


--
-- Name: comments_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_user_idx ON public.comments USING btree (user_id);


--
-- Name: invitations_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_email_idx ON public.project_invitations USING btree (email);


--
-- Name: invitations_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_project_idx ON public.project_invitations USING btree (project_id);


--
-- Name: invitations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_status_idx ON public.project_invitations USING btree (status);


--
-- Name: invitations_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_token_idx ON public.project_invitations USING btree (token);


--
-- Name: labels_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX labels_project_idx ON public.labels USING btree (project_id);


--
-- Name: labels_project_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX labels_project_name_idx ON public.labels USING btree (project_id, name);


--
-- Name: lists_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lists_position_idx ON public.lists USING btree (project_id, "position");


--
-- Name: lists_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lists_project_idx ON public.lists USING btree (project_id);


--
-- Name: notifications_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_created_at_idx ON public.notifications USING btree (created_at);


--
-- Name: notifications_read_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_read_idx ON public.notifications USING btree (user_id, is_read);


--
-- Name: notifications_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_idx ON public.notifications USING btree (user_id);


--
-- Name: project_members_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_members_project_idx ON public.project_members USING btree (project_id);


--
-- Name: project_members_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_members_unique_idx ON public.project_members USING btree (project_id, user_id);


--
-- Name: project_members_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_members_user_idx ON public.project_members USING btree (user_id);


--
-- Name: projects_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_created_by_idx ON public.projects USING btree (created_by_id);


--
-- Name: projects_due_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_due_date_idx ON public.projects USING btree (due_date);


--
-- Name: projects_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_status_idx ON public.projects USING btree (status);


--
-- Name: task_assignees_task_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_assignees_task_idx ON public.task_assignees USING btree (task_id);


--
-- Name: task_assignees_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX task_assignees_unique_idx ON public.task_assignees USING btree (task_id, user_id);


--
-- Name: task_assignees_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_assignees_user_idx ON public.task_assignees USING btree (user_id);


--
-- Name: task_attachments_task_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_attachments_task_idx ON public.task_attachments USING btree (task_id);


--
-- Name: task_attachments_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_attachments_user_idx ON public.task_attachments USING btree (uploaded_by_id);


--
-- Name: task_labels_label_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_labels_label_idx ON public.task_labels USING btree (label_id);


--
-- Name: task_labels_task_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_labels_task_idx ON public.task_labels USING btree (task_id);


--
-- Name: task_labels_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX task_labels_unique_idx ON public.task_labels USING btree (task_id, label_id);


--
-- Name: tasks_completed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_completed_idx ON public.tasks USING btree (project_id, is_completed);


--
-- Name: tasks_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_created_by_idx ON public.tasks USING btree (created_by_id);


--
-- Name: tasks_due_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_due_date_idx ON public.tasks USING btree (due_date);


--
-- Name: tasks_list_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_list_idx ON public.tasks USING btree (list_id);


--
-- Name: tasks_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_position_idx ON public.tasks USING btree (list_id, "position");


--
-- Name: tasks_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_project_idx ON public.tasks USING btree (project_id);


--
-- Name: users_clerk_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_clerk_id_idx ON public.users USING btree (clerk_id);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: activity_logs activity_logs_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: calendar_events calendar_events_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: calendar_events calendar_events_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: comments comments_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: labels labels_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.labels
    ADD CONSTRAINT labels_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: lists lists_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lists lists_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_invitations project_invitations_invited_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_invitations
    ADD CONSTRAINT project_invitations_invited_by_user_id_users_id_fk FOREIGN KEY (invited_by_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_invitations project_invitations_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_invitations
    ADD CONSTRAINT project_invitations_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_members project_members_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_members project_members_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_assignees task_assignees_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_assignees task_assignees_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_attachments task_attachments_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_attachments task_attachments_uploaded_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_uploaded_by_id_users_id_fk FOREIGN KEY (uploaded_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_labels task_labels_label_id_labels_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_labels
    ADD CONSTRAINT task_labels_label_id_labels_id_fk FOREIGN KEY (label_id) REFERENCES public.labels(id) ON DELETE CASCADE;


--
-- Name: task_labels task_labels_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_labels
    ADD CONSTRAINT task_labels_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_list_id_lists_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_list_id_lists_id_fk FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict xFwoFMU0hRBdmtjbkZKB6hlEdDMYRBDiOO9vDa5zjqiTD7Wz7xqtTkQat1OVO7S

