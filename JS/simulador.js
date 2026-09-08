/**
 * LÓGICA DE INTERATIVIDADE, CÁLCULOS E CENÁRIOS DINÂMICOS
 * Bancada Virtual de Farmacotécnica Magistral
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Controle de Sessão Discente
  const session = Auth.requireAuth();
  if (session) {
    document.getElementById("lblUsuario").textContent = `${session.nome} (${session.matricula})`;
  }
  document.getElementById("lblAno").textContent = new Date().getFullYear();

  document.getElementById("btnVoltarPortal").addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  // 2. Navegação de Abas
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

  // 3. Efeitos Sonoros Nativos (Web Audio API - Sem Arquivos Externos)
  const AudioFeedback = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) this.ctx = new AudioContextClass();
      }
    },
    playSuccess() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch (e) {
        // Ignora silenciosamente se o navegador restringir áudio antes do clique
      }
    }
  };

  // =========================================================================
  // MÓDULO 1: ALCOOLOMETRIA & VIDRARIA ANIMADA
  // =========================================================================
  const formAlcool = document.getElementById("form-alcool");
  const alcModo = document.getElementById("alc-modo");
  const cPartidaInput = document.getElementById("alc-c-partida");
  const cFinalInput = document.getElementById("alc-c-final");
  const qtdFinalInput = document.getElementById("alc-qtd-final");

  // Presets Rápidos
  document.querySelectorAll("[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-preset");
      if (preset === "alcool-70-hosp") {
        alcModo.value = "volume";
        cPartidaInput.value = "96.0";
        cFinalInput.value = "70.0";
        qtdFinalInput.value = "1000";
        formAlcool.dispatchEvent(new Event("submit"));
      } else if (preset === "alcool-inpm-gel") {
        alcModo.value = "massa";
        cPartidaInput.value = "92.8";
        cFinalInput.value = "70.0";
        qtdFinalInput.value = "500";
        formAlcool.dispatchEvent(new Event("submit"));
      } else if (preset === "alcool-80-assep") {
        alcModo.value = "volume";
        cPartidaInput.value = "96.0";
        cFinalInput.value = "80.0";
        qtdFinalInput.value = "250";
        formAlcool.dispatchEvent(new Event("submit"));
      } else if (preset === "fat-doxiciclina") {
        document.getElementById("fat-prescrito").value = "100.0";
        document.getElementById("fat-umidade").value = "2.5";
        document.getElementById("fat-pureza").value = "98.5";
        document.getElementById("fat-pm-sal").value = "512.9";
        document.getElementById("fat-pm-base").value = "444.4";
        document.getElementById("form-fatores").dispatchEvent(new Event("submit"));
      } else if (preset === "fat-captopril") {
        document.getElementById("fat-prescrito").value = "25.0";
        document.getElementById("fat-umidade").value = "0.5";
        document.getElementById("fat-pureza").value = "97.5";
        document.getElementById("fat-pm-sal").value = "217.3";
        document.getElementById("fat-pm-base").value = "217.3";
        document.getElementById("form-fatores").dispatchEvent(new Event("submit"));
      } else if (preset === "fat-dipirona") {
        document.getElementById("fat-prescrito").value = "500.0";
        document.getElementById("fat-umidade").value = "5.0";
        document.getElementById("fat-pureza").value = "99.0";
        document.getElementById("fat-pm-sal").value = "351.4";
        document.getElementById("fat-pm-base").value = "333.3";
        document.getElementById("form-fatores").dispatchEvent(new Event("submit"));
      } else if (preset === "ehl-creme-facial") {
        document.getElementById("ehl-req").value = "10.5";
        document.getElementById("ehl-massa-total").value = "5.0";
        document.getElementById("ehl-val-a").value = "15.0";
        document.getElementById("ehl-val-b").value = "4.3";
        document.getElementById("form-ehl").dispatchEvent(new Event("submit"));
      } else if (preset === "ehl-cold-cream") {
        document.getElementById("ehl-req").value = "9.0";
        document.getElementById("ehl-massa-total").value = "8.0";
        document.getElementById("ehl-val-a").value = "15.0";
        document.getElementById("ehl-val-b").value = "4.3";
        document.getElementById("form-ehl").dispatchEvent(new Event("submit"));
      } else if (preset === "ehl-pomada") {
        document.getElementById("ehl-req").value = "12.0";
        document.getElementById("ehl-massa-total").value = "6.0";
        document.getElementById("ehl-val-a").value = "15.0";
        document.getElementById("ehl-val-b").value = "4.3";
        document.getElementById("form-ehl").dispatchEvent(new Event("submit"));
      }
    });
  });

  alcModo.addEventListener("change", () => {
    const isMassa = alcModo.value === "massa";
    document.getElementById("help-c1").textContent = isMassa ? "Teor gravimétrico (°INPM)" : "Graduação volumétrica (°GL)";
    document.getElementById("help-c2").textContent = isMassa ? "Concentração desejada (°INPM)" : "Concentração desejada (°GL)";
    document.getElementById("help-qtd").textContent = isMassa ? "Massa final (g)" : "Volume final (mL)";
  });

  formAlcool.addEventListener("submit", (e) => {
    e.preventDefault();
    Utils.clearAlert("alert-alcool");

    const modo = alcModo.value;
    const c1 = parseFloat(cPartidaInput.value);
    const c2 = parseFloat(cFinalInput.value);
    const qtdFinal = parseFloat(qtdFinalInput.value);

    if (isNaN(c1) || isNaN(c2) || isNaN(qtdFinal) || c1 <= 0 || c2 <= 0 || qtdFinal <= 0) {
      Utils.showAlert("alert-alcool", "Preencha valores numéricos positivos e válidos.");
      return;
    }
    if (c2 >= c1) {
      Utils.showAlert("alert-alcool", "A concentração desejada (C2) deve ser menor que a concentração de partida (C1).");
      return;
    }

    const qtdPartida = (qtdFinal * c2) / c1;
    const unidade = modo === "volume" ? "mL" : "g";

    let memorial = "";
    if (modo === "volume") {
      memorial = `1. C1 × V1 = C2 × V2\n` +
                 `   V1 = (${qtdFinal.toFixed(2)} mL × ${c2.toFixed(2)}°GL) / ${c1.toFixed(2)}°GL\n` +
                 `   V1 = ${qtdPartida.toFixed(2)} mL de Álcool de estoque.\n\n` +
                 `2. Diluente: Transferir ${qtdPartida.toFixed(2)} mL para balão de ${qtdFinal.toFixed(0)} mL\n` +
                 `   e verter água purificada vagarosamente sob agitação constante até Q.S.P. ${qtdFinal.toFixed(2)} mL no menisco.\n` +
                 `   *Nota Técnica: Ocorrência de contração volumétrica por quebra de pontes de hidrogênio.*`;
      
      document.getElementById("disp-val-partida").textContent = `${Utils.formatNumber(qtdPartida, 2)} mL`;
      document.getElementById("disp-val-agua").textContent = `Q.S.P. ${Utils.formatNumber(qtdFinal, 2)} mL`;
    } else {
      const massaAgua = qtdFinal - qtdPartida;
      memorial = `1. C1 × M1 = C2 × M2\n` +
                 `   M1 = (${qtdFinal.toFixed(2)} g × ${c2.toFixed(2)}°INPM) / ${c1.toFixed(2)}°INPM\n` +
                 `   M1 = ${qtdPartida.toFixed(3)} g de Álcool de partida.\n\n` +
                 `2. Conservação Gravimétrica:\n` +
                 `   M_água = M_total - M1 = ${qtdFinal.toFixed(2)} g - ${qtdPartida.toFixed(3)} g\n` +
                 `   M_água = ${massaAgua.toFixed(3)} g de Água Purificada.`;

      document.getElementById("disp-val-partida").textContent = `${Utils.formatNumber(qtdPartida, 2)} g`;
      document.getElementById("disp-val-agua").textContent = `${Utils.formatNumber(massaAgua, 2)} g`;
    }

    // Animação de Vidraria Interativa
    const pctPartida = Math.min((qtdPartida / qtdFinal), 0.95);
    const flaskHeightTotal = 145; // pixels úteis do bojo até a linha de calibração
    const alcHeight = flaskHeightTotal * pctPartida;
    const waterHeight = flaskHeightTotal - alcHeight;

    const rectAlc = document.getElementById("flask-liquid-alcohol");
    const rectWater = document.getElementById("flask-liquid-water");
    const meniscus = document.getElementById("flask-meniscus");
    const cylLiquid = document.getElementById("cylinder-liquid");

    // 1° Estágio: Proveta enche com álcool de partida
    cylLiquid.setAttribute("y", `${205 - (180 * pctPartida)}`);
    cylLiquid.setAttribute("height", `${180 * pctPartida}`);

    // 2° Estágio: Balão recebe a fração e completa com água
    setTimeout(() => {
      rectAlc.setAttribute("y", `${210 - alcHeight}`);
      rectAlc.setAttribute("height", `${alcHeight}`);

      rectWater.setAttribute("y", `${210 - flaskHeightTotal}`);
      rectWater.setAttribute("height", `${waterHeight}`);

      meniscus.setAttribute("cy", `${210 - flaskHeightTotal}`);
      meniscus.setAttribute("opacity", "0.9");

      document.getElementById("status-qualidade-alcool").style.display = "block";
      AudioFeedback.playSuccess();
    }, 400);

    document.getElementById("trace-alcool").textContent = memorial;
    document.getElementById("box-memorial-alcool").style.display = "block";

    API.post("logCalculo", {
      modulo: "alcoolometria",
      modo: modo,
      c1: c1,
      c2: c2,
      qtdFinal: qtdFinal,
      qtdPartidaCalculada: qtdPartida
    }).catch(err => console.warn("Modo offline:", err.message));
  });

  document.getElementById("btn-reset-alcool").addEventListener("click", () => {
    document.getElementById("flask-liquid-alcohol").setAttribute("height", "0");
    document.getElementById("flask-liquid-alcohol").setAttribute("y", "210");
    document.getElementById("flask-liquid-water").setAttribute("height", "0");
    document.getElementById("flask-liquid-water").setAttribute("y", "210");
    document.getElementById("flask-meniscus").setAttribute("opacity", "0");
    document.getElementById("cylinder-liquid").setAttribute("height", "0");
    document.getElementById("cylinder-liquid").setAttribute("y", "205");
    document.getElementById("disp-val-partida").textContent = "0,00 mL";
    document.getElementById("disp-val-agua").textContent = "0,00 mL";
    document.getElementById("status-qualidade-alcool").style.display = "none";
    document.getElementById("box-memorial-alcool").style.display = "none";
  });

  // =========================================================================
  // MÓDULO 2: BALANÇA ANALÍTICA & FATORES DE CORREÇÃO
  // =========================================================================
  const formFatores = document.getElementById("form-fatores");

  formFatores.addEventListener("submit", (e) => {
    e.preventDefault();
    Utils.clearAlert("alert-fatores");

    const mPrescrita = parseFloat(document.getElementById("fat-prescrito").value);
    const umidade = parseFloat(document.getElementById("fat-umidade").value) || 0;
    const pureza = parseFloat(document.getElementById("fat-pureza").value);
    const pmSal = parseFloat(document.getElementById("fat-pm-sal").value);
    const pmBase = parseFloat(document.getElementById("fat-pm-base").value);

    if (mPrescrita <= 0 || pureza <= 0 || pmSal <= 0 || pmBase <= 0) {
      Utils.showAlert("alert-fatores", "Os parâmetros devem ser estritamente maiores que zero.");
      return;
    }
    if (umidade >= 100) {
      Utils.showAlert("alert-fatores", "Teor de umidade não pode ser igual ou superior a 100%.");
      return;
    }
    if (pmSal < pmBase) {
      Utils.showAlert("alert-fatores", "O PM do sal não pode ser inferior ao da base ativa correspondente.");
      return;
    }

    const fcu = 100 / (100 - umidade);
    const fct = 100 / pureza;
    const feq = pmSal / pmBase;
    const fcg = fcu * fct * feq;
    const massaPesarMg = mPrescrita * fcg;
    const massaPesarGramas = massaPesarMg / 1000;

    const memorial = `1. FCu = 100 / (100 - ${umidade.toFixed(2)}) = ${fcu.toFixed(4)}\n` +
                     `2. FCt = 100 / ${pureza.toFixed(2)} = ${fct.toFixed(4)}\n` +
                     `3. FEq = ${pmSal.toFixed(2)} / ${pmBase.toFixed(2)} = ${feq.toFixed(4)}\n\n` +
                     `Fator Global (FCG) = ${fcu.toFixed(4)} × ${fct.toFixed(4)} × ${feq.toFixed(4)} = ${fcg.toFixed(4)}\n` +
                     `Massa Final Corrigida = ${mPrescrita.toFixed(2)} mg × ${fcg.toFixed(4)} = ${massaPesarMg.toFixed(2)} mg (${massaPesarGramas.toFixed(4)} g)`;

    document.getElementById("disp-fcg").textContent = fcg.toFixed(4);
    document.getElementById("disp-massa-mg").textContent = `${Utils.formatNumber(massaPesarMg, 2)} mg`;
    document.getElementById("trace-fatores").textContent = memorial;
    document.getElementById("box-memorial-fatores").style.display = "block";

    // Animação da Balança Digital e Acúmulo de Pó
    const displayDigits = document.getElementById("disp-balanca-valor");
    const powder = document.getElementById("balance-powder");
    let currentVal = 0.0;
    const targetVal = massaPesarGramas;
    const steps = 25;
    const stepIncrement = targetVal / steps;
    let stepCount = 0;

    powder.setAttribute("rx", "0");
    powder.setAttribute("ry", "0");

    const timer = setInterval(() => {
      stepCount++;
      currentVal += stepIncrement;
      if (stepCount >= steps) {
        currentVal = targetVal;
        clearInterval(timer);
        document.getElementById("status-qualidade-fatores").style.display = "block";
        AudioFeedback.playSuccess();
      }
      displayDigits.textContent = currentVal.toFixed(4);
      const rx = Math.min((stepCount / steps) * 35, 35);
      const ry = Math.min((stepCount / steps) * 7, 7);
      powder.setAttribute("rx", rx.toFixed(1));
      powder.setAttribute("ry", ry.toFixed(1));
    }, 30);

    API.post("logCalculo", {
      modulo: "fatores",
      massaPrescrita: mPrescrita,
      fcu: fcu,
      fct: fct,
      feq: feq,
      fcg: fcg,
      massaPesarMg: massaPesarMg
    }).catch(err => console.warn("Modo offline:", err.message));
  });

  document.getElementById("btn-tarar-balanca").addEventListener("click", () => {
    document.getElementById("disp-balanca-valor").textContent = "0.0000";
    const powder = document.getElementById("balance-powder");
    powder.setAttribute("rx", "0");
    powder.setAttribute("ry", "0");
    document.getElementById("disp-fcg").textContent = "1,0000";
    document.getElementById("disp-massa-mg").textContent = "0,00 mg";
    document.getElementById("status-qualidade-fatores").style.display = "none";
    document.getElementById("box-memorial-fatores").style.display = "none";
  });

  // =========================================================================
  // MÓDULO 3: BALANÇO DE EHL & AGITADOR MAGNÉTICO
  // =========================================================================
  const formEhl = document.getElementById("form-ehl");

  formEhl.addEventListener("submit", (e) => {
    e.preventDefault();
    Utils.clearAlert("alert-ehl");

    const ehlReq = parseFloat(document.getElementById("ehl-req").value);
    const mTotal = parseFloat(document.getElementById("ehl-massa-total").value);
    const nomeA = document.getElementById("ehl-nome-a").value.trim() || "Tensoativo A";
    const valA = parseFloat(document.getElementById("ehl-val-a").value);
    const nomeB = document.getElementById("ehl-nome-b").value.trim() || "Tensoativo B";
    const valB = parseFloat(document.getElementById("ehl-val-b").value);

    if (isNaN(ehlReq) || isNaN(mTotal) || isNaN(valA) || isNaN(valB) || mTotal <= 0) {
      Utils.showAlert("alert-ehl", "Parâmetros inconsistentes ou massa total nula.");
      return;
    }
    if (valA === valB) {
      Utils.showAlert("alert-ehl", "Os valores de EHL dos dois tensoativos não podem ser idênticos.");
      return;
    }

    const minEHL = Math.min(valA, valB);
    const maxEHL = Math.max(valA, valB);

    if (ehlReq < minEHL || ehlReq > maxEHL) {
      Utils.showAlert("alert-ehl", `EHL requerido (${ehlReq}) fora da amplitude física dos tensoativos [${minEHL} - ${maxEHL}].`);
      return;
    }

    const pctA = ((ehlReq - valB) / (valA - valB)) * 100;
    const pctB = 100 - pctA;
    const massaA = (pctA / 100) * mTotal;
    const massaB = (pctB / 100) * mTotal;
    const ehlReal = ((massaA * valA) + (massaB * valB)) / mTotal;

    const memorial = `1. Resolução do Sistema Binário:\n` +
                     `   %A = [(${ehlReq.toFixed(1)} - ${valB.toFixed(1)}) / (${valA.toFixed(1)} - ${valB.toFixed(1)})] × 100 = ${pctA.toFixed(2)}%\n` +
                     `   %B = 100% - ${pctA.toFixed(2)}% = ${pctB.toFixed(2)}%\n\n` +
                     `2. Massa Efetiva a Pesar:\n` +
                     `   ${nomeA} = ${mTotal.toFixed(2)} g × ${(pctA/100).toFixed(4)} = ${massaA.toFixed(3)} g\n` +
                     `   ${nomeB} = ${mTotal.toFixed(2)} g × ${(pctB/100).toFixed(4)} = ${massaB.toFixed(3)} g\n` +
                     `   EHL Verificado da Blenda = ${ehlReal.toFixed(2)}`;

    document.getElementById("disp-lbl-surfact-a").textContent = `${nomeA}:`;
    document.getElementById("disp-val-surfact-a").textContent = `${Utils.formatNumber(massaA, 3)} g (${pctA.toFixed(1)}%)`;
    document.getElementById("disp-lbl-surfact-b").textContent = `${nomeB}:`;
    document.getElementById("disp-val-surfact-b").textContent = `${Utils.formatNumber(massaB, 3)} g (${pctB.toFixed(1)}%)`;
    document.getElementById("disp-ehl-blenda").textContent = ehlReal.toFixed(2);

    document.getElementById("trace-ehl").textContent = memorial;
    document.getElementById("box-memorial-ehl").style.display = "block";

    // Acionamento do Vórtice e Agitador Magnético
    const stage = document.querySelector(".stirrer-stage");
    const vortex = document.getElementById("beaker-vortex");
    const liquid = document.getElementById("beaker-liquid");

    stage.classList.add("stirring");
    // Altera formato do topo para criar vórtice cônico
    vortex.setAttribute("d", "M 25,70 Q 70,120 115,70 L 115,175 L 25,175 Z");
    liquid.style.fill = "#ffffff"; // Aparência leitosa da emulsão

    setTimeout(() => {
      document.getElementById("status-qualidade-ehl").style.display = "block";
      AudioFeedback.playSuccess();
    }, 800);

    API.post("logCalculo", {
      modulo: "ehl",
      ehlReq: ehlReq,
      massaTotal: mTotal,
      massaA: massaA,
      massaB: massaB,
      ehlReal: ehlReal
    }).catch(err => console.warn("Modo offline:", err.message));
  });

  document.getElementById("btn-parar-agitador").addEventListener("click", () => {
    const stage = document.querySelector(".stirrer-stage");
    const vortex = document.getElementById("beaker-vortex");
    const liquid = document.getElementById("beaker-liquid");

    stage.classList.remove("stirring");
    vortex.setAttribute("d", "M 25,70 Q 70,70 115,70 L 115,175 L 25,175 Z");
    liquid.style.fill = "#e9ecef";
    document.querySelectorAll(".emulsion-droplet").forEach(d => d.style.opacity = "0");
    document.getElementById("status-qualidade-ehl").style.display = "none";
    document.getElementById("box-memorial-ehl").style.display = "none";
  });
});
