let dadosCSV = [];
let map;
let filtroAnoSelecionado = '';
let filtroMesSelecionado = 'todos';
let regiaoAtual = null;

// Ícone personalizado para os RCs
const rcIcon = L.divIcon({
  className: 'rc-marker',
  iconSize: [32, 20],
  iconAnchor: [6, 20],
  popupAnchor: [0, -20]
});

// Inicializa o mapa
function initMap() {
  const config = regiaoAtual || {
    view: [-30.0346, -51.2177],
    zoom: 6
  };
  
  map = L.map('map').setView(config.view, config.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

function carregarRegiao(regiaoId) {
  console.log('Carregando região:', regiaoId);
  if (!regiaoId || !configuracoesRegioes[regiaoId]) return;
  
  regiaoAtual = configuracoesRegioes[regiaoId];
  
  // Alterar o ID da div do mapa para a região selecionada
  const mapElement = document.querySelector('#map');
  mapElement.id = `map-${regiaoId}`; // Atualiza o ID da div do mapa para algo como map-rs_sul
  
  // Destruir o mapa existente e reiniciar
  if (map) {
    map.remove();
  }
  
  // Inicializar o novo mapa
  initMap();
  carregarDadosAPI();
}

// Carrega os dados da Google Sheets API
function carregarDadosAPI() {
  if (!regiaoAtual) return;
  
  const sheetId = regiaoAtual.planilhaId;
  const apiKey = 'AIzaSyAOPTDOnQXBBPj_hp0zzLBDL90KdV8Dzu0';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.values) {
        const headers = data.values[0];
        dadosCSV = data.values.slice(1).map(row => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || '';
            return obj;
          }, {});
        });
        popularFiltros();
        carregarGeoJSON();
        mostrarResumoEstado();
        gerarGraficoMensal();
      } else {
        console.error('Nenhum dado encontrado na planilha.');
      }
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}

// Carrega o GeoJSON com os limites dos municípios
function carregarGeoJSON() {
  if (!regiaoAtual) {
    console.error('Nenhuma região selecionada');
    return;
  }

  // Codifica o caminho para lidar com espaços e caracteres especiais
  const caminhoGeoJSON = encodeURI(regiaoAtual.geojsonPath);
  
  fetch(caminhoGeoJSON)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(geojson => {
      console.log('GeoJSON carregado:', geojson);

      // Criação dos marcadores dos RCs ESPECÍFICOS DA REGIÃO
      Object.entries(regiaoAtual.cidadesRC).forEach(([codigoIBGE, rc]) => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        if (feature) {
          // Verifica se o Turf.js está carregado
          if (!turf) {
            console.error('Turf.js não está carregado');
            return;
          }
          
          const centroid = turf.centroid(feature).geometry.coordinates;
          L.marker([centroid[1], centroid[0]], { icon: rcIcon })
            .bindPopup(`<strong>${feature.properties.NM_MUN}</strong><br><strong>RC:</strong> ${rc}`)
            .addTo(map);
        }
      });

      // Pintar as cidades onde os RCs moram (opção 1)
      L.geoJSON(geojson, {
        style: function(feature) {
          const codigoIBGE = feature.properties.CD_MUN;
          const destaqueRC = regiaoAtual.cidadesRC[codigoIBGE];

          return {
            fillColor: (destaqueRC ? '#ffeb3b' : '#9e9e9e'), // Cor amarela para cidade com vendas, cinza caso contrário
            fillOpacity: 0.7,
            weight: destaqueRC ? 15 : 1,  // Linha grossa (5px) nas cidades com RC, e mais fina (1px) para outras cidades
            color: destaqueRC ? '#FF6347' : 'black',  // Linha vermelha (para as cidades com RC), preta para outras
          };
        },
        onEachFeature: function(feature, layer) {
          const codigoIBGE = feature.properties.CD_MUN;
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === filtroAnoSelecionado &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );

          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            
            // A cidade com RC ainda terá borda vermelha grossa, mas a cor de preenchimento permanece amarela para vendas
            layer.setStyle({
              fillColor: totalQnt > 0 ? '#ffeb3b' : '#9e9e9e', // Amarelo para cidades com vendas, cinza caso contrário
              fillOpacity: 0.7,
              weight: regiaoAtual.cidadesRC[codigoIBGE] ? 5 : 1,  // Borda grossa se tiver RC
              color: regiaoAtual.cidadesRC[codigoIBGE] ? '#FF6347' : 'black',  // Borda vermelha para cidades com RC
            });

            const popupContent = `
              <div class="map-popup">
                <h4>${feature.properties.NM_MUN}</h4>
                <p>Quantidade: ${totalQnt}</p>
                ${regiaoAtual.cidadesRC[codigoIBGE] ? `<p>RC: ${regiaoAtual.cidadesRC[codigoIBGE]}</p>` : ''}
              </div>`;
            
            layer.bindPopup(popupContent);

            layer.on('click', function() {
              mostrarTabela(codigoIBGE);
              filtrarGraficoPorCidade(codigoIBGE);
            });
          }

          // Hover effects
          layer.on('mouseover', function() {
            this.setStyle({
              weight: 6,  // Aumenta a borda ao passar o mouse
              color: '#666'
            });
          });
          
          layer.on('mouseout', function() {
            this.setStyle({
              weight: regiaoAtual.cidadesRC[codigoIBGE] ? 5 : 1,  // Restaura a borda original
              color: regiaoAtual.cidadesRC[codigoIBGE] ? '#FF6347' : 'black',
            });
          });
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
      console.error('Caminho tentado:', regiaoAtual.geojsonPath);
    });
}

