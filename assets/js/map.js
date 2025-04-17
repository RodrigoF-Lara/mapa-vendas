// map.js
export function initMap(containerId, view, zoom) {
  return L.map(containerId).setView(view, zoom);
}

export function addTileLayer(map) {
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

export function addMarkersToMap(map, geojson, cidadesRC, rcIcon) {
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
}
