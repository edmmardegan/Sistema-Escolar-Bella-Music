--
-- PostgreSQL database dump
--

\restrict Ow3qJiYsJH15DXKuusiOAzjomZ9xDfPDkzYT9DXSGsftNJ786PZ4ehhRe7pgSyv

-- Dumped from database version 17.7 (Ubuntu 17.7-0ubuntu0.25.10.1)
-- Dumped by pg_dump version 17.7 (Ubuntu 17.7-0ubuntu0.25.10.1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aluno; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aluno (
    id integer NOT NULL,
    nome character varying NOT NULL,
    "dataNascimento" character varying,
    telefone character varying,
    ativo boolean DEFAULT true NOT NULL,
    "nomePai" character varying,
    "nomeMae" character varying,
    rua character varying,
    bairro character varying,
    cidade character varying,
    "criadoEm" timestamp without time zone DEFAULT now(),
    "atualizadoEm" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.aluno OWNER TO postgres;

--
-- Name: aluno_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aluno_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aluno_id_seq OWNER TO postgres;

--
-- Name: aluno_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aluno_id_seq OWNED BY public.aluno.id;


--
-- Name: aula; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aula (
    id integer NOT NULL,
    data timestamp without time zone,
    status character varying DEFAULT 'Pendente'::character varying NOT NULL,
    "motivoFalta" text,
    obs text,
    "criadoEm" timestamp without time zone DEFAULT now(),
    "atualizadoEm" timestamp without time zone DEFAULT now(),
    termo_id integer
);


ALTER TABLE public.aula OWNER TO postgres;

--
-- Name: aula_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aula_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aula_id_seq OWNER TO postgres;

--
-- Name: aula_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aula_id_seq OWNED BY public.aula.id;


--
-- Name: curso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.curso (
    id integer NOT NULL,
    nome character varying NOT NULL,
    "valorMensalidade" double precision,
    "qtdeTermos" integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.curso OWNER TO postgres;

--
-- Name: curso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.curso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.curso_id_seq OWNER TO postgres;

--
-- Name: curso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.curso_id_seq OWNED BY public.curso.id;


--
-- Name: financeiro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financeiro (
    id integer NOT NULL,
    descricao character varying NOT NULL,
    "valorTotal" double precision,
    "dataVencimento" character varying NOT NULL,
    "dataPagamento" text,
    status character varying DEFAULT 'Aberta'::character varying NOT NULL,
    tipo character varying DEFAULT 'Receita'::character varying NOT NULL,
    "alunoId" integer,
    "matriculaId" integer
);


ALTER TABLE public.financeiro OWNER TO postgres;

--
-- Name: financeiro_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.financeiro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financeiro_id_seq OWNER TO postgres;

--
-- Name: financeiro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.financeiro_id_seq OWNED BY public.financeiro.id;


--
-- Name: matricula; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matricula (
    id integer NOT NULL,
    "valorMatricula" numeric(10,2) NOT NULL,
    "valorMensalidade" numeric(10,2) NOT NULL,
    "valorCombustivel" numeric(10,2),
    "diaVencimento" integer NOT NULL,
    situacao character varying DEFAULT 'Em Andamento'::character varying NOT NULL,
    tipo character varying DEFAULT 'Presencial'::character varying NOT NULL,
    termo_atual integer DEFAULT 1 NOT NULL,
    "dataInicio" timestamp without time zone DEFAULT now() NOT NULL,
    "dataTermino" date,
    "criadoEm" timestamp without time zone DEFAULT now() NOT NULL,
    "atualizadoEm" timestamp without time zone DEFAULT now() NOT NULL,
    "diaSemana" character varying,
    horario character varying,
    frequencia character varying DEFAULT 'Semanal'::character varying NOT NULL,
    professor character varying,
    aluno_id integer,
    curso_id integer
);


ALTER TABLE public.matricula OWNER TO postgres;

--
-- Name: matricula_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matricula_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.matricula_id_seq OWNER TO postgres;

--
-- Name: matricula_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matricula_id_seq OWNED BY public.matricula.id;


--
-- Name: matricula_termo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matricula_termo (
    id integer NOT NULL,
    "numeroTermo" integer NOT NULL,
    "matriculaId" integer,
    nota1 double precision,
    "dataProva1" date,
    nota2 double precision,
    "dataProva2" date,
    obs text
);


ALTER TABLE public.matricula_termo OWNER TO postgres;

--
-- Name: matricula_termo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matricula_termo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.matricula_termo_id_seq OWNER TO postgres;

--
-- Name: matricula_termo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matricula_termo_id_seq OWNED BY public.matricula_termo.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome character varying NOT NULL,
    email character varying NOT NULL,
    username character varying NOT NULL,
    senha character varying NOT NULL,
    role character varying DEFAULT 'user'::character varying NOT NULL,
    "primeiroAcesso" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: aluno id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aluno ALTER COLUMN id SET DEFAULT nextval('public.aluno_id_seq'::regclass);


--
-- Name: aula id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aula ALTER COLUMN id SET DEFAULT nextval('public.aula_id_seq'::regclass);


--
-- Name: curso id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso ALTER COLUMN id SET DEFAULT nextval('public.curso_id_seq'::regclass);


--
-- Name: financeiro id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financeiro ALTER COLUMN id SET DEFAULT nextval('public.financeiro_id_seq'::regclass);


--
-- Name: matricula id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matricula ALTER COLUMN id SET DEFAULT nextval('public.matricula_id_seq'::regclass);


--
-- Name: matricula_termo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matricula_termo ALTER COLUMN id SET DEFAULT nextval('public.matricula_termo_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: aluno; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aluno (id, nome, "dataNascimento", telefone, ativo, "nomePai", "nomeMae", rua, bairro, cidade, "criadoEm", "atualizadoEm") FROM stdin;
1	Andreia Fernanda da Silva Camargo		(16) 99777-7623	t	Cloves de Camargo	Layde da Silva Camargo	Av. Julio Prestes de Albuquerque, 318	Jd. Almeida	Araraquara	2026-02-05 16:35:57.097028	2026-02-05 16:35:57.097028
6	Daniel Ferreira		(16) 99975-4788	t	José Carlos Pedro Ferreira	Terezinha Aparecida Ferreira	Av. Vicente Gulho, 408	Jd. Almeida	Araraquara	2026-02-05 17:25:38.207307	2026-02-05 17:25:38.207307
3	Arthur Borrás Trevisoli		(16) 99963-7400	t	Felipe Trevisoli	Bárbara Borrás (16) 99794-7723	Rua Porfirio Marques de Andrade, 1465	Jd. Imperador	Araraquara	2026-02-05 16:53:35.999523	2026-02-05 17:25:57.262677
2	José Amilton da Silva		(16) 99771-8878	t		Cecilia P. Rodrigues da Silva	Av. Moacir Camargo Barbosa, 629	Jd. Nova Araraquara	Araraquara	2026-02-05 16:49:42.473645	2026-02-05 17:26:13.861499
4	Arthur Perez Pereira		(16) 98228-0043	t	Jonas Januário Pereira	Daniela Teresinha Perez Pereira	Av. Dona Gertrudes Leite de Souza Pinto, 551	Jd. Paulistano	Araraquara	2026-02-05 17:13:09.563719	2026-02-05 17:26:28.403223
5	Cilene Fabiola Pereira Dias		(16) 99711-0643	t	Jurandir do Carmo Pereira	Divanil Candido Pereira	Av. Joaquim Alves, 159	Jd. Primavera	Araraquara	2026-02-05 17:16:02.751238	2026-02-05 17:26:41.994726
7	Diego Camargo Bitencourt		(16) 98818-8684	t	Ademar Maia Bitencourt	Cleusa Maria Camargo	Rua Mauricio Galli, 1215	Vila Sedenho	Araraquara	2026-02-05 19:11:22.14353	2026-02-05 19:11:22.14353
8	Dirceu Gomes Lanco		(16) 99740-1978	t	Argenio Gomes Lanco	Idalina Izipato Lanco	Av. José Benevenuto Fortes, 834	Jd. Selmi Dey	Araraquara	2026-02-05 19:14:40.232202	2026-02-05 19:14:40.232202
9	Maria Eduarda Dias		(16) 99713-4157	t	Therry Dias Neto	Cilene Fabiola Pereira Dias			Araraquara	2026-02-05 19:16:27.736193	2026-02-05 19:16:27.736193
10	Emanuelle Silva Zelanti		(16) 99637-0997	t	Willian Richarde Zelante	Cassia Herculano da Silva Zelanti	Av. Geraldo Neves Junior, 155	Jd. Nova Araraquara	Araraquara	2026-02-05 19:18:23.944238	2026-02-05 19:18:23.944238
11	Gabriela Maria Gonçalves de Lima		(16) 9704-0934	t	Natal Valdemir Gonçalves de Lima	Adriana Elaine Mendes de Lima			Araraquara	2026-02-05 19:21:03.617211	2026-02-05 19:21:03.617211
12	Isabela dos Santos Mardegan	2004-04-03	(16) 99753-7490	t	Evandro Doro Mardegan	Cristiane Aparecida dos Santos Mardegan	Rua Lázaro Pedroso, 816	Jardim Uirapuru	Araraquara	2026-02-05 19:22:50.169403	2026-02-05 19:22:50.169403
13	João Paulo da Silva		(16) 99728-0429	t	Joaquim Antonio da Silva	Claudete Ap. Ferreira da Silva	Rua Ermineo Deco, 233	Jd. Iguatemy	Araraquara	2026-02-05 19:24:40.562605	2026-02-05 19:24:40.562605
14	Larissa de Fatima Miranda dos Santos		(16) 99975-6832	t	Hamilton José dos Santos	Regina Célia Miranda dos Santos	Rua Franz Arnold, 232	Jd. Uirapuru	Araraquara	2026-02-05 19:26:43.080476	2026-02-05 19:26:43.080476
15	Juliana Bataglhia de Paiva Lima			t		Marcia Cristina de Paiva Lima			Araraquara	2026-02-05 19:28:31.816394	2026-02-05 19:28:31.816394
16	Laura Furtado		(16) 99775-4139	t	Antonio Donisete Furtado	Roseli Felipe	Av. Mauricio Galli, 2049	Jd. Uirapuru	Araraquara	2026-02-05 19:31:28.672828	2026-02-05 19:31:28.672828
17	Luciana Paludetti Zubieta Traldi		(16) 99254-2076	t	Luis Fernando Zubieta	Maria Amélia Paludetti	Av. Deputado Federal Mario Eugenia, 200	Jd. Botanico	Araraquara	2026-02-05 19:34:38.689123	2026-02-05 19:34:38.689123
18	Isabelly Alves Tomaz		(16) 99963-9335	t	Valdir da Silva Tomaz	Katia Daniela Alves	Rua Domingos Calafatti, 165	Jd. Vitorio D' Santi II	Araraquara	2026-02-06 21:16:11.62856	2026-02-06 21:16:11.62856
19	Marcela Rego		(16) 99141-0193	t	Jair Lavra Rego	Cleide Marques Rego	Rua Lázaro Pedroso, 436	Jardim Uirapuru	Araraquara	2026-02-06 21:17:51.208536	2026-02-06 21:17:51.208536
20	Maria Clara Silva			t	Luiz Carlos Silva	Laura Maria Silva	Rua Lázaro Pedroso, 787	Jardim Uirapuru	Araraquara	2026-02-06 21:20:12.968685	2026-02-06 21:20:12.968685
22	Maria Eduarda Renho de Lima		(16) 99714-0017	t	Kleber	Kraisa	Av. Fortunato Bressan, 219	Jd. Morada do Sol	Araraquara	2026-02-06 21:25:57.920273	2026-02-06 21:26:24.570275
23	Miguel da Silva Ribeiro			t	Luis Fernando Ribeiro	Maria de Lourdes Custodio da Silva	Av. Geraldo Fernandes Beata, 120	Jd. Adalberto Roxo	Araraquara	2026-02-06 21:32:30.85121	2026-02-06 21:32:30.85121
24	Miguel Perez Pereira		(16) 98218-0043	t	Jonas Januário Pereira	Daniela Teresinha Perez Pereira	Av. Dona Gertrudes Leite de Souza Pinto, 551	Jd. Paulistano	Araraquara	2026-02-06 21:39:53.777725	2026-02-06 21:40:25.341746
25	Miguel Lima Rossi		(16) 99231-0757	t	Jorge Augusto Rossi	Crislaine Pessoa Lima Rossi	Av. Mario Possetti, 205	Jd. das Paineiras	Araraquara	2026-02-06 23:25:23.443782	2026-02-06 23:25:23.443782
27	Bento Carlos Isaias Neto		(16) 98191-4428	t	Carlos Eduardo Isaias	Marcia Krina Isaias	Av. Profa Sebastião de A. Machado, 620	Santa Angelina	Araraquara	2026-02-06 23:29:24.192804	2026-02-06 23:29:24.192804
26	Sabsul Chaid Neto		(16) 99773-9051	t	Naif Chaid	Maria Helena Tito	Av. Paulo da Silveira Ferraz, 893	Vila Xavier	Araraquara	2026-02-06 23:27:04.065139	2026-02-06 23:30:27.984453
21	Maria de Jesus Oliveira		(16) 99788-4615	t	José Dias Oliveira	Antonia Martins Oliveira	Rua Italia, 4298	Jd. Tangara	Araraquara	2026-02-06 21:23:59.839972	2026-02-06 23:32:01.778273
28	Rubenilda Tavares Ferreira		(19) 99726-0633	t	Antonio Jose dos Santos	Berenice Tavares dos Santos	Rua Dr. Lazaro Luiz Zamenhof, 269	Jd. Silvestre	Araraquara	2026-02-06 23:34:26.145513	2026-02-06 23:34:26.145513
29	Regina Celia Miranda dos Santos		(16) 99785-5649	t	Miguel Chaves de Miranda	Adalgisa Matheus Miranda	Rua Franz Arnold, 232	Jd. Uirapuru	Araraquara	2026-02-06 23:36:23.616984	2026-02-06 23:36:23.616984
30	Sebastião do Carmo Mesquita			t	Bento Mesquita	Gerse Medeiros			Araraquara	2026-02-06 23:39:06.000787	2026-02-06 23:39:06.000787
32	Aneli Benedita da Silva		(16) 99796-5132	t	Manoel Vieira da Silva	Laura Clarinda de Oliveira	Rua Dinamerico Duarde de Oliveira, 94	Jd. Selmi Dei I	Araraquara	2026-02-06 23:44:32.657239	2026-02-06 23:44:53.090441
33	Angela Maria C. Miranda Ruzafa		(16) 99701-6630	t	Miguel Chaves de Miranda	Adalgisa Matheus Miranda	Rua Antonio Fernandes, 563	Jd. Cambuy	Araraquara	2026-02-06 23:46:45.393327	2026-02-06 23:46:45.393327
34	Zenaide de Oliveira Baptiston			t	Jose Dias de Oliveira	Antonia Martins Oliveira			Araraquara	2026-02-06 23:48:20.7129	2026-02-06 23:48:20.7129
31	Adalgisa Maria Chaves de Miranda		(16) 99714-3367	t	Miguel Chaves de Miranda	Adalgisa Matheus Miranda	Rua Franz Arnold, 232	Jd. Imperador	Araraquara	2026-02-06 23:43:06.153257	2026-02-07 00:02:44.709274
\.


--
-- Data for Name: aula; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aula (id, data, status, "motivoFalta", obs, "criadoEm", "atualizadoEm", termo_id) FROM stdin;
1	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.381111	2026-02-07 10:15:12.381111	5
2	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.394161	2026-02-07 10:15:12.394161	5
3	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.402392	2026-02-07 10:15:12.402392	5
4	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.411174	2026-02-07 10:15:12.411174	5
5	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.421053	2026-02-07 10:15:12.421053	11
6	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.435811	2026-02-07 10:15:12.435811	11
7	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.443628	2026-02-07 10:15:12.443628	11
8	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.45203	2026-02-07 10:15:12.45203	11
9	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.46175	2026-02-07 10:15:12.46175	15
10	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.469507	2026-02-07 10:15:12.469507	15
11	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.477092	2026-02-07 10:15:12.477092	15
12	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.485334	2026-02-07 10:15:12.485334	15
13	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.494947	2026-02-07 10:15:12.494947	21
14	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.502453	2026-02-07 10:15:12.502453	21
15	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.509966	2026-02-07 10:15:12.509966	21
16	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.517938	2026-02-07 10:15:12.517938	21
17	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.526733	2026-02-07 10:15:12.526733	27
18	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.534742	2026-02-07 10:15:12.534742	27
19	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.542379	2026-02-07 10:15:12.542379	27
20	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.550395	2026-02-07 10:15:12.550395	27
21	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.559974	2026-02-07 10:15:12.559974	31
22	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.567864	2026-02-07 10:15:12.567864	31
23	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.575164	2026-02-07 10:15:12.575164	31
24	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.582414	2026-02-07 10:15:12.582414	31
25	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.591356	2026-02-07 10:15:12.591356	37
26	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.598699	2026-02-07 10:15:12.598699	37
27	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.606644	2026-02-07 10:15:12.606644	37
28	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.614484	2026-02-07 10:15:12.614484	37
29	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.623942	2026-02-07 10:15:12.623942	43
30	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.631733	2026-02-07 10:15:12.631733	43
31	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.639449	2026-02-07 10:15:12.639449	43
32	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.647178	2026-02-07 10:15:12.647178	43
33	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.656394	2026-02-07 10:15:12.656394	49
34	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.664154	2026-02-07 10:15:12.664154	49
35	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.671853	2026-02-07 10:15:12.671853	49
36	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.6797	2026-02-07 10:15:12.6797	49
37	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.688687	2026-02-07 10:15:12.688687	59
38	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.696387	2026-02-07 10:15:12.696387	59
39	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.703835	2026-02-07 10:15:12.703835	59
40	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.711263	2026-02-07 10:15:12.711263	59
41	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.720221	2026-02-07 10:15:12.720221	64
42	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.727865	2026-02-07 10:15:12.727865	64
43	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.735536	2026-02-07 10:15:12.735536	64
44	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.743639	2026-02-07 10:15:12.743639	64
45	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.752168	2026-02-07 10:15:12.752168	67
46	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.759718	2026-02-07 10:15:12.759718	67
47	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.767086	2026-02-07 10:15:12.767086	67
48	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.774638	2026-02-07 10:15:12.774638	67
49	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.783545	2026-02-07 10:15:12.783545	73
50	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.791246	2026-02-07 10:15:12.791246	73
51	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.798862	2026-02-07 10:15:12.798862	73
52	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.806325	2026-02-07 10:15:12.806325	73
53	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.815244	2026-02-07 10:15:12.815244	79
54	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.822917	2026-02-07 10:15:12.822917	79
55	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.830622	2026-02-07 10:15:12.830622	79
56	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.838259	2026-02-07 10:15:12.838259	79
57	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.847205	2026-02-07 10:15:12.847205	85
58	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.854844	2026-02-07 10:15:12.854844	85
59	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.862702	2026-02-07 10:15:12.862702	85
60	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.870235	2026-02-07 10:15:12.870235	85
61	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.879245	2026-02-07 10:15:12.879245	91
62	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.8869	2026-02-07 10:15:12.8869	91
63	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.894312	2026-02-07 10:15:12.894312	91
64	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.901854	2026-02-07 10:15:12.901854	91
66	2026-02-09 17:30:00	Pendente	\N	\N	2026-02-07 10:15:12.918687	2026-02-07 10:15:12.918687	1
67	2026-02-16 17:30:00	Pendente	\N	\N	2026-02-07 10:15:12.92623	2026-02-07 10:15:12.92623	1
68	2026-02-23 17:30:00	Pendente	\N	\N	2026-02-07 10:15:12.933696	2026-02-07 10:15:12.933696	1
69	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.94276	2026-02-07 10:15:12.94276	97
70	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.95047	2026-02-07 10:15:12.95047	97
71	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.958062	2026-02-07 10:15:12.958062	97
72	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.965777	2026-02-07 10:15:12.965777	97
73	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.974881	2026-02-07 10:15:12.974881	113
74	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.982524	2026-02-07 10:15:12.982524	113
75	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.98987	2026-02-07 10:15:12.98987	113
76	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:12.997222	2026-02-07 10:15:12.997222	113
77	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.005607	2026-02-07 10:15:13.005607	119
78	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.012975	2026-02-07 10:15:13.012975	119
79	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.020083	2026-02-07 10:15:13.020083	119
80	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.026991	2026-02-07 10:15:13.026991	119
81	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.035726	2026-02-07 10:15:13.035726	123
82	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.043013	2026-02-07 10:15:13.043013	123
83	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.050606	2026-02-07 10:15:13.050606	123
84	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.058076	2026-02-07 10:15:13.058076	123
85	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.066869	2026-02-07 10:15:13.066869	129
86	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.073822	2026-02-07 10:15:13.073822	129
87	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.080668	2026-02-07 10:15:13.080668	129
88	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.088233	2026-02-07 10:15:13.088233	129
89	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.097195	2026-02-07 10:15:13.097195	133
90	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.104338	2026-02-07 10:15:13.104338	133
91	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.111956	2026-02-07 10:15:13.111956	133
92	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.119136	2026-02-07 10:15:13.119136	133
93	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.127565	2026-02-07 10:15:13.127565	139
94	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.134871	2026-02-07 10:15:13.134871	139
95	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.142265	2026-02-07 10:15:13.142265	139
96	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.149817	2026-02-07 10:15:13.149817	139
97	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.158455	2026-02-07 10:15:13.158455	143
98	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.165943	2026-02-07 10:15:13.165943	143
99	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.17371	2026-02-07 10:15:13.17371	143
100	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.180776	2026-02-07 10:15:13.180776	143
101	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.188781	2026-02-07 10:15:13.188781	149
102	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.196155	2026-02-07 10:15:13.196155	149
103	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.203618	2026-02-07 10:15:13.203618	149
104	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.211352	2026-02-07 10:15:13.211352	149
105	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.220049	2026-02-07 10:15:13.220049	161
106	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.227511	2026-02-07 10:15:13.227511	161
107	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.234987	2026-02-07 10:15:13.234987	161
108	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.242583	2026-02-07 10:15:13.242583	161
109	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.251717	2026-02-07 10:15:13.251717	155
110	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.259337	2026-02-07 10:15:13.259337	155
111	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.267599	2026-02-07 10:15:13.267599	155
112	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.275224	2026-02-07 10:15:13.275224	155
113	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.283872	2026-02-07 10:15:13.283872	167
114	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.291239	2026-02-07 10:15:13.291239	167
115	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.298287	2026-02-07 10:15:13.298287	167
116	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.305789	2026-02-07 10:15:13.305789	167
117	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.314291	2026-02-07 10:15:13.314291	179
118	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.321882	2026-02-07 10:15:13.321882	179
119	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.329364	2026-02-07 10:15:13.329364	179
120	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.336436	2026-02-07 10:15:13.336436	179
121	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.34469	2026-02-07 10:15:13.34469	185
122	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.352125	2026-02-07 10:15:13.352125	185
123	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.35968	2026-02-07 10:15:13.35968	185
124	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.367083	2026-02-07 10:15:13.367083	185
125	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.375926	2026-02-07 10:15:13.375926	191
126	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.383439	2026-02-07 10:15:13.383439	191
127	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.390883	2026-02-07 10:15:13.390883	191
128	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.398243	2026-02-07 10:15:13.398243	191
129	2026-02-02 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.406406	2026-02-07 10:15:13.406406	197
130	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.413927	2026-02-07 10:15:13.413927	197
131	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.421056	2026-02-07 10:15:13.421056	197
132	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.427994	2026-02-07 10:15:13.427994	197
134	2026-02-09 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.450773	2026-02-07 10:15:13.450773	173
135	2026-02-16 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.458361	2026-02-07 10:15:13.458361	173
136	2026-02-23 08:00:00	Pendente	\N	\N	2026-02-07 10:15:13.465876	2026-02-07 10:15:13.465876	173
65	2026-02-02 17:30:00	Presente	\N	\N	2026-02-07 10:15:12.910804	2026-02-07 10:22:47.362119	1
133	2026-02-02 08:00:00	Falta	falta	\N	2026-02-07 10:15:13.4366	2026-02-07 10:22:52.292269	173
\.


--
-- Data for Name: curso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.curso (id, nome, "valorMensalidade", "qtdeTermos") FROM stdin;
1	Violão Popular	160	6
2	Violão Clássico	160	8
3	Teclado	160	4
4	Cavaquinho	160	3
\.


--
-- Data for Name: financeiro; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financeiro (id, descricao, "valorTotal", "dataVencimento", "dataPagamento", status, tipo, "alunoId", "matriculaId") FROM stdin;
\.


--
-- Data for Name: matricula; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matricula (id, "valorMatricula", "valorMensalidade", "valorCombustivel", "diaVencimento", situacao, tipo, termo_atual, "dataInicio", "dataTermino", "criadoEm", "atualizadoEm", "diaSemana", horario, frequencia, professor, aluno_id, curso_id) FROM stdin;
2	70.00	160.00	0.00	10	Em Andamento	Presencial	1	2025-09-11 00:00:00	\N	2026-02-05 16:50:55.337281	2026-02-05 16:50:55.337281	Segunda	08:00	Semanal	Cristiane	2	1
3	70.00	160.00	0.00	20	Em Andamento	Presencial	1	2025-03-18 00:00:00	\N	2026-02-05 16:51:37.13566	2026-02-05 17:11:02.39913	Segunda	08:00	Semanal	Cristiane	3	1
4	70.00	160.00	0.00	15	Em Andamento	Residencial	1	2023-12-14 00:00:00	\N	2026-02-05 17:14:54.247525	2026-02-05 17:14:54.247525	Segunda	08:00	Semanal	Cristiane	4	1
5	70.00	160.00	0.00	10	Em Andamento	Presencial	1	2025-06-05 00:00:00	\N	2026-02-05 17:16:53.23043	2026-02-05 17:16:53.23043	Segunda	08:00	Semanal	Cristiane	5	1
6	70.00	160.00	0.00	15	Em Andamento	Presencial	1	2025-04-14 00:00:00	\N	2026-02-05 19:10:09.214913	2026-02-05 19:10:09.214913	Segunda	08:00	Semanal	Cristiane	6	3
7	70.00	160.00	0.00	10	Em Andamento	Presencial	1	2024-11-11 00:00:00	\N	2026-02-05 19:11:57.550445	2026-02-05 19:11:57.550445	Segunda	08:00	Semanal	Cristiane	7	1
8	70.00	160.00	0.00	30	Em Andamento	Presencial	1	2023-03-31 00:00:00	\N	2026-02-05 19:15:12.846642	2026-02-05 19:15:12.846642	Segunda	08:00	Semanal	Cristiane	8	1
9	70.00	160.00	0.00	20	Em Andamento	Presencial	1	2025-02-20 00:00:00	\N	2026-02-05 19:16:57.742546	2026-02-05 19:16:57.742546	Segunda	08:00	Semanal	Cristiane	9	1
10	70.00	160.00	0.00	30	Em Andamento	Presencial	1	2023-02-25 00:00:00	\N	2026-02-05 19:19:17.542718	2026-02-05 19:19:17.542718	Segunda	08:00	Semanal	Cristiane	10	1
11	0.00	160.00	0.00	10	Em Andamento	Presencial	5	2026-01-01 00:00:00	\N	2026-02-05 19:21:41.528193	2026-02-05 19:21:41.528193	Segunda	08:00	Semanal	Cristiane	11	1
12	0.00	0.00	0.00	10	Em Andamento	Presencial	4	2018-08-02 00:00:00	\N	2026-02-05 19:23:10.886751	2026-02-05 19:23:21.317982	Segunda	08:00	Semanal	Cristiane	12	1
13	70.00	160.00	0.00	30	Em Andamento	Presencial	1	2019-09-30 00:00:00	\N	2026-02-05 19:25:05.775088	2026-02-05 19:25:05.775088	Segunda	08:00	Semanal	Cristiane	13	1
14	70.00	160.00	0.00	10	Em Andamento	Presencial	1	2022-07-06 00:00:00	\N	2026-02-05 19:27:09.31078	2026-02-05 19:27:09.31078	Segunda	08:00	Semanal	Cristiane	14	1
15	70.00	160.00	0.00	15	Em Andamento	Presencial	1	2025-11-13 00:00:00	\N	2026-02-05 19:29:03.015039	2026-02-05 19:29:03.015039	Segunda	08:00	Semanal	Cristiane	15	1
16	70.00	160.00	0.00	15	Em Andamento	Presencial	1	2018-09-14 00:00:00	\N	2026-02-05 19:32:00.182946	2026-02-05 19:32:00.182946	Segunda	08:00	Semanal	Cristiane	16	1
17	0.00	160.00	0.00	10	Em Andamento	Presencial	1	2021-11-08 00:00:00	\N	2026-02-05 19:35:17.85491	2026-02-05 19:35:17.85491	Segunda	08:00	Semanal	Cristiane	17	1
1	70.00	160.00	0.00	30	Em Andamento	Presencial	1	2026-01-26 00:00:00	\N	2026-02-05 16:46:29.419558	2026-02-06 21:02:19.925198	Segunda	17:30	Semanal	Cristiane	1	3
18	70.00	160.00	0.00	30	Em Andamento	Residencial	1	2023-11-30 00:00:00	\N	2026-02-06 21:16:55.440933	2026-02-06 21:16:55.440933	Segunda	08:00	Semanal	Cristiane	18	3
19	70.00	160.00	0.00	30	Trancado	Presencial	1	2022-08-27 00:00:00	2026-02-07	2026-02-06 21:18:22.654539	2026-02-06 21:18:22.654539	Segunda	08:00	Semanal	Cristiane	19	1
20	0.00	160.00	0.00	10	Finalizado	Presencial	6	2012-09-06 00:00:00	2026-02-07	2026-02-06 21:21:02.543616	2026-02-06 21:21:02.543616	Segunda	08:00	Semanal	Cristiane	20	1
21	0.00	160.00	0.00	10	Em Andamento	Presencial	1	2024-11-08 00:00:00	\N	2026-02-06 21:21:50.543277	2026-02-06 21:21:50.543277	Segunda	08:00	Semanal	Cristiane	20	1
22	0.00	160.00	0.00	20	Em Andamento	Presencial	1	2020-11-16 00:00:00	\N	2026-02-06 21:24:41.967141	2026-02-06 21:24:41.967141	Segunda	08:00	Semanal	Cristiane	21	3
23	0.00	160.00	0.00	25	Em Andamento	Presencial	1	2025-12-23 00:00:00	\N	2026-02-06 21:26:51.904365	2026-02-06 21:26:51.904365	Segunda	08:00	Semanal	Cristiane	22	1
24	0.00	160.00	0.00	30	Em Andamento	Presencial	1	2025-04-30 00:00:00	\N	2026-02-06 21:32:59.27907	2026-02-06 21:32:59.27907	Segunda	08:00	Semanal	Cristiane	23	3
25	0.00	160.00	0.00	15	Em Andamento	Residencial	1	2023-12-14 00:00:00	\N	2026-02-06 21:40:56.895612	2026-02-06 21:40:56.895612	Segunda	08:00	Semanal	Cristiane	24	1
26	0.00	160.00	0.00	20	Em Andamento	Presencial	1	2025-05-19 00:00:00	\N	2026-02-06 23:25:52.527753	2026-02-06 23:25:52.527753	Segunda	08:00	Semanal	Cristiane	25	3
27	0.00	160.00	0.00	30	Em Andamento	Presencial	1	2021-05-29 00:00:00	\N	2026-02-06 23:27:29.59988	2026-02-06 23:27:29.59988	Segunda	08:00	Semanal	Cristiane	26	1
28	0.00	160.00	0.00	30	Em Andamento	Presencial	1	2018-03-26 00:00:00	\N	2026-02-06 23:29:47.247695	2026-02-06 23:29:47.247695	Segunda	08:00	Semanal	Cristiane	27	1
30	0.00	160.00	0.00	25	Em Andamento	Presencial	1	2024-09-24 00:00:00	\N	2026-02-06 23:34:49.663512	2026-02-06 23:34:49.663512	Segunda	08:00	Semanal	Cristiane	28	1
29	0.00	160.00	0.00	20	Em Andamento	Presencial	1	2016-02-18 00:00:00	\N	2026-02-06 23:32:55.000295	2026-02-06 23:37:11.928717	Segunda	08:00	Semanal	Cristiane	29	1
31	0.00	160.00	0.00	5	Em Andamento	Presencial	1	2009-11-05 00:00:00	\N	2026-02-06 23:39:27.32745	2026-02-06 23:39:42.719724	Segunda	08:00	Semanal	Cristiane	30	1
33	0.00	160.00	0.00	20	Em Andamento	Presencial	1	2021-01-17 00:00:00	\N	2026-02-06 23:45:35.288686	2026-02-06 23:45:35.288686	Segunda	08:00	Semanal	Cristiane	32	1
34	0.00	160.00	0.00	20	Em Andamento	Presencial	1	2022-04-22 00:00:00	\N	2026-02-06 23:47:12.735287	2026-02-06 23:47:12.735287	Segunda	08:00	Semanal	Cristiane	33	1
35	0.00	160.00	0.00	10	Em Andamento	Residencial	1	2026-02-07 00:00:00	\N	2026-02-06 23:48:47.711439	2026-02-06 23:48:47.711439	Segunda	08:00	Semanal	Cristiane	34	1
36	0.00	160.00	0.00	10	Em Andamento	Residencial	1	2026-02-07 00:00:00	\N	2026-02-06 23:49:04.23274	2026-02-06 23:49:04.23274	Segunda	08:00	Semanal	Cristiane	34	3
32	0.00	160.00	0.00	5	Em Andamento	Presencial	1	2022-07-06 00:00:00	\N	2026-02-06 23:43:32.775515	2026-02-07 00:13:13.693259	Segunda	08:00	Semanal	Cristiane	31	1
\.


--
-- Data for Name: matricula_termo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matricula_termo (id, "numeroTermo", "matriculaId", nota1, "dataProva1", nota2, "dataProva2", obs) FROM stdin;
1	1	1	0	\N	0	\N	\N
2	2	1	0	\N	0	\N	\N
3	3	1	0	\N	0	\N	\N
4	4	1	0	\N	0	\N	\N
5	1	2	0	\N	0	\N	\N
6	2	2	0	\N	0	\N	\N
7	3	2	0	\N	0	\N	\N
8	4	2	0	\N	0	\N	\N
9	5	2	0	\N	0	\N	\N
10	6	2	0	\N	0	\N	\N
11	1	3	0	\N	0	\N	\N
12	2	3	0	\N	0	\N	\N
13	3	3	0	\N	0	\N	\N
14	4	3	0	\N	0	\N	\N
15	1	4	0	\N	0	\N	\N
16	2	4	0	\N	0	\N	\N
17	3	4	0	\N	0	\N	\N
18	4	4	0	\N	0	\N	\N
19	5	4	0	\N	0	\N	\N
20	6	4	0	\N	0	\N	\N
21	1	5	0	\N	0	\N	\N
22	2	5	0	\N	0	\N	\N
23	3	5	0	\N	0	\N	\N
24	4	5	0	\N	0	\N	\N
25	5	5	0	\N	0	\N	\N
26	6	5	0	\N	0	\N	\N
27	1	6	0	\N	0	\N	\N
28	2	6	0	\N	0	\N	\N
29	3	6	0	\N	0	\N	\N
30	4	6	0	\N	0	\N	\N
31	1	7	0	\N	0	\N	\N
32	2	7	0	\N	0	\N	\N
33	3	7	0	\N	0	\N	\N
34	4	7	0	\N	0	\N	\N
35	5	7	0	\N	0	\N	\N
36	6	7	0	\N	0	\N	\N
37	1	8	0	\N	0	\N	\N
38	2	8	0	\N	0	\N	\N
39	3	8	0	\N	0	\N	\N
40	4	8	0	\N	0	\N	\N
41	5	8	0	\N	0	\N	\N
42	6	8	0	\N	0	\N	\N
43	1	9	0	\N	0	\N	\N
44	2	9	0	\N	0	\N	\N
45	3	9	0	\N	0	\N	\N
46	4	9	0	\N	0	\N	\N
47	5	9	0	\N	0	\N	\N
48	6	9	0	\N	0	\N	\N
49	1	10	0	\N	0	\N	\N
50	2	10	0	\N	0	\N	\N
51	3	10	0	\N	0	\N	\N
52	4	10	0	\N	0	\N	\N
53	5	10	0	\N	0	\N	\N
54	6	10	0	\N	0	\N	\N
55	1	11	0	\N	0	\N	\N
56	2	11	0	\N	0	\N	\N
57	3	11	0	\N	0	\N	\N
58	4	11	0	\N	0	\N	\N
59	5	11	0	\N	0	\N	\N
60	6	11	0	\N	0	\N	\N
61	1	12	0	\N	0	\N	\N
62	2	12	0	\N	0	\N	\N
63	3	12	0	\N	0	\N	\N
64	4	12	0	\N	0	\N	\N
65	5	12	0	\N	0	\N	\N
66	6	12	0	\N	0	\N	\N
67	1	13	0	\N	0	\N	\N
68	2	13	0	\N	0	\N	\N
69	3	13	0	\N	0	\N	\N
70	4	13	0	\N	0	\N	\N
71	5	13	0	\N	0	\N	\N
72	6	13	0	\N	0	\N	\N
73	1	14	0	\N	0	\N	\N
74	2	14	0	\N	0	\N	\N
75	3	14	0	\N	0	\N	\N
76	4	14	0	\N	0	\N	\N
77	5	14	0	\N	0	\N	\N
78	6	14	0	\N	0	\N	\N
79	1	15	0	\N	0	\N	\N
80	2	15	0	\N	0	\N	\N
81	3	15	0	\N	0	\N	\N
82	4	15	0	\N	0	\N	\N
83	5	15	0	\N	0	\N	\N
84	6	15	0	\N	0	\N	\N
85	1	16	0	\N	0	\N	\N
86	2	16	0	\N	0	\N	\N
87	3	16	0	\N	0	\N	\N
88	4	16	0	\N	0	\N	\N
89	5	16	0	\N	0	\N	\N
90	6	16	0	\N	0	\N	\N
91	1	17	0	\N	0	\N	\N
92	2	17	0	\N	0	\N	\N
93	3	17	0	\N	0	\N	\N
94	4	17	0	\N	0	\N	\N
95	5	17	0	\N	0	\N	\N
96	6	17	0	\N	0	\N	\N
97	1	18	0	\N	0	\N	\N
98	2	18	0	\N	0	\N	\N
99	3	18	0	\N	0	\N	\N
100	4	18	0	\N	0	\N	\N
101	1	19	0	\N	0	\N	\N
102	2	19	0	\N	0	\N	\N
103	3	19	0	\N	0	\N	\N
104	4	19	0	\N	0	\N	\N
105	5	19	0	\N	0	\N	\N
106	6	19	0	\N	0	\N	\N
107	1	20	0	\N	0	\N	\N
108	2	20	0	\N	0	\N	\N
109	3	20	0	\N	0	\N	\N
110	4	20	0	\N	0	\N	\N
111	5	20	0	\N	0	\N	\N
112	6	20	0	\N	0	\N	\N
113	1	21	0	\N	0	\N	\N
114	2	21	0	\N	0	\N	\N
115	3	21	0	\N	0	\N	\N
116	4	21	0	\N	0	\N	\N
117	5	21	0	\N	0	\N	\N
118	6	21	0	\N	0	\N	\N
119	1	22	0	\N	0	\N	\N
120	2	22	0	\N	0	\N	\N
121	3	22	0	\N	0	\N	\N
122	4	22	0	\N	0	\N	\N
123	1	23	0	\N	0	\N	\N
124	2	23	0	\N	0	\N	\N
125	3	23	0	\N	0	\N	\N
126	4	23	0	\N	0	\N	\N
127	5	23	0	\N	0	\N	\N
128	6	23	0	\N	0	\N	\N
129	1	24	0	\N	0	\N	\N
130	2	24	0	\N	0	\N	\N
131	3	24	0	\N	0	\N	\N
132	4	24	0	\N	0	\N	\N
133	1	25	0	\N	0	\N	\N
134	2	25	0	\N	0	\N	\N
135	3	25	0	\N	0	\N	\N
136	4	25	0	\N	0	\N	\N
137	5	25	0	\N	0	\N	\N
138	6	25	0	\N	0	\N	\N
139	1	26	0	\N	0	\N	\N
140	2	26	0	\N	0	\N	\N
141	3	26	0	\N	0	\N	\N
142	4	26	0	\N	0	\N	\N
143	1	27	0	\N	0	\N	\N
144	2	27	0	\N	0	\N	\N
145	3	27	0	\N	0	\N	\N
146	4	27	0	\N	0	\N	\N
147	5	27	0	\N	0	\N	\N
148	6	27	0	\N	0	\N	\N
149	1	28	0	\N	0	\N	\N
150	2	28	0	\N	0	\N	\N
151	3	28	0	\N	0	\N	\N
152	4	28	0	\N	0	\N	\N
153	5	28	0	\N	0	\N	\N
154	6	28	0	\N	0	\N	\N
155	1	29	0	\N	0	\N	\N
156	2	29	0	\N	0	\N	\N
157	3	29	0	\N	0	\N	\N
158	4	29	0	\N	0	\N	\N
159	5	29	0	\N	0	\N	\N
160	6	29	0	\N	0	\N	\N
161	1	30	0	\N	0	\N	\N
162	2	30	0	\N	0	\N	\N
163	3	30	0	\N	0	\N	\N
164	4	30	0	\N	0	\N	\N
165	5	30	0	\N	0	\N	\N
166	6	30	0	\N	0	\N	\N
167	1	31	0	\N	0	\N	\N
168	2	31	0	\N	0	\N	\N
169	3	31	0	\N	0	\N	\N
170	4	31	0	\N	0	\N	\N
171	5	31	0	\N	0	\N	\N
172	6	31	0	\N	0	\N	\N
173	1	32	0	\N	0	\N	\N
174	2	32	0	\N	0	\N	\N
175	3	32	0	\N	0	\N	\N
176	4	32	0	\N	0	\N	\N
177	5	32	0	\N	0	\N	\N
178	6	32	0	\N	0	\N	\N
179	1	33	0	\N	0	\N	\N
180	2	33	0	\N	0	\N	\N
181	3	33	0	\N	0	\N	\N
182	4	33	0	\N	0	\N	\N
183	5	33	0	\N	0	\N	\N
184	6	33	0	\N	0	\N	\N
185	1	34	0	\N	0	\N	\N
186	2	34	0	\N	0	\N	\N
187	3	34	0	\N	0	\N	\N
188	4	34	0	\N	0	\N	\N
189	5	34	0	\N	0	\N	\N
190	6	34	0	\N	0	\N	\N
191	1	35	0	\N	0	\N	\N
192	2	35	0	\N	0	\N	\N
193	3	35	0	\N	0	\N	\N
194	4	35	0	\N	0	\N	\N
195	5	35	0	\N	0	\N	\N
196	6	35	0	\N	0	\N	\N
197	1	36	0	\N	0	\N	\N
198	2	36	0	\N	0	\N	\N
199	3	36	0	\N	0	\N	\N
200	4	36	0	\N	0	\N	\N
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nome, email, username, senha, role, "primeiroAcesso") FROM stdin;
1	Admin	admin@admin.com	admin@admin.com	$2b$10$RLqAH/5zFP.YKwUaJlvR7OXtQ3B3VH8uc1.70uGc30h7359JovmBW	admin	f
5	Daiane	daiane@gmail.com	teste2@gmail.com	$2b$10$/MPutVw5f7GecpveLA4myuXN8SqMZlLIJpFfZHQWg/y48yXRr.kS.	user	t
4	Cristiane	cris@gmail.com	teste@gmail.com	$2b$10$3P.kWzZ9y1P2hEUHl/pmCu.9DME0T.4wImg5kxzjaC.ARJKEX0WXi	user	t
\.


--
-- Name: aluno_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aluno_id_seq', 34, true);


--
-- Name: aula_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aula_id_seq', 136, true);


--
-- Name: curso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curso_id_seq', 4, true);


--
-- Name: financeiro_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.financeiro_id_seq', 1, false);


--
-- Name: matricula_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.matricula_id_seq', 36, true);


--
-- Name: matricula_termo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.matricula_termo_id_seq', 200, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 11, true);


--
-- Name: matricula PK_0068575ec520ea5f11d79d8629d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matricula
    ADD CONSTRAINT "PK_0068575ec520ea5f11d79d8629d" PRIMARY KEY (id);


--
-- Name: matricula_termo PK_6bcbe1da5c4ee00562433a7f916; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matricula_termo
    ADD CONSTRAINT "PK_6bcbe1da5c4ee00562433a7f916" PRIMARY KEY (id);


--
-- Name: curso PK_76073a915621326fb85f28ecc5d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso
    ADD CONSTRAINT "PK_76073a915621326fb85f28ecc5d" PRIMARY KEY (id);


--
-- Name: aluno PK_9611d4cf7a77574063439cf46b2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aluno
    ADD CONSTRAINT "PK_9611d4cf7a77574063439cf46b2" PRIMARY KEY (id);


--
-- Name: usuarios PK_d7281c63c176e152e4c531594a8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY (id);


--
-- Name: aula PK_f4b5d2e277c6146e2572c6ee76a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aula
    ADD CONSTRAINT "PK_f4b5d2e277c6146e2572c6ee76a" PRIMARY KEY (id);


--
-- Name: financeiro PK_fb4c57a7f0259a95bc190d193f6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT "PK_fb4c57a7f0259a95bc190d193f6" PRIMARY KEY (id);


--
-- Name: matricula FK_5bcde84469025ffafe7f6d1f08f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matricula
    ADD CONSTRAINT "FK_5bcde84469025ffafe7f6d1f08f" FOREIGN KEY (aluno_id) REFERENCES public.aluno(id);


--
-- Name: financeiro FK_9ac88a92fe15711fe293e1ed4ab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT "FK_9ac88a92fe15711fe293e1ed4ab" FOREIGN KEY ("matriculaId") REFERENCES public.matricula(id);


--
-- Name: matricula FK_9fd3475edf58e822ac5e0b27aeb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matricula
    ADD CONSTRAINT "FK_9fd3475edf58e822ac5e0b27aeb" FOREIGN KEY (curso_id) REFERENCES public.curso(id);


--
-- Name: matricula_termo FK_cbb01c8c32cfc6551e3ef0ff26e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matricula_termo
    ADD CONSTRAINT "FK_cbb01c8c32cfc6551e3ef0ff26e" FOREIGN KEY ("matriculaId") REFERENCES public.matricula(id) ON DELETE CASCADE;


--
-- Name: aula FK_cee50f10aa67c9b0fa83328c574; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aula
    ADD CONSTRAINT "FK_cee50f10aa67c9b0fa83328c574" FOREIGN KEY (termo_id) REFERENCES public.matricula_termo(id) ON DELETE CASCADE;


--
-- Name: financeiro FK_ddc70d940b44322fb264b0cef57; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT "FK_ddc70d940b44322fb264b0cef57" FOREIGN KEY ("alunoId") REFERENCES public.aluno(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Ow3qJiYsJH15DXKuusiOAzjomZ9xDfPDkzYT9DXSGsftNJ786PZ4ehhRe7pgSyv

