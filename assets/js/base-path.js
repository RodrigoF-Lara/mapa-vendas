// Função para obter o caminho base para redirecionamentos
function getBasePath() {
    const path = window.location.pathname;
  
    // Se estamos em um ambiente GitHub Pages ou similar
    if (path.includes('/mapa-vendas/') || path.includes('/mapa-vendas-main/')) {
      const pathParts = path.split('/');
      let basePath = '/';
  
      for (let i = 1; i < pathParts.length; i++) {
        if (pathParts[i] === 'mapa-vendas' || pathParts[i] === 'mapa-vendas-main') {
          basePath += pathParts[i] + '/';
          break;
        } else if (pathParts[i] !== '') {
          basePath += pathParts[i] + '/';
        }
      }
  
      return basePath;
    }
  
    // Para ambiente local ou outros ambientes
    return '';
  }