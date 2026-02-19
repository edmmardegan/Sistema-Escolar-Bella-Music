/* src/pages/Boletim/index.jsx */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaSave, FaArrowLeft, FaGraduationCap, FaCalendarCheck } from "react-icons/fa";
import "./styles.css";

export default function Boletim() {
  const { termoId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [alunoInfo, setAlunoInfo] = useState({ nome: "", curso: "" });
  const [termos, setTermos] = useState([]);
  const [termoAtivo, setTermoAtivo] = useState(null);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getDetalhesBoletim(termoId);
      setAlunoInfo({
        nome: res.alunoNome || "Estudante",
        curso: res.cursoNome || "Curso",
      });
      setTermos(res.todosOsTermos || []);

      if (!termoAtivo) {
        const ativo = res.todosOsTermos?.find((t) => t.id === parseInt(termoId));
        if (ativo) setTermoAtivo(ativo);
      } else {
        const atualizado = res.todosOsTermos?.find((t) => t.id === termoAtivo.id);
        if (atualizado) setTermoAtivo(atualizado);
      }
    } catch (error) {
      console.error("Erro ao carregar boletim:", error);
    } finally {
      setLoading(false);
    }
  }, [termoId, termoAtivo]);

  useEffect(() => { carregarDados(); }, [termoId]);

  const handleSalvar = async () => {
  if (!termoAtivo) return;

  // 1. Tratamento das Notas (converte string vazia para 0 e garante que seja número)
  const n1 = termoAtivo.nota1 === "" || termoAtivo.nota1 === null ? 0 : parseFloat(termoAtivo.nota1);
  const n2 = termoAtivo.nota2 === "" || termoAtivo.nota2 === null ? 0 : parseFloat(termoAtivo.nota2);

  // 2. Validação de Regra de Negócio: Se tem nota, tem que ter data
  if (n1 > 0 && (!termoAtivo.dataProva1 || String(termoAtivo.dataProva1).trim() === "")) {
    alert("Nota 1 lançada, informe a data da prova.");
    return; // Para a execução aqui
  }

  if (n2 > 0 && (!termoAtivo.dataProva2 || String(termoAtivo.dataProva2).trim() === "")) {
    alert("Nota 2 lançada, informe a data da prova.");
    return; // Para a execução aqui
  }

  try {
    setLoading(true);
    
    // 3. Montagem do objeto de envio
    const dadosParaSalvar = {
      ...termoAtivo,
      nota1: isNaN(n1) ? 0 : n1,
      nota2: isNaN(n2) ? 0 : n2,
      // Garante que datas vazias vão como null para o banco
      dataProva1: termoAtivo.dataProva1 || null,
      dataProva2: termoAtivo.dataProva2 || null,
    };

    await api.updateBoletim(termoAtivo.id, dadosParaSalvar);
    
    alert(`Dados do ${termoAtivo.numeroTermo}º Termo salvos!`);
    await carregarDados();
    
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert(error.response?.data?.message || "Erro ao salvar notas.");
  } finally {
    setLoading(false);
  }
};

  const calcularMedia = (n1, n2) => ((parseFloat(n1 || 0) + parseFloat(n2 || 0)) / 2).toFixed(1);

  return (
    <main className="conteudo-principal">
      <div className="container-principal">
        
        <header className="header-card">
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              <FaArrowLeft /> Voltar
            </button>
            <h2 style={{margin: 0}}><FaGraduationCap /> Boletim: {alunoInfo.nome}</h2>
          </div>
          <span className="count-badge">{alunoInfo.curso}</span>
        </header>

        <div className="layout-boletim-flex">
          {/* SIDEBAR */}
          <aside className="sidebar-modulos">
            <h3>Módulos</h3>
            <div className="lista-termos-scroll">
              {termos.map((t) => (
                <div 
                  key={t.id} 
                  className={`item-termo-card ${termoAtivo?.id === t.id ? "ativo" : ""}`} 
                  onClick={() => setTermoAtivo(t)}
                >
                  <div className="termo-topo">
                    <strong>{t.numeroTermo}º Termo</strong>
                    <span className="badge-aulas">{t.aulasRealizadas} aulas</span>
                  </div>
                  <div className="termo-media-info">Média: {calcularMedia(t.nota1, t.nota2)}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* PAINEL DE EDIÇÃO COM CLASSES PADRONIZADAS */}
          <section className="painel-notas-central">
            {termoAtivo ? (
              <div className="card-principal">
                <div className="alerta-modulo">
                  Lançamento de Notas: <strong>{termoAtivo.numeroTermo}º Termo</strong>
                </div>

                <div className="grid-notas-form">
                  {/* SEÇÃO PRÁTICA */}
                  <div className="bloco-prova">
                    <h4>Avaliação Prática</h4>
                    <div className="form-row-compact">
                      <div className="input-group campo-curto">
                        <label>Nota</label>
                        <input type="number" min="0" max="10" step="0.1" className="input-field"
                          value={termoAtivo.nota1 || ""}
                          onChange={(e) => setTermoAtivo({ ...termoAtivo, nota1: e.target.value })}
                        />
                      </div>
                      <div className="input-group campo-curto">
                        <label>Data</label>
                        <input type="date" className="input-data"
                          value={termoAtivo.dataProva1 ? termoAtivo.dataProva1.split("T")[0] : ""}
                          onChange={(e) => setTermoAtivo({ ...termoAtivo, dataProva1: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO TEÓRICA */}
                  <div className="bloco-prova">
                    <h4>Avaliação Teórica</h4>
                    <div className="form-row-compact">
                      <div className="input-group campo-curto">
                        <label>Nota</label>
                        <input type="number" min="0" max="10" step="0.1" className="input-field"
                          value={termoAtivo.nota2 || ""}
                          onChange={(e) => setTermoAtivo({ ...termoAtivo, nota2: e.target.value })}
                        />
                      </div>
                      <div className="input-group campo-curto">
                        <label>Data</label>
                        <input type="date" className="input-data"
                          value={termoAtivo.dataProva2 ? termoAtivo.dataProva2.split("T")[0] : ""}
                          onChange={(e) => setTermoAtivo({ ...termoAtivo, dataProva2: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* RESULTADO FINAL */}
                  <div className="bloco-resultado">
                    <h4>Média</h4>
                    <div className={`circulo-media ${calcularMedia(termoAtivo.nota1, termoAtivo.nota2) >= 8 ? "aprovado" : "reprovado"}`}>
                      {calcularMedia(termoAtivo.nota1, termoAtivo.nota2)}
                    </div>
                    <div className="txt-aulas-info"><FaCalendarCheck /> {termoAtivo.aulasRealizadas} aulas</div>
                  </div>
                </div>

                <div className="input-group" style={{marginTop: '15px'}}>
                  <label>Observações Pedagógicas</label>
                  <textarea rows="2" className="input-field"
                    value={termoAtivo.obs || ""}
                    onChange={(e) => setTermoAtivo({ ...termoAtivo, obs: e.target.value })}
                  />
                </div>

                <div className="acoes-form">
                  <button className="btn btn-primary" style={{width: '100%'}} onClick={handleSalvar} disabled={loading}>
                    <FaSave /> Salvar {termoAtivo.numeroTermo}º Termo
                  </button>
                </div>
              </div>
            ) : (
              <div className="aviso-vazio">Selecione um termo para editar.</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}