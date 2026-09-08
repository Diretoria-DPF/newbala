/**
 * simulador/simulador.js
 * Regras de interface e motores matemáticos farmacotécnicos.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verificação de Autenticação
  const session = Auth.getSession();
  const sessionBadge = document.getElementById('session-user-name');

  if (!session) {
    window.location.href = '../index.html?redirect=simulador';
    return;
  }
  sessionBadge.textContent = `${session.nome} (${session.matricula})`;

  // 2. Elementos DOM e Estados de Memória do Módulo
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  const alertBox = document.getElementById('simulador-alert');

  let ultimoCalculoAtivo = null;

  // 3. Utilitários de Interface
  function showAlert(msg, type = 'danger') {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = msg;
    alertBox.classList.remove('hidden');
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideAlert() {
    alertBox.classList.add('hidden');
  }

  // 4. Alternância de Abas
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const target = document.getElementById(tab.getAttribute('data-tab'));
      if (target) target.classList.add('active');
      hideAlert();
    });
  });

  // Botões de Limpar
  document.querySelectorAll('.btn-reset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const form = e.target.closest('form');
      form.reset();
      const parentSection = e.target.closest('.tab-content');
      parentSection.querySelector('.result-box').classList.add('hidden');
      hideAlert();
      ultimoCalculoAtivo = null;
    });
  });

  // ==========================================
  // MOTOR 1: ALCOOLOMETRIA
  // ==========================================
  const formAlcool = document.getElementById('form-alcool');
  formAlcool.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();

    const cPartida = parseFloat(document.getElementById('alcool-c-partida').value);
    const cFinal = parseFloat(document.getElementById('alcool-c-final').value);
    const vFinal = parseFloat(document.getElementById('alcool-v-final').value);

    // Validações Farmacotécnicas
    if (isNaN(cPartida) || isNaN(cFinal) || isNaN(vFinal)) {
      showAlert('Preencha todos os campos obrigatórios da diluição.');
      return;
    }
    if (cPartida <= 0 || cFinal <= 0 || vFinal <= 0) {
      showAlert('Os valores devem ser estritamente maiores que zero.');
      return;
    }
    if (cPartida > 100 || cFinal >= 100) {
      showAlert('Concentrações alcoólicas não podem ultrapassar 100°GL.');
      return;
    }
    if (cFinal >= cPartida) {
      showAlert('A concentração final deve ser obrigatoriamente inferior à concentração do estoque de partida.');
      return;
    }

    // Regra da Diluição: C1 * V1 = C2 * V2 -> V1 = (C2 * V2) / C1
    const vPartida = (cFinal * vFinal) / cPartida;
    const vAguaTeorico = vFinal - vPartida;

    // Exibição
    document.getElementById('res-v-partida').textContent = `${Utils.formatDecimal(vPartida, 2)} mL`;
    document.getElementById('res-v-agua').textContent = `q.s.p. ${Utils.formatDecimal(vFinal, 2)} mL (~${Utils.formatDecimal(vAguaTeorico, 2)} mL)`;
    document.getElementById('result-alcool').classList.remove('hidden');

    ultimoCalculoAtivo = {
      tipo: 'DILUICAO_ALCOOLICA',
      detalhes: {
        concentracaoPartidaGL: cPartida,
        concentracaoAlvoGL: cFinal,
        volumeTotalmL: vFinal,
        volumeAlcoolUtilizadomL: Number(vPartida.toFixed(2)),
        volumeAguaAproximadomL: Number(vAguaTeorico.toFixed(2))
      }
    };
  });

  // ==========================================
  // MOTOR 2: FATOR DE CORREÇÃO E EQUIVALÊNCIA
  // ==========================================
  const formCorrecao = document.getElementById('form-correcao');
  formCorrecao.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();

    const farmaco = document.getElementById('fc-farmaco').value.trim();
    const dosePrescrita = parseFloat(document.getElementById('fc-dose').value);
    const umidade = parseFloat(document.getElementById('fc-umidade').value) || 0;
    const pureza = parseFloat(document.getElementById('fc-pureza').value) || 100;
    const pmSal = parseFloat(document.getElementById('fc-pm-sal').value) || 0;
    const pmBase = parseFloat(document.getElementById('fc-pm-base').value) || 0;

    if (!farmaco) {
      showAlert('Informe o nome do fármaco para fins de rastreabilidade.');
      return;
    }
    if (isNaN(dosePrescrita) || dosePrescrita <= 0) {
      showAlert('A dose prescrita deve ser maior que zero.');
      return;
    }
    if (umidade < 0 || umidade >= 100) {
      showAlert('Teor de umidade inválido. Deve ser entre 0% e 99.9%.');
      return;
    }
    if (pureza <= 0 || pureza > 100) {
      showAlert('Teor de pureza inválido. Deve ser maior que 0% e até 100%.');
      return;
    }

    // 1. Fator de Correção por Umidade: Fc_u = 100 / (100 - U)
    const fcUmidade = 100 / (100 - umidade);
    
    // 2. Fator de Correção por Pureza: Fc_p = 100 / Pureza
    const fcPureza = 100 / pureza;

    // Fator de Correção Combinado de Matéria-Prima
    const fcFinal = fcUmidade * fcPureza;

    // 3. Fator de Equivalência: Feq = PM_sal / PM_base
    let feq = 1.0;
    if (pmSal > 0 || pmBase > 0) {
      if (pmSal <= 0 || pmBase <= 0) {
        showAlert('Para o cálculo de Feq, ambos os pesos moleculares (Sal e Base) são obrigatórios.');
        return;
      }
      if (pmSal < pmBase) {
        showAlert('O peso molecular da forma combinada (Sal) deve ser maior ou igual à Base livre.');
        return;
      }
      feq = pmSal / pmBase;
    }

    const ft = fcFinal * feq;
    const massaCorrigida = dosePrescrita * ft;

    document.getElementById('res-fc').textContent = Utils.formatDecimal(fcFinal, 4);
    document.getElementById('res-feq').textContent = Utils.formatDecimal(feq, 4);
    document.getElementById('res-ftot').textContent = Utils.formatDecimal(ft, 4);
    document.getElementById('res-massa-final').textContent = `${Utils.formatDecimal(massaCorrigida, 2)} mg`;
    document.getElementById('result-correcao').classList.remove('hidden');

    ultimoCalculoAtivo = {
      tipo: 'FATOR_CORRECAO_EQUIVALENCIA',
      detalhes: {
        farmaco,
        dosePrescritamg: dosePrescrita,
        umidadePercentual: umidade,
        purezaPercentual: pureza,
        fcCalculado: Number(fcFinal.toFixed(4)),
        feqCalculado: Number(feq.toFixed(4)),
        fatorTotal: Number(ft.toFixed(4)),
        massaFinalPesagredosemg: Number(massaCorrigida.toFixed(2))
      }
    };
  });

  // ==========================================
  // MOTOR 3: BALANÇO DE EHL
  // ==========================================
  const formEhl = document.getElementById('form-ehl');
  formEhl.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();

    const ehlReq = parseFloat(document.getElementById('ehl-requerido').value);
    const percTotal = parseFloat(document.getElementById('ehl-massa-total').value);
    const t1Nome = document.getElementById('ehl-t1-nome').value.trim();
    const t1Val = parseFloat(document.getElementById('ehl-t1-val').value);
    const t2Nome = document.getElementById('ehl-t2-nome').value.trim();
    const t2Val = parseFloat(document.getElementById('ehl-t2-val').value);

    if (isNaN(ehlReq) || isNaN(percTotal) || isNaN(t1Val) || isNaN(t2Val) || !t1Nome || !t2Nome) {
      showAlert('Preencha todos os parâmetros do sistema emulsionante.');
      return;
    }
    if (t1Val >= t2Val) {
      showAlert('O Tensoativo 1 deve possuir EHL estritamente menor que o Tensoativo 2.');
      return;
    }
    if (ehlReq < t1Val || ehlReq > t2Val) {
      showAlert(`O EHL requerido (${ehlReq}) deve situar-se entre o EHL de ${t1Nome} (${t1Val}) e ${t2Nome} (${t2Val}).`);
      return;
    }

    // Equação Algébrica de Aligação:
    // (t1Val * f1) + (t2Val * f2) = ehlReq, onde f1 + f2 = 1 => f1 = (t2Val - ehlReq) / (t2Val - t1Val)
    const fracaoT1 = (t2Val - ehlReq) / (t2Val - t1Val);
    const fracaoT2 = 1 - fracaoT1;

    const percT1 = fracaoT1 * percTotal;
    const percT2 = fracaoT2 * percTotal;

    document.getElementById('res-ehl-t1-label').textContent = `${t1Nome} (EHL ${t1Val}):`;
    document.getElementById('res-ehl-t1-val').textContent = `${Utils.formatDecimal(percT1, 2)}% (${Utils.formatDecimal(fracaoT1 * 100, 1)}% do blend)`;
    
    document.getElementById('res-ehl-t2-label').textContent = `${t2Nome} (EHL ${t2Val}):`;
    document.getElementById('res-ehl-t2-val').textContent = `${Utils.formatDecimal(percT2, 2)}% (${Utils.formatDecimal(fracaoT2 * 100, 1)}% do blend)`;

    document.getElementById('result-ehl').classList.remove('hidden');

    ultimoCalculoAtivo = {
      tipo: 'BALANCO_EHL',
      detalhes: {
        ehlRequerido: ehlReq,
        percentualTotalBlend: percTotal,
        tensoativo1: { nome: t1Nome, ehl: t1Val, proporcaoFormulaPerc: Number(percT1.toFixed(2)) },
        tensoativo2: { nome: t2Nome, ehl: t2Val, proporcaoFormulaPerc: Number(percT2.toFixed(2)) }
      }
    };
  });

  // ==========================================
  // PERSISTÊNCIA SERVER-SIDE VIA API
  // ==========================================
  document.querySelectorAll('.btn-save-log').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!ultimoCalculoAtivo) {
        showAlert('Nenhum cálculo recente localizado para persistência.');
        return;
      }

      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = 'Registrando...';

      try {
        const payload = {
          action: 'salvarCalculoFarmacotecnico',
          token: session.token,
          calculo: ultimoCalculoAtivo
        };

        const response = await Api.post(payload);
        if (response.sucesso) {
          showAlert(`Cálculo gravado com sucesso! Protocolo: ${response.idLog}`, 'success');
        } else {
          showAlert(`Falha ao registrar cálculo: ${response.erro}`);
        }
      } catch (err) {
        showAlert('Erro de conexão ao tentar registrar log técnico.');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  });
});
