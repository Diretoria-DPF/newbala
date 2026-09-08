/**
 * Gerenciamento de Sessão de Usuário Local
 */
const Auth = {
  getSession() {
    try {
      const data = localStorage.getItem(APP_CONFIG.SESSION_STORAGE_KEY);
      if (!data) return null;
      const session = JSON.parse(data);
      // Validade simples: 8 horas
      if (Date.now() - session.timestamp > 8 * 60 * 60 * 1000) {
        this.logout();
        return null;
      }
      return session;
    } catch (e) {
      console.error("Falha ao recuperar sessão local:", e);
      return null;
    }
  },

  saveSession(matricula, nome, perfil, token) {
    const session = {
      matricula,
      nome,
      perfil,
      token,
      timestamp: Date.now()
    };
    localStorage.setItem(APP_CONFIG.SESSION_STORAGE_KEY, JSON.stringify(session));
  },

  logout() {
    localStorage.removeItem(APP_CONFIG.SESSION_STORAGE_KEY);
    window.location.href = "../index.html";
  },

  requireAuth(rolesPermitidos = []) {
    const session = this.getSession();
    if (!session) {
      // Mock de contingência acadêmica inicial caso acesse direto
      const fallbackSession = {
        matricula: "ALUNO-TEMP",
        nome: "Discente Farmacotécnica",
        perfil: "aluno",
        token: "OFFLINE_DEV_TOKEN",
        timestamp: Date.now()
      };
      this.saveSession(fallbackSession.matricula, fallbackSession.nome, fallbackSession.perfil, fallbackSession.token);
      return fallbackSession;
    }

    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(session.perfil)) {
      alert("Acesso restrito ao seu perfil acadêmico.");
      window.location.href = "../index.html";
      return null;
    }

    return session;
  }
};
