const data = [
  {
    tipo: 'RC',
    nome: 'Carlos Silva',
    cidade: 'São Paulo',
    estado: 'SP',
    telefone: '(11) 91234-5678',
    coordenadas: [-23.5505, -46.6333],
  },
  {
    tipo: 'Revenda',
    nome: 'Revenda Agrícola Sul',
    cidade: 'Porto Alegre',
    estado: 'RS',
    telefone: '(51) 99876-5432',
    coordenadas: [-30.0346, -51.2177],
  },
  {
    tipo: 'RC',
    nome: 'Joana Martins',
    cidade: 'Curitiba',
    estado: 'PR',
    telefone: '(41) 98765-4321',
    coordenadas: [-25.4284, -49.2733],
  },
  {
    tipo: 'Revenda',
    nome: 'Máquinas Centro-Oeste',
    cidade: 'Goiânia',
    estado: 'GO',
    telefone: '(62) 91234-5678',
    coordenadas: [-16.6869, -49.2648],
  },
];

let map;
let markers = [];

function initMap() {
  map = L.map('map').setView([-15.7797, -47.9297], 5); // Centro do Brasil

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  renderMarkers(data);
}

function renderMarkers(filteredData) {
  // Limpa marcadores anteriores
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  filteredData.forEach(entry => {
    const marker = L.marker(entry.coordenadas).addTo(map);
    const tipoClass = entry.tipo === 'RC' ? 'rc-marker' : 'revenda-marker';
    const popupContent = `
      <div class="${tipoClass}">
        <strong>${entry.nome}</strong><br/>
        ${entry.cidade} - ${entry.estado}<br/>
        Tel: ${entry.telefone}<br/>
        Tipo: ${entry.tipo}
      </div>
    `;
    marker.bindPopup(popupContent);
    markers.push(marker);
  });
}

function applyFilter() {
  const filter = document.getElementById('filter').value;
  if (filter === 'Todos') {
    renderMarkers(data);
  } else {
    const filtered = data.filter(entry => entry.tipo === filter);
    renderMarkers(filtered);
  }
}

// Inicializa o mapa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initMap);
