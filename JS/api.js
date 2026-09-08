/**
 * Camada de Comunicação com o Google Apps Script (Web App)
 * Contorna preflight CORS utilizando Content-Type: text/plain
 */
const API = {
  async post(action, payload = {}) {
    const session = Auth.getSession();
    const envelope = {
      action: action,
      token: session ? session.token : null,
      matricula: session ? session.matricula : "ANONIMO",
      timestamp: new Date().toISOString(),
      data: payload
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.TIMEOUT_MS);

    try {
      const response = await fetch(APP_CONFIG.GAS_EXEC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(envelope),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const jsonResponse = await response.json();
      if (!jsonResponse.success) {
        throw new Error(jsonResponse.message || "Erro no processamento da solicitação.");
      }

      return jsonResponse.data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("Tempo limite de resposta excedido. Verifique sua conexão com o servidor.");
      }
      console.error(`Falha na API [${action}]:`, error);
      throw error;
    }
  }
};
