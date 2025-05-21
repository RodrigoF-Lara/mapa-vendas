// Função para controlar o toggle do resumo
function toggleResumo() {
  const resumoContainer = document.querySelector('.resumo-top-container');
  resumoContainer.classList.toggle('resumo-collapsed');
  
  // Atualizar o layout do mapa após o toggle
  if (map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 300); // Esperar a transição terminar
  }
}

// Adicionar evento de clique ao botão de toggle
document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggle-resumo');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleResumo);
  }
});
