// Não declare novamente as variáveis que já foram declaradas em regioes-config.js
// As variáveis dadosCSV, map, filtrosAnosSelecionados, filtroMesSelecionado e regiaoAtual
// já são acessíveis pois o arquivo regioes-config.js é carregado antes

// Inicializa o ícone do marcador
const rcIcon = L.icon({
  iconUrl: 'data/rc/marcador_Jeison.svg', // Ícone do RC
  iconSize: [35, 51], // Tamanho do ícone (ajuste conforme necessário)
  iconAnchor: [12, 41], // Ponto de ancoragem do ícone (ajuste conforme necessário)
  popupAnchor: [1, -34] // Ponto de ancoragem do popup (ajuste conforme necessário)
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

// Carregar a região
function carregarRegiao(regiaoId) {
  console.log('Carregando região:', regiaoId);
  if (!regiaoId || !configuracoesRegioes[regiaoId]) return;
  
  regiaoAtual = configuracoesRegioes[regiaoId];
  
  if (map) {
    map.remove(); // Destruir o mapa existente
  }
  
  // Reiniciar variáveis
  dadosCSV = [];
  filtrosAnosSelecionados = []; // Inicializa array vazio para anos selecionados
  filtroMesSelecionado = 'todos';
  
  // Criar novo mapa
  initMap();
  carregarDadosAPI();
  
  // Carregar dados das rotas planejadas
  if (typeof carregarDadosRotasPlanejadas === 'function') {
    carregarDadosRotasPlanejadas();
  }
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
        console.log('Dados da API:', data.values); // Verifique os dados carregados
        const headers = data.values[0];
        dadosCSV = data.values.slice(1).map(row => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || '';
            return obj;
          }, {});
        });
        popularFiltros(); // Chama para popular os filtros de ano e mês
        atualizarVisualizacao(); // Atualiza o mapa, gráfico e resumo
      } else {
        console.error('Nenhum dado encontrado na planilha.');
      }
    })
    .catch(error => console.error('Erro ao carregar dados da API:', error));
}

// Função para popular os checkboxes de anos e o dropdown de meses
function popularFiltros() {
  // Obter anos únicos dos dados
  const anos = [...new Set(dadosCSV.map(item => item.ANO))].sort();
  const meses = [...new Set(dadosCSV.map(item => item.MÊS))].sort((a, b) => a - b);
  
  // Selecionar o ano atual ou o último ano disponível por padrão
  const anoAtual = new Date().getFullYear().toString();
  const anoDefault = anos.includes(anoAtual) ? anoAtual : anos[anos.length - 1];
  
  // Adicionar o ano padrão ao array de anos selecionados
  if (anoDefault) {
    filtrosAnosSelecionados = [anoDefault];
  }
  
  // Popular os checkboxes de anos
  const anosContainer = document.getElementById('anos-checkboxes');
  anosContainer.innerHTML = '';
  
  anos.forEach(ano => {
    const isChecked = filtrosAnosSelecionados.includes(ano);
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'ano-checkbox';
    checkboxDiv.innerHTML = `
      <input type="checkbox" id="ano-${ano}" value="${ano}" ${isChecked ? 'checked' : ''}>
      <label for="ano-${ano}" class="ano-checkbox-label">${ano}</label>
    `;
    anosContainer.appendChild(checkboxDiv);
    
    // Adicionar evento de change para o checkbox
    const checkbox = checkboxDiv.querySelector(`#ano-${ano}`);
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        // Adicionar ao array se não existir
        if (!filtrosAnosSelecionados.includes(ano)) {
          filtrosAnosSelecionados.push(ano);
        }
      } else {
        // Remover do array
        filtrosAnosSelecionados = filtrosAnosSelecionados.filter(a => a !== ano);
      }
      
      // Atualizar a legenda de cores
      atualizarLegendaAnos();
      
      // Atualizar automaticamente a visualização quando o checkbox for alterado
      atualizarVisualizacao();
    });
  });
  
  // Popular o dropdown de meses
  const selectMes = document.getElementById('filtro-mes');
  selectMes.innerHTML = `<option value="todos">Todos</option>` +
    meses.map(mes => `<option value="${mes}">${mes}</option>`).join('');
  
  filtroMesSelecionado = 'todos';
  
  selectMes.addEventListener('change', () => {
    filtroMesSelecionado = selectMes.value;
    // Atualizar automaticamente a visualização quando o mês for alterado
    atualizarVisualizacao();
  });
  
  // Inicializar a legenda de cores
  atualizarLegendaAnos();
}

