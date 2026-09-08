/**
 * Utilitários de Validação, Formatação e Sanitização
 */
const Utils = {
  formatNumber(value, decimals = 2) {
    const num = parseFloat(value);
    if (isNaN(num)) return "0,00";
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  parseLocaleNumber(strValue) {
    if (typeof strValue === 'number') return strValue;
    if (!strValue) return 0;
    const cleanStr = strValue.toString().replace(/\./g, '').replace(',', '.').trim();
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  },

  sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },

  showAlert(containerId, message, type = 'danger') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
      <div class="alert alert-${type}" role="alert">
        ${this.sanitizeInput(message)}
      </div>
    `;
  },

  clearAlert(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';
  }
};