// Função para capturar o mapa e gerar o PDF
function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const regioes = Object.keys(configuracoesRegioes);

  // Função para capturar o mapa de cada região como imagem
  function capturarMapa(regiaoId) {
    return new Promise((resolve, reject) => {
      // A div do mapa de cada região tem um id no formato 'map-{regiaoId}'
      const mapElement = document.querySelector(`#map-${regiaoId}`);
      html2canvas(mapElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        resolve(imgData);
      }).catch(reject);
    });
  }

  // Itera sobre as regiões
  regioes.forEach((regiaoId, index) => {
    const regiao = configuracoesRegioes[regiaoId];
    
    // Adiciona uma nova página para cada região
    if (index > 0) doc.addPage();
    
    // Título da região
    doc.setFontSize(16);
    doc.text(`Dados da Região: ${regiao.nome}`, 20, 20);

    // Captura a imagem do mapa da região
    capturarMapa(regiaoId).then(imgData => {
      // Adiciona a imagem do mapa correspondente à região
      doc.addImage(imgData, 'PNG', 20, 30, 180, 100); // Ajuste a posição e o tamanho conforme necessário

      // Dados das cidades com RC
      let yPosition = 140;
      doc.setFontSize(12);
      doc.text('Cidades com RC:', 20, yPosition);

      Object.entries(regiao.cidadesRC).forEach(([codigoIBGE, rc], i) => {
        yPosition += 10;
        doc.text(`${i + 1}. Código IBGE: ${codigoIBGE} - RC: ${rc}`, 20, yPosition);
      });

      // Adiciona a tabela de vendas
      yPosition += 15;
      doc.text('Vendas:', 20, yPosition);
      yPosition += 10;

      // Exemplo de dados de vendas (isso deve vir da sua variável `dadosCSV` ou API)
      const vendasCidade = dadosCSV.filter(item => item['TB_CIDADES.CODIGO_IBGE'] === regiao.cidadesRC[regiaoId]);
      vendasCidade.forEach((venda, i) => {
        yPosition += 10;
        doc.text(`Venda ${i + 1}: ${venda['NOTA']} - Quantidade: ${venda.QNT} - Faturamento: ${venda.FATURAMENTO}`, 20, yPosition);
      });

    }).catch(error => {
      console.error('Erro ao capturar o mapa:', error);
    });
  });

  // Salva o PDF com o mapa e os dados
  doc.save('dados_regioes_com_mapas.pdf');
}

// Adiciona um ouvinte de evento para o botão de geração do PDF
document.getElementById('gerar-pdf').addEventListener('click', gerarPDF);
