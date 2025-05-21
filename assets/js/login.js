// Script para autenticação na página de login
document.addEventListener('DOMContentLoaded', function() {
  // Obter o caminho base para redirecionamentos
  const basePath = getBasePath();
  
  // Verificar se o usuário já está logado
  if (localStorage.getItem('loggedIn') === 'true') {
    // Redirecionar para a página principal
    window.location.href = basePath + 'index.html';
    return;
  }
  
  // Elementos do DOM
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const usernameError = document.getElementById('username-error');
  const passwordError = document.getElementById('password-error');
  const loginButton = document.getElementById('login-button');
  const loginMessage = document.getElementById('login-message');
  
  // Credenciais válidas (conforme solicitado pelo usuário)
  const validUsername = 'marcher';
  const validPassword = '123';
  
  // Função para validar o formulário
  function validateForm() {
    let isValid = true;
    
    // Limpar mensagens de erro anteriores
    usernameError.textContent = '';
    passwordError.textContent = '';
    loginMessage.textContent = '';
    loginMessage.className = 'login-message';
    
    // Validar nome de usuário
    if (!usernameInput.value.trim()) {
      usernameError.textContent = 'Por favor, digite seu nome de usuário';
      isValid = false;
    }
    
    // Validar senha
    if (!passwordInput.value) {
      passwordError.textContent = 'Por favor, digite sua senha';
      isValid = false;
    }
    
    return isValid;
  }
  
  // Função para tentar login
  function attemptLogin() {
    if (!validateForm()) {
      return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Verificar credenciais
    if (username === validUsername && password === validPassword) {
      // Login bem-sucedido
      loginMessage.textContent = 'Login bem-sucedido! Redirecionando...';
      loginMessage.className = 'login-message success';
      
      // Armazenar estado de login
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
      
      // Redirecionar após um breve atraso para mostrar a mensagem de sucesso
      setTimeout(() => {
        window.location.href = basePath + 'index.html';
      }, 1000);
    } else {
      // Login falhou
      loginMessage.textContent = 'Usuário ou senha incorretos';
      loginMessage.className = 'login-message error';
      
      // Limpar senha para nova tentativa
      passwordInput.value = '';
      passwordInput.focus();
    }
  }
  
  // Adicionar evento de clique ao botão de login
  loginButton.addEventListener('click', attemptLogin);
  
  // Permitir login ao pressionar Enter
  passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      attemptLogin();
    }
  });
  
  // Focar no campo de usuário ao carregar a página
  usernameInput.focus();
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