// Função para atualizar a legenda de cores dos anos
function atualizarLegendaAnos() {
  const legendaContainer = document.getElementById('legenda-anos');
  legendaContainer.innerHTML = '';
  
  if (filtrosAnosSelecionados.length === 0) {
    legendaContainer.innerHTML = '<span>Nenhum ano selecionado</span>';
    return;
  }
  
  filtrosAnosSelecionados.forEach(ano => {
    const cor = coresAnos[ano] || '#999999'; // Cor padrão se não estiver definida
    
    const legendaItem = document.createElement('div');
    legendaItem.className = 'legenda-item';
    legendaItem.innerHTML = `
      <span class="legenda-cor" style="background-color: ${cor};"></span>
      <span>${ano}</span>
    `;
    
    legendaContainer.appendChild(legendaItem);
  });
}

// Função principal para atualizar toda a visualização
function atualizarVisualizacao() {
  if (!map) {
    return;
  }
  
  // Limpar o mapa mantendo apenas a camada base
  map.eachLayer(layer => {
    if (layer instanceof L.TileLayer) return;
    map.removeLayer(layer);
  });
  
  // Se não houver anos selecionados, apenas mostrar o mapa em branco
  if (filtrosAnosSelecionados.length === 0) {
    // Atualizar o resumo do estado mesmo sem anos selecionados
    const resumoContainer = document.getElementById('resumo-estado');
    if (resumoContainer) {
      resumoContainer.innerHTML = '<p>Selecione pelo menos um ano para visualizar dados no mapa.</p>';
    }
    
    // Mostrar marcadores de rotas planejadas se estiver ativado, mesmo sem anos selecionados
    if (typeof mostrarRotasPlanejadas !== 'undefined' && mostrarRotasPlanejadas && typeof mostrarMarcadoresRotasPlanejadas === 'function') {
      mostrarMarcadoresRotasPlanejadas();
    }
    return;
  }
  
  // Carregar o GeoJSON com as cores por ano
  carregarGeoJSONMultiplosAnos();
  
  // Atualizar o gráfico mensal
  gerarGraficoMensalMultiplosAnos();
  
  // Mostrar o resumo do estado com comparação entre anos
  mostrarResumoEstadoComparativo();
  
  // Mostrar marcadores de rotas planejadas se estiver ativado
  if (typeof mostrarRotasPlanejadas !== 'undefined' && mostrarRotasPlanejadas && typeof mostrarMarcadoresRotasPlanejadas === 'function') {
    mostrarMarcadoresRotasPlanejadas();
  }
}

// Carrega o GeoJSON com os limites dos municípios e aplica cores por ano
function carregarGeoJSONMultiplosAnos() {
  if (!regiaoAtual) {
    console.error('Nenhuma região selecionada');
    return;
  }

  const caminhoGeoJSON = encodeURI(regiaoAtual.geojsonPath);
  
  fetch(caminhoGeoJSON)
    .then(response => response.json())
    .then(geojson => {
      console.log('GeoJSON carregado:', geojson);

      // Cria marcadores para os RCs específicos da região
      Object.entries(regiaoAtual.cidadesRC).forEach(([codigoIBGE, rc]) => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        if (feature) {
          const centroid = turf.centroid(feature).geometry.coordinates;
          const icone = L.icon({
            iconUrl: regiaoAtual.marcadorIcone,
            iconSize: [32, 32] // Tamanho do ícone do RC
          });

          // Exibe o marcador com a imagem do RC
          const popupContent = ` 
            <strong>${feature.properties.NM_MUN}</strong><br>
            <strong>📦 Quantidade Vendida:</strong> ${0}<br>
            <strong>💰 Faturamento:</strong> ${0}<br><br>
            <img src="${regiaoAtual.imagem}" alt="Imagem do local de vendas" width="200" />
          `;
          
          L.marker([centroid[1], centroid[0]], { icon: icone })
            .bindPopup(popupContent)
            .addTo(map);
        }
      });

      // Para cada cidade, verificar vendas em cada ano selecionado
      geojson.features.forEach(feature => {
        const codigoIBGE = feature.properties.CD_MUN;
        
        // Para cada ano selecionado, criar uma camada separada com cor diferente
        filtrosAnosSelecionados.forEach(ano => {
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === ano &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );
          
          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            const totalFat = vendasCidade.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
            const formatadoFAT = totalFat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            // Usar a cor específica para o ano
            const cor = coresAnos[ano] || '#999999';
            
            // Criar um polígono para este ano específico
            const layer = L.geoJSON(feature, {
              style: {
                fillColor: cor,
                fillOpacity: 0.7,
                weight: 1,
                color: 'black'
              }
            }).addTo(map);
            
            // Adicionar popup com informações do ano específico
            layer.bindPopup(`
              <strong>${feature.properties.NM_MUN} - ${ano}</strong><br>
              <strong>📦 Quantidade Vendida:</strong> ${totalQnt}<br>
              <strong>💰 Faturamento:</strong> ${formatadoFAT}<br>
            `);
            
            // Adicionar evento de clique para mostrar os dados na tabela
            layer.on('click', function() {
              exibirDadosNaTabela(vendasCidade, ano);
            });
          }
        });
      });
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
    });
}

