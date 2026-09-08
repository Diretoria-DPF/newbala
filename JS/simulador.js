/**
 * LÓGICA E MOTORES DE CÁLCULO - SIMULADOR FARMACOTÉCNICO
 * Liga Acadêmica de Farmácia
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicialização de Sessão
  const session = Auth.requireAuth();
  if (session) {
    document.getElementById("lblUsuario").textContent = `${session.nome} (${session.matricula})`;
  }
  document.getElementById("lblAno").textContent = new Date().getFullYear();

  document.getElementById("btnVoltarPortal").addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  // 2. Gerenciador de Abas
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => {
        p.style.display = "none";
        p.classList.remove("active");
      });

      btn.classList.add("active");
      const target = document.getElementById(btn.getAttribute("data-tab"));
      if (target) {
        target.style.display = "block";
        target.classList.add("active");
      }
    });
  });

  // -------------------------------------------------------------
  // MOTOR 1: DILUIÇÃO ALCOÓLICA (GAY-LUSSAC & INPM)
  // -------------------------------------------------------------
  const formAlcool = document.getElementById("form-alcool");
  const alcModo = document.getElementById("alc-modo");
  
  alcModo.addEventListener("change", () => {
    const isMassa = alcModo.value === "massa";
    document.getElementById("help-c1").textContent = isMassa ? "Ex: 92.8°INPM" : "Ex: 96.0°GL";
    document.getElementById("help-c2").textContent = isMassa ? "Ex: 70.0°INPM" : "Ex: 70.0°GL";
    document.getElementById("help-qtd").textContent = isMassa ? "Massa total em gramas" : "Volume final em mL";
  });

  formAlcool.addEventListener("submit", async (e) => {
    e.preventDefault();
    Utils.clearAlert("alert-alcool");

    const modo = alcModo.value;
    const cPartida = parseFloat(document.getElementById("alc-c-partida").value);
    const cFinal = parseFloat(document.getElementById("alc-c-final").value);
    const qtdFinal = parseFloat(document.getElementById("alc-qtd-final").value);

    // Validações Farmacotécnicas
    if (isNaN(cPartida) || isNaN(cFinal) || isNaN(qtdFinal)) {
      Utils.showAlert("alert-alcool", "Todos os parâmetros devem conter valores numéricos válidos.");
      return;
    }
    if (cPartida <= 0 || cFinal <= 0 || qtdFinal <= 0) {
      Utils.showAlert("alert-alcool", "As concentrações e quantidades devem ser estritamente maiores que zero.");
      return;
    }
    if (cFinal >= cPartida) {
      Utils.showAlert("alert-alcool", "A concentração desejada (C2) deve ser estritamente menor que a de partida (C1) para caracterizar diluição.");
      return;
    }

    let qtdPartida = 0;
    let trace = "";

    if (modo === "volume") {
      // V1 * C1 = V2 * C2 => V1 = (V2 * C2) / C1
      qtdPartida = (qtdFinal * cFinal) / cPartida;
      trace = `[DILUIÇÃO VOLUMÉTRICA °GL]\n` +
              `Fórmula: V1 = (V2 × C2) / C1\n` +
              `V1 = (${qtdFinal.toFixed(2)} mL × ${cFinal.toFixed(2)}°GL) / ${cPartida.toFixed(2)}°GL\n` +
              `V1 = ${(qtdFinal * cFinal).toFixed(4)} / ${cPartida.toFixed(2)}\n` +
              `Volume de Álcool de Partida = ${qtdPartida.toFixed(2)} mL\n` +
              `Água purificada: Adicionar até completar Q.S.P. ${qtdFinal.toFixed(2)} mL no menisco a 20°C.\n` +
              `*Nota: Não subtrair volumes diretamente devido à contração volumétrica.*`;

      document.getElementById("lbl-res-partida").textContent = "Volume de Álcool de Partida:";
      document.getElementById("val-res-partida").textContent = `${Utils.formatNumber(qtdPartida, 2)} mL`;
      document.getElementById("lbl-res-diluente").textContent = "Água Purificada:";
      document.getElementById("val-res-diluente").textContent = `Q.S.P. ${Utils.formatNumber(qtdFinal, 2)} mL`;
      document.getElementById("box-alerta-volume").style.display = "block";
    } else {
      // m1 * INPM1 = m2 * INPM2 => m1 = (m2 * INPM2) / INPM1
      // Na gravimetria, as massas são aditivas: m_agua = m2 - m1
      qtdPartida = (qtdFinal * cFinal) / cPartida;
      const massaAgua = qtdFinal - qtdPartida;
      trace = `[DILUIÇÃO GRAVIMÉTRICA °INPM]\n` +
              `Fórmula: M1 = (M2 × INPM2) / INPM1\n` +
              `M1 = (${qtdFinal.toFixed(2)} g × ${cFinal.toFixed(2)}) / ${cPartida.toFixed(2)}\n` +
              `M1 = ${qtdPartida.toFixed(3)} g de Álcool de partida\n\n` +
              `Cálculo de Massa de Água (Conservação de Massa):\n` +
              `M_agua = M2 - M1 = ${qtdFinal.toFixed(2)} g - ${qtdPartida.toFixed(3)} g\n` +
              `M_agua = ${massaAgua.toFixed(3)} g de Água Purificada.`;

      document.getElementById("lbl-res-partida").textContent = "Massa de Álcool de Partida:";
      document.getElementById("val-res-partida").textContent = `${Utils.formatNumber(qtdPartida, 2)} g`;
      document.getElementById("lbl-res-diluente").textContent = "Massa de Água Purificada:";
      document.getElementById("val-res-diluente").textContent = `${Utils.formatNumber(massaAgua, 2)} g`;
      document.getElementById("box-alerta-volume").style.display = "none";
    }

    document.getElementById("trace-alcool").textContent = trace;
    document.getElementById("res-alcool-placeholder").style.display = "none";
    document.getElementById("res-alcool-content").style.display = "block";

    // Persistência assíncrona para auditoria discente
    API.post("logCalculo", {
      modulo: "alcoolometria",
      modo: modo,
      c1: cPartida,
      c2: cFinal,
      qtdFinal: qtdFinal,
      qtdPartidaCalculada: qtdPartida
    }).catch(err => console.warn("Log de cálculo não persistido (modo offline):", err.message));
  });

  // -------------------------------------------------------------
  // MOTOR 2: FATORES DE CORREÇÃO (UMIDADE, TEOR) E EQUIVALÊNCIA
  // -------------------------------------------------------------
  const formFatores = document.getElementById("form-fatores");

  formFatores.addEventListener("submit", async (e) => {
    e.preventDefault();
    Utils.clearAlert("alert-fatores");

    const mPrescrita = parseFloat(document.getElementById("fat-prescrito").value);
    const umidade = parseFloat(document.getElementById("fat-umidade").value) || 0;
    const pureza = parseFloat(document.getElementById("fat-pureza").value);
    const pmSal = parseFloat(document.getElementById("fat-pm-sal").value);
    const pmBase = parseFloat(document.getElementById("fat-pm-base").value);

    // Validações
    if (mPrescrita <= 0) {
      Utils.showAlert("alert-fatores", "A massa prescrita deve ser maior que zero.");
      return;
    }
    if (umidade < 0 || umidade >= 100) {
      Utils.showAlert("alert-fatores", "O teor de umidade deve estar no intervalo [0% a 99.9%].");
      return;
    }
    if (pureza <= 0 || pureza > 100) {
      Utils.showAlert("alert-fatores", "O teor de pureza deve estar entre 0.1% e 100%.");
      return;
    }
    if (pmSal <= 0 || pmBase <= 0) {
      Utils.showAlert("alert-fatores", "Os pesos moleculares do sal e da base devem ser estritamente positivos.");
      return;
    }
    if (pmSal < pmBase) {
      Utils.showAlert("alert-fatores", "O PM do sal/hidrato não pode ser menor que o da forma base ativa.");
      return;
    }

    // FCu = 100 / (100 - %U)
    const fcu = 100 / (100 - umidade);
    // FCt = 100 / %Teor
    const fct = 100 / pureza;
    // FEq = PM_Sal / PM_Base
    const feq = pmSal / pmBase;
    // Fator de Correção Global
    const fcg = fcu * fct * feq;
    // Massa final
    const massaCorrigida = mPrescrita * fcg;

    const trace = `[MEMORIAL DE CORREÇÃO]\n` +
                  `1. Fator de Umidade (FCu)    = 100 / (100 - ${umidade.toFixed(2)}) = ${fcu.toFixed(4)}\n` +
                  `2. Fator de Pureza (FCt)     = 100 / ${pureza.toFixed(2)} = ${fct.toFixed(4)}\n` +
                  `3. Fator de Equivalência (FEq) = ${pmSal.toFixed(2)} / ${pmBase.toFixed(2)} = ${feq.toFixed(4)}\n\n` +
                  `4. Fator Global (FCG) = FCu × FCt × FEq\n` +
                  `   FCG = ${fcu.toFixed(4)} × ${fct.toFixed(4)} × ${feq.toFixed(4)} = ${fcg.toFixed(4)}\n\n` +
                  `5. Massa a Pesar = Massa Prescrita × FCG\n` +
                  `   Massa a Pesar = ${mPrescrita.toFixed(2)} mg × ${fcg.toFixed(4)} = ${massaCorrigida.toFixed(2)} mg`;

    document.getElementById("val-fcu").textContent = fcu.toFixed(4);
    document.getElementById("val-fct").textContent = fct.toFixed(4);
    document.getElementById("val-feq").textContent = feq.toFixed(4);
    document.getElementById("val-fcg").textContent = fcg.toFixed(4);
    document.getElementById("val-massa-pesar").textContent = `${Utils.formatNumber(massaCorrigida, 2)} mg`;
    document.getElementById("trace-fatores").textContent = trace;

    document.getElementById("res-fatores-placeholder").style.display = "none";
    document.getElementById("res-fatores-content").style.display = "block";

    API.post("logCalculo", {
      modulo: "fatores",
      massaPrescrita: mPrescrita,
      fcu: fcu,
      fct: fct,
      feq: feq,
      fcg: fcg,
      massaCorrigida: massaCorrigida
    }).catch(err => console.warn("Log de cálculo não persistido (modo offline):", err.message));
  });

  // -------------------------------------------------------------
  // MOTOR 3: BALANÇO DE EHL DE TENSOATIVOS
  // -------------------------------------------------------------
  const formEhl = document.getElementById("form-ehl");

  formEhl.addEventListener("submit", async (e) => {
    e.preventDefault();
    Utils.clearAlert("alert-ehl");

    const ehlReq = parseFloat(document.getElementById("ehl-req").value);
    const mTotal = parseFloat(document.getElementById("ehl-massa-total").value);
    const nomeA = document.getElementById("ehl-nome-a").value.trim() || "Tensoativo A";
    const valA = parseFloat(document.getElementById("ehl-val-a").value);
    const nomeB = document.getElementById("ehl-nome-b").value.trim() || "Tensoativo B";
    const valB = parseFloat(document.getElementById("ehl-val-b").value);

    // Validações
    if (isNaN(ehlReq) || isNaN(mTotal) || isNaN(valA) || isNaN(valB)) {
      Utils.showAlert("alert-ehl", "Informe valores válidos para todos os campos do balanço.");
      return;
    }
    if (mTotal <= 0) {
      Utils.showAlert("alert-ehl", "A massa do par de tensoativos deve ser maior que zero.");
      return;
    }
    if (valA === valB) {
      Utils.showAlert("alert-ehl", "Os valores de EHL dos dois tensoativos não podem ser idênticos.");
      return;
    }

    const maiorEHL = Math.max(valA, valB);
    const menorEHL = Math.min(valA, valB);

    if (ehlReq < menorEHL || ehlReq > maiorEHL) {
      Utils.showAlert(
        "alert-ehl", 
        `Inviabilidade Farmacotécnica: O EHL requerido (${ehlReq.toFixed(1)}) está fora do intervalo dos tensoativos selecionados [${menorEHL.toFixed(1)} a ${maiorEHL.toFixed(1)}]. É impossível atingir este EHL.`
      );
      return;
    }

    // Resolução:
    // %A = [(EHL_req - EHL_B) / (EHL_A - EHL_B)] * 100
    const pctA = ((ehlReq - valB) / (valA - valB)) * 100;
    const pctB = 100 - pctA;
    const massaA = (pctA / 100) * mTotal;
    const massaB = (pctB / 100) * mTotal;
    const ehlReal = ((massaA * valA) + (massaB * valB)) / mTotal;

    const trace = `[RESOLUÇÃO DE EHL BINÁRIO]\n` +
                  `Sistema Linear: \n` +
                  `  (1) %A + %B = 100\n` +
                  `  (2) (%A × ${valA.toFixed(1)} + %B × ${valB.toFixed(1)}) / 100 = ${ehlReq.toFixed(1)}\n\n` +
                  `Deduzindo %A:\n` +
                  `  %A = [(${ehlReq.toFixed(1)} - ${valB.toFixed(1)}) / (${valA.toFixed(1)} - ${valB.toFixed(1)})] × 100\n` +
                  `  %A = [${(ehlReq - valB).toFixed(2)} / ${(valA - valB).toFixed(2)}] × 100 = ${pctA.toFixed(2)}%\n` +
                  `  %B = 100% - ${pctA.toFixed(2)}% = ${pctB.toFixed(2)}%\n\n` +
                  `Fracionamento Ponderal (Massa Total = ${mTotal.toFixed(2)} g):\n` +
                  `  Massa de ${nomeA} = ${mTotal.toFixed(2)} g × ${(pctA / 100).toFixed(4)} = ${massaA.toFixed(3)} g\n` +
                  `  Massa de ${nomeB} = ${mTotal.toFixed(2)} g × ${(pctB / 100).toFixed(4)} = ${massaB.toFixed(3)} g\n` +
                  `Conferência: (${massaA.toFixed(3)}g × ${valA}) + (${massaB.toFixed(3)}g × ${valB}) / ${mTotal.toFixed(2)}g = ${ehlReal.toFixed(2)}`;

    document.getElementById("lbl-ehl-res-a").textContent = `${nomeA}:`;
    document.getElementById("val-ehl-res-a").textContent = `${Utils.formatNumber(massaA, 3)} g (${pctA.toFixed(1)}%)`;
    document.getElementById("lbl-ehl-res-b").textContent = `${nomeB}:`;
    document.getElementById("val-ehl-res-b").textContent = `${Utils.formatNumber(massaB, 3)} g (${pctB.toFixed(1)}%)`;
    document.getElementById("val-ehl-blenda").textContent = ehlReal.toFixed(2);
    document.getElementById("trace-ehl").textContent = trace;

    document.getElementById("res-ehl-placeholder").style.display = "none";
    document.getElementById("res-ehl-content").style.display = "block";

    API.post("logCalculo", {
      modulo: "ehl",
      ehlRequerido: ehlReq,
      massaTotal: mTotal,
      massaA: massaA,
      massaB: massaB,
      ehlResultante: ehlReal
    }).catch(err => console.warn("Log de cálculo não persistido (modo offline):", err.message));
  });
});
