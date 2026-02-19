import axios from "axios";

// 1. CONFIGURAÇÃO BASE DINÂMICA
/// Pega a URL do .env ou assume a 5000 se tudo falhar
const api_url = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: api_url,
});

if (import.meta.env.DEV) {
  console.log(`🛠️ Conectado ao Banco de DESENVOLVIMENTO: ${api_url}`);
} else {
  console.log(`🚀 Conectado ao Banco de PRODUÇÃO: ${api_url}`);
}

// 2. INTERCEPTORES
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("@App:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("@App:token");
        localStorage.removeItem("@App:user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// 3. OBJETO API
const api = {
  // === 🔐 AUTENTICAÇÃO ===
  login: async (email, password) => {
    const payload = { email: email.trim(), password: password.trim() };
    const response = await axiosInstance.post("/auth/login", payload);
    return response.data;
  },

  // === 📅 AGENDA ===
  getAgenda: async (tipo, filtros) => {
    const resposta = await axiosInstance.get(`/agenda`, {
      params: { tipo, ...filtros },
    });
    return resposta.data;
  },

  saveFrequencia: async (id, acao, motivo = "") => (await axiosInstance.patch(`/agenda/${id}/frequencia`, { acao, motivo })).data,

  gerarAgenda: async (payload) => {
    return (await axiosInstance.post("/agenda/gerar", payload)).data;
  },

  deleteAgenda: async (id) => (await axiosInstance.delete(`/agenda/${id}`)).data,

  // === 👤 USUÁRIOS ===
  getUsuarios: async () => (await axiosInstance.get("/usuarios")).data,
  saveUsuario: async (dados, id = null) => {
    if (id) return (await axiosInstance.put(`/usuarios/${id}`, dados)).data;
    return (await axiosInstance.post("/usuarios", dados)).data;
  },
  deleteUsuario: async (id) => (await axiosInstance.delete(`/usuarios/${id}`)).data,
  resetPasswordAdmin: async (id, dados) => (await axiosInstance.patch(`/usuarios/${id}/reset-password-admin`, dados)).data,
  updateOwnPassword: async (id, dados) => (await axiosInstance.patch(`/usuarios/${id}/update-own-password`, dados)).data,

  // === 🎓 ALUNOS ===
  getAlunos: async () => (await axiosInstance.get("/alunos")).data,
  getAniversariantes: async () => (await axiosInstance.get("/alunos/aniversariantes")).data,
  saveAluno: async (dados, id = null) => {
    if (id) return (await axiosInstance.put(`/alunos/${id}`, dados)).data;
    return (await axiosInstance.post("/alunos", dados)).data;
  },
  deleteAluno: async (id) => (await axiosInstance.delete(`/alunos/${id}`)).data,

  // === 📚 CURSOS ===
  getCursos: async () => (await axiosInstance.get("/cursos")).data,
  saveCurso: async (dados, id = null) => {
    if (id) return (await axiosInstance.put(`/cursos/${id}`, dados)).data;
    return (await axiosInstance.post("/cursos", dados)).data;
  },
  deleteCurso: async (id) => (await axiosInstance.delete(`/cursos/${id}`)).data,

  // === 📝 MATRÍCULAS ===
  getMatriculas: async () => (await axiosInstance.get("/matriculas")).data,
  saveMatricula: async (dados, id = null) => {
    if (id) return (await axiosInstance.put(`/matriculas/${id}`, dados)).data;
    return (await axiosInstance.post("/matriculas", dados)).data;
  },
  deleteMatricula: async (id) => (await axiosInstance.delete(`/matriculas/${id}`)).data,
  getPorMatricula: async (id) => (await axiosInstance.get(`/financeiro/matricula/${id}`)).data,

  // === 💰 FINANCEIRO ===
  getAllFinanceiro: async () => (await axiosInstance.get("/financeiro")).data,
  pagar: async (id) => (await axiosInstance.post(`/financeiro/${id}/pagar`)).data,
  estornar: async (id) => (await axiosInstance.post(`/financeiro/${id}/estornar`)).data,
  deleteParcela: async (id) => (await axiosInstance.delete(`/financeiro/${id}`)).data,
  gerarParcelaGlobal: async (dados) => (await axiosInstance.post("/financeiro/gerar-lote-anual", dados)).data,
  gerarParcelaIndividual: async (id, ano) => (await axiosInstance.post(`/matriculas/${id}/gerar-financeiro`, { ano })).data,
  aplicarReajusteGlobal: async (dados) => (await axiosInstance.post("/financeiro/reajuste-global", dados)).data,

  // === 📊 BOLETIM / TERMOS ===
  getDetalhesBoletim: async (termoId) => (await axiosInstance.get(`/matriculas/termo/${termoId}`)).data,
  updateBoletim: async (termoId, dados) => (await axiosInstance.patch(`/matriculas/termo/${termoId}`, dados)).data,
};

export default api;
