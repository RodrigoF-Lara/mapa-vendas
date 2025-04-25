document.addEventListener('DOMContentLoaded', function () {
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

  // Estilizar o elemento para ter menos altura
  userElement.style.position = 'fixed';
  userElement.style.top = '20px';
  userElement.style.right = '25px';
  userElement.style.background = 'rgba(255, 255, 255, 0.9)';
  userElement.style.padding = '2px 5px'; // Reduzir o padding vertical
  userElement.style.borderRadius = '4px';
  userElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  userElement.style.zIndex = '999';
  userElement.style.display = 'flex';
  userElement.style.alignItems = 'center';
  userElement.style.gap = '10px'; // Reduzir o gap entre elementos
  userElement.style.fontSize = '20px'; // Diminuir o tamanho da fonte
  userElement.style.lineHeight = '0.8'; // Ajustar a altura da linha

  // Estilizar o nome de usuário
  const usernameSpan = userElement.querySelector('.username');
  usernameSpan.style.fontWeight = 'bold';
  usernameSpan.style.color = '#2c3e50';
  usernameSpan.style.marginTop = '-5px'; // Ajustar a margem superior

  // Agora que o botão foi adicionado ao DOM, podemos acessá-lo
  const logoutButton = document.getElementById('logout-button');

  // Estilizar o botão de logout
  logoutButton.style.background = '#e74c3c';
  logoutButton.style.color = 'white';
  logoutButton.style.border = 'none';
  logoutButton.style.borderRadius = '3px';
  logoutButton.style.padding = '3px 8px';
  logoutButton.style.cursor = 'pointer';
  logoutButton.style.fontSize = '12px';
  logoutButton.style.display = 'flex';
  logoutButton.style.alignItems = 'center';
  logoutButton.style.height = '24px'; // Ajuste para centralizar verticalmente
  logoutButton.style.marginTop = '0px'; // Ajuste fino para mover o botão para cima

  // Adicionar evento de hover ao botão
  logoutButton.addEventListener('mouseover', function () {
    this.style.background = '#c0392b';
  });

  logoutButton.addEventListener('mouseout', function () {
    this.style.background = '#e74c3c';
  });

  // Adicionar funcionalidade de logout
  logoutButton.addEventListener('click', function () {
    // Limpar dados de login
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');

    // Redirecionar para a página de login
    window.location.href = basePath + 'login.html';
  });
});