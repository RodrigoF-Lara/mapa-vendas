// Função para controlar o toggle do painel lateral
function togglePanel() {
  const appContainer = document.querySelector('.app-container');
  appContainer.classList.toggle('panel-collapsed');
  
  // Atualizar o ícone do botão
  const toggleIcon = document.querySelector('#toggle-panel .toggle-icon');
  if (appContainer.classList.contains('panel-collapsed')) {
    toggleIcon.textContent = '⮜';
  } else {
    toggleIcon.textContent = '⮞';
  }
  
  // Atualizar o layout do mapa após o toggle
  if (map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 300); // Esperar a transição terminar
  }
}

// Adicionar evento de clique ao botão de toggle
document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggle-panel');
  if (toggleButton) {
    toggleButton.addEventListener('click', togglePanel);
    

       // Verificar se o painel está colapsado ao carregar a página
    const appContainer = document.querySelector('.app-container');
    if (appContainer.classList.contains('panel-collapsed')) {
      // Garantir que o botão esteja visível quando o painel já inicia colapsado
      
 }
  }
});
