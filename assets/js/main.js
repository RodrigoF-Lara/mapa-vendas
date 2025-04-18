// Função para carregar o GeoJSON com os limites dos municípios
function carregarGeoJSON() {
  fetch('data/geojson/municipios-RS Sul.geojson')
    .then(response => response.json())
    .then(geojson => {
      // Primeiro cria todos os marcadores dos RCs
      Object.entries(cidadesRC).forEach(([codigoIBGE, rc]) => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        if (feature) {
          const centroid = turf.centroid(feature).geometry.coordinates;
          L.marker([centroid[1], centroid[0]], {icon: rcIcon})
            .bindPopup(`<strong>${feature.properties.NM_MUN}</strong><br><strong>RC:</strong> ${rc}`)
            .addTo(map);
        }
      });

      // Depois processa os polígonos normalmente
      L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
          const codigoIBGE = feature.properties.CD_MUN;
          const vendasCidade = dadosCSV.filter(item =>
            item['TB_CIDADES.CODIGO_IBGE'] === codigoIBGE &&
            item.ANO === filtroAnoSelecionado &&
            (filtroMesSelecionado === 'todos' || item.MÊS === filtroMesSelecionado)
          );

          if (vendasCidade.length > 0) {
            const totalQnt = vendasCidade.reduce((soma, item) => soma + parseFloat(item.QNT || 0), 0);
            layer.setStyle({
              fillColor: totalQnt > 0 ? 'yellow' : 'gray',
              fillOpacity: 0.5,
              weight: 1,
              color: 'black'
            });

            layer.bindPopup(`
              <strong>${feature.properties.NM_MUN}</strong><br>
              Quantidade: ${totalQnt}
              ${cidadesRC[codigoIBGE] ? `<br><strong>RC:</strong> ${cidadesRC[codigoIBGE]}` : ''}
            `);

            layer.on('click', function() {
              mostrarTabela(codigoIBGE);
              filtrarGraficoPorCidade(codigoIBGE);
            });
          } else {
            layer.setStyle({
              fillColor: 'gray',
              fillOpacity: 0.3,
              weight: 1,
              color: 'black'
            });
          }
        }
      }).addTo(map);
    })
    .catch(error => console.error('Erro ao carregar GeoJSON:', error));
}

// Carregar e inicializar
document.addEventListener('DOMContentLoaded', function () {
  initMap();
  carregarDadosAPI();
});
