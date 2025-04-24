// Script para verificar autenticação na página principal
document.addEventListener('DOMContentLoaded', function() {
  // Obter o caminho base para redirecionamentos
  const basePath = getBasePath();
  
  // Verificar se o usuário está logado
  if (localStorage.getItem('loggedIn') !== 'true') {
    // Redirecionar para a página de login se não estiver logado
    window.location.href = basePath + 'login.html';
    return;
  }
  
  // Adicionar opção de logout no canto superior direito
  const username = localStorage.getItem('username') || 'Usuário';
  
  // Criar elemento para o usuário e logout
  const userElement = document.createElement('div');
  userElement.className = 'user-info';
  userElement.innerHTML = `
    <span class="username">${username}</span>
    <button id="logout-button" title="Sair">Sair</button>
  `;
  
  // Adicionar ao corpo do documento
  document.body.appendChild(userElement);
  
  // Estilizar o elemento
  userElement.style.position = 'fixed';
  userElement.style.top = '50px'; // Aumentado para evitar sobreposição com o dropdown dos anos
  userElement.style.right = '10px';
  userElement.style.background = 'rgba(255, 255, 255, 0.9)';
  userElement.style.padding = '5px 10px';
  userElement.style.borderRadius = '4px';
  userElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  userElement.style.zIndex = '999'; // Reduzido para ficar abaixo de outros elementos importantes
  userElement.style.display = 'flex';
  userElement.style.alignItems = 'center';
  userElement.style.gap = '10px';
  
  // Estilizar o nome de usuário
  const usernameSpan = userElement.querySelector('.username');
  usernameSpan.style.fontWeight = 'bold';
  usernameSpan.style.color = '#2c3e50';
  
  // Estilizar o botão de logout
  const logoutButton = document.getElementById('logout-button');
  logoutButton.style.background = '#e74c3c';
  logoutButton.style.color = 'white';
  logoutButton.style.border = 'none';
  logoutButton.style.borderRadius = '3px';
  logoutButton.style.padding = '3px 8px';
  logoutButton.style.cursor = 'pointer';
  logoutButton.style.fontSize = '12px';
  
  // Adicionar evento de hover ao botão
  logoutButton.addEventListener('mouseover', function() {
    this.style.background = '#c0392b';
  });
  
  logoutButton.addEventListener('mouseout', function() {
    this.style.background = '#e74c3c';
  });
  
  // Adicionar funcionalidade de logout
  logoutButton.addEventListener('click', function() {
    // Limpar dados de login
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    
    // Redirecionar para a página de login
    window.location.href = basePath + 'login.html';
  });
});

// Função para obter o caminho base para redirecionamentos
function getBasePath() {
  // Obter o caminho atual
  const path = window.location.pathname;
  
  // Se estamos em um ambiente GitHub Pages ou similar
  if (path.includes('/mapa-vendas/') || path.includes('/mapa-vendas-main/')) {
    // Extrair o caminho base até o diretório do projeto
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
