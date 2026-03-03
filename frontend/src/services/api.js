//Local: /src/services/api.js

import axios from "axios";

// ✅ AGORA ELE PEGA A PORTA DO .ENV (4000 na produção, 5000 no dev)
// Se o .env falhar, ele usa 4000 como segurança.
const api_url = import.meta.env.VITE_API_URL || "http://localhost:4000";

const axiosInstance = axios.create({
  baseURL: api_url,
});

// Log para te ajudar a debugar no console do navegador
console.log(`🚀 API configurada para: ${api_url}`);

if (import.meta.env.DEV) {
  console.log(`🛠️ Modo: DESENVOLVIMENTO`);
}

// 2. INTERCEPTORES (Configurados diretamente na instância)
axiosInstance.interceptors.request.use((config) => {
  // Use a chave exata que você usa no resto do sistema (ajustei para @App:token)
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

// 3. OBJETO API (Aqui incluí o método .get para sua tela de Logs não quebrar)
const api = {
  // Atalho para chamadas diretas (ex: Auditoria)
  get: (url, config) => axiosInstance.get(url, config),
  post: (url, data, config) => axiosInstance.post(url, data, config),
  put: (url, data, config) => axiosInstance.put(url, data, config),
  patch: (url, data, config) => axiosInstance.patch(url, data, config),
  delete: (url, config) => axiosInstance.delete(url, config),

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
  gerarAgenda: async (payload) => (await axiosInstance.post("/agenda/gerar", payload)).data,
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
  getMatriculas: async (nome = "") => {
    const resposta = await axiosInstance.get("/matriculas", {
      params: { nome },
    });
    return resposta.data;
  },
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

  // === 🕵️ AUDITORIA (ADICIONE ISSO AQUI) ===
  getAudit: (filtros) => api.get("/audit", { params: filtros }).then((res) => res.data),
};

export default api;
