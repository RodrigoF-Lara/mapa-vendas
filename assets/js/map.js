export function carregarGeoJSON(map, geojsonPath, cidadesRC, rcIcon) {
  fetch(geojsonPath)
    .then(response => {
      if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
      return response.json();
    })
    .then(geojson => {
      // Adicionar marcadores com base no GeoJSON
      geojson.features.forEach(feature => {
        const codigoIBGE = feature.properties.CD_MUN;
        const rc = cidadesRC[codigoIBGE];

        if (rc) {
          const centroid = turf.centroid(feature).geometry.coordinates;
          L.marker([centroid[1], centroid[0]], { icon: rcIcon })
            .bindPopup(`<strong>${feature.properties.NM_MUN}</strong><br><strong>RC:</strong> ${rc}`)
            .addTo(map);
        }
      });

      // Estilizar camadas com base nos dados
      L.geoJSON(geojson, {
        style: feature => {
          const codigoIBGE = feature.properties.CD_MUN;
          const destaqueRC = cidadesRC[codigoIBGE];

          return {
            fillColor: destaqueRC ? '#ffeb3b' : '#9e9e9e',
            fillOpacity: 0.7,
            weight: destaqueRC ? 5 : 1,
            color: destaqueRC ? '#FF6347' : 'black',
          };
        },
      }).addTo(map);
    })
    .catch(error => console.error('Erro ao carregar o GeoJSON:', error));
}