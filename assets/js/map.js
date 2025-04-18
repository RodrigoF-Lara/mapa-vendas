// Função para carregar o GeoJSON e mostrar os limites dos municípios no mapa
function carregarGeoJSON() {
  if (!regiaoAtual) {
    console.error('Nenhuma região selecionada');
    return;
  }

  const caminhoGeoJSON = encodeURI(regiaoAtual.geojsonPath);
  
  fetch(caminhoGeoJSON)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(geojson => {
      console.log('GeoJSON carregado:', geojson);

      // Criação dos marcadores no mapa
      Object.entries(regiaoAtual.cidadesRC).forEach(([codigoIBGE, rc]) => {
        const feature = geojson.features.find(f => f.properties.CD_MUN === codigoIBGE);
        if (feature) {
          const centroid = turf.centroid(feature).geometry.coordinates;
          L.marker([centroid[1], centroid[0]], { icon: rcIcon })
            .bindPopup(`<strong>${feature.properties.NM_MUN}</strong><br><strong>RC:</strong> ${rc}`)
            .addTo(map);
        }
      });

      // Adiciona o estilo para o mapa e os limites
      L.geoJSON(geojson, {
        style: function(feature) {
          return {
            fillColor: 'gray',
            fillOpacity: 0.3,
            weight: 1,
            color: 'black'
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
            layer.setStyle({
              fillColor: totalQnt > 0 ? '#ffeb3b' : '#9e9e9e',
              fillOpacity: 0.7
            });

            layer.bindPopup(`<div class="map-popup">
              <h4>${feature.properties.NM_MUN}</h4>
              <p>Quantidade: ${totalQnt}</p>
              ${regiaoAtual.cidadesRC[codigoIBGE] ? `<p>RC: ${regiaoAtual.cidadesRC[codigoIBGE]}</p>` : ''}
            </div>`);
          }
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Falha ao carregar GeoJSON:', error);
      console.error('Caminho tentado:', regiaoAtual.geojsonPath);
    });
}