// Função para exibir dados na tabela com os novos cabeçalhos
function exibirDadosNaTabela(vendas, ano) {
  const tabelaContainer = document.getElementById('dados-cidade');
  
  if (vendas.length === 0) {
    tabelaContainer.innerHTML = '<p>Sem dados para exibir com os filtros selecionados.</p>';
    return;
  }
  
  // Usar a cor específica para o ano no cabeçalho
  const cor = coresAnos[ano] || '#999999';
  
  let html = `<h3>Vendas de ${ano}</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr style="background-color: ${cor}20;">
            <th>NOTA</th>
            <th>PEDIDO</th>
            <th>CLIENTE</th>
            <th>CIDADE</th>
            <th>DESCRIÇÃO</th>
            <th>QNT</th>
            <th>FATURAMENTO</th>
            <th>DATA</th>
          </tr>
        </thead>
        <tbody>`;
  
  vendas.forEach(item => {
    html += `
          <tr>
            <td>${item.NOTA || ''}</td>
            <td>${item.PEDIDO || ''}</td>
            <td>${item.CLIENTE || ''}</td>
            <td>${item.CIDADE || ''}</td>
            <td>${item['DESCRIÇÃO'] || item.PRODUTO || ''}</td>
            <td>${item.QNT || '0'}</td>
            <td>${parseFloat((item.FATURAMENTO || '0').replace('.', '').replace(',', '.')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${formatarData(item.DATA || '')}</td>
          </tr>`;
  });
  
  // Calcular totais
  const totalQnt = vendas.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
  const totalFat = vendas.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
  const formatadoFAT = totalFat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  // Adicionar linha de total
  html += `
          <tr style="font-weight: bold; background-color: ${cor}30;">
            <td colspan="5">TOTAL</td>
            <td>${totalQnt}</td>
            <td>${formatadoFAT}</td>
            <td></td>
          </tr>`;
  
  html += `
        </tbody>
      </table>
    </div>`;
  
  tabelaContainer.innerHTML = html;
}

// Função para formatar data
function formatarData(dataString) {
  if (!dataString) return ''; // Retorna vazio se não houver data

  // Assumindo que a data está no formato YYYY-MM-DD ou um formato de timestamp
  const data = new Date(dataString);
  
  if (isNaN(data.getTime())) {
    // Se a data não for válida, retorna a string original
    console.error("Data inválida:", dataString);
    return dataString;
  }

  return data.toLocaleDateString('pt-BR'); // Formatação em pt-BR
}

// Função para gerar o gráfico mensal com múltiplos anos
function gerarGraficoMensalMultiplosAnos() {
  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];
  const traces = [];
  
  // Para cada ano selecionado, criar uma série de dados
  filtrosAnosSelecionados.forEach(ano => {
    const dadosFiltrados = dadosCSV.filter(item =>
      item.ANO === ano &&
      (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
    );
    
    const vendasPorMes = Array(12).fill(0);
    
    dadosFiltrados.forEach(item => {
      const mes = parseInt(item.MÊS) - 1;
      if (mes >= 0 && mes < 12) {
        vendasPorMes[mes] += parseFloat(item.QNT || 0);
      }
    });
    
    // Usar a cor específica para o ano
    const cor = coresAnos[ano] || '#999999';
    
    traces.push({
      x: nomesMeses,
      y: vendasPorMes,
      type: 'bar',
      name: ano,
      marker: { color: cor }
    });
  });
  
  const layout = {
    title: 'Máquinas Vendidas',
    xaxis: { title: 'Mês' },
    yaxis: { title: 'Quantidade' },
    barmode: 'group', // Agrupar barras lado a lado
    legend: { orientation: 'h', y: -0.2 }, // Legenda horizontal abaixo do gráfico
      annotations: traces.flatMap((trace, traceIndex) => 
        trace.y.map((value, index) => ({
          x: trace.x[index],
          y: value , // Position the label at the center of the bar
          text: value.toString(),
          showarrow: false,
          font: { size: 12 },
          xanchor: 'center', // Center the label horizontally
          yanchor: 'top' // Center the label vertically
        }))
      )
    };
    
    Plotly.newPlot('grafico-mensal', traces, layout);
  }

  Plotly.newPlot('grafico-mensal', traces, layout);


