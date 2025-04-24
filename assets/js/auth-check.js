// Script para verificar autenticação na página principal
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se o usuário está logado
  if (localStorage.getItem('loggedIn') !== 'true') {
    // Redirecionar para a página de login se não estiver logado
    window.location.href = 'login.html';
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
  userElement.style.top = '10px';
  userElement.style.right = '10px';
  userElement.style.background = 'rgba(255, 255, 255, 0.9)';
  userElement.style.padding = '5px 10px';
  userElement.style.borderRadius = '4px';
  userElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  userElement.style.zIndex = '1000';
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
    window.location.href = 'login.html';
  });
});