// Função para mostrar o resumo do estado com comparação entre anos
function mostrarResumoEstadoComparativo() {
  const resumoContainer = document.getElementById('resumo-estado');
  
  if (!dadosCSV || filtrosAnosSelecionados.length === 0) {
    resumoContainer.innerHTML = '<p>Selecione pelo menos um ano para visualizar o resumo.</p>';
    return;
  }
  
  // Criar o resumo visual com ícones
  let resumoHTML = `
    <div class="resumo-estado-container">
      <div class="resumo-titulo">
        <span class="icone-resumo">📍</span> Total da Região ${regiaoAtual.nome}
      </div>
      
      <div class="resumo-estatisticas">
  `;
  
  // Para cada ano selecionado, criar um item de estatística
  filtrosAnosSelecionados.forEach(ano => {
    const dadosFiltrados = dadosCSV.filter(item =>
      item.ANO === ano &&
      (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
    );
    
    if (dadosFiltrados.length === 0) {
      return; // Pular este ano se não houver dados
    }
    
    const totalQnt = dadosFiltrados.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
    const totalFat = dadosFiltrados.reduce((soma, item) => soma + parseFloat(item.FATURAMENTO || 0), 0);
    const formatadoFAT = totalFat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Calcular número de cidades com vendas
    const cidadesComVendas = new Set();
    dadosFiltrados.forEach(item => {
      if (item.CIDADE) {
        cidadesComVendas.add(item.CIDADE);
      }
    });
    const numCidadesComVendas = cidadesComVendas.size;
    
    // Usar a cor específica para o ano
    const cor = coresAnos[ano] || '#999999';
    
    resumoHTML += `
      <div class="estatistica-item estatistica-item-ano" style="border-left-color: ${cor};">
        <span class="icone-estatistica">📅</span>
        <div class="estatistica-info">
          <div class="estatistica-label">Ano: ${ano}</div>
          <div class="estatistica-valor">
            📦 ${totalQnt} unidades<br>
            💰 ${formatadoFAT}<br>
            🏙️ ${numCidadesComVendas} cidades
          </div>
        </div>
      </div>
    `;
  });
  
  resumoHTML += `
      </div>
    </div>
  `;
  
  // Inserir o resumo visual na div acima do mapa
  resumoContainer.innerHTML = resumoHTML;
}

function initApp() {
  // Inicializar o mapa mesmo sem região selecionada
  initMap();
  
  // Configurar o seletor de região
  const seletorRegiao = document.getElementById('filtro-regiao');
  if (seletorRegiao) {
    // Verificar se há uma região selecionada no localStorage
    const regiaoSalva = localStorage.getItem('regiaoSelecionada');
    if (regiaoSalva) {
      seletorRegiao.value = regiaoSalva;
      carregarRegiao(regiaoSalva);
    } else {
      // Mesmo sem região selecionada, atualizar a visualização para mostrar o mapa em branco
      atualizarVisualizacao();
    }
    
    // Adicionar evento para salvar a seleção
    seletorRegiao.addEventListener('change', function() {
      const regiaoId = this.value;
      if (regiaoId) {
        localStorage.setItem('regiaoSelecionada', regiaoId);
      }
    });
  }
  // Adicionar funcionalidade de expandir/recolher o painel lateral
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggle-panel');
  const appContainer = document.querySelector('.app-container');
  
  toggleButton.addEventListener('click', () => {
    appContainer.classList.toggle('panel-collapsed');
    
    // Alterar o ícone do botão
    const icon = toggleButton.querySelector('.toggle-icon');
    if (appContainer.classList.contains('panel-collapsed')) {
      icon.textContent = '⮜'; // Ícone para expandir
    } else {
      icon.textContent = '⮞'; // Ícone para recolher
    }
  });
});
  
}
