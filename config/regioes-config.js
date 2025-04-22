// Configurações das regiões
const configuracoesRegioes = {
  'rs_sul': {
    id: 'rs_sul',
    nome: 'RS Sul',
    planilhaId: '1R7cj2ajVFQTRSWLNKdY1d1JNVhAjfFfsMvIWKeIhwiA',
    geojsonPath: 'data/geojson/municipios-RS_Sul.geojson',
    view: [-30.0346, -51.2177],
    zoom: 6,
    marcadorIcone: 'data/rc/marcador_Gustavo.svg',
    imagem: 'data/rc/Gustavo.PNG',
    cidadesRC: {'4301602': 'GUSTAVO' }
           },
  
'rs_norte': {
    id: 'rs_norte',
    nome: 'RS Norte',
    planilhaId: '1zxsWdSrPsPV6zqvNk0cv8zUosvntcZPGBMT9oLiB21s',
    geojsonPath: 'data/geojson/municipios-RS_Norte.geojson',
    view: [-29.5000, -53.0000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Jeison.svg',
    imagem: 'data/rc/Jeison.PNG',
    cidadesRC: {'4304705': 'LEANDRO'}
            },
  
  'sc': {
    id: 'sc',
    nome: 'SC',
    planilhaId: '1aWYSIjBBS6q6TaLlDETakqz_QUQrg3dR8nVwKYQlyHY',
    geojsonPath: 'data/geojson/municipios-SC.geojson',
    view: [-27.2423, -50.2189],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Jeison.svg',
    imagem: 'data/rc/Jeison.PNG',
    cidadesRC: {'4209003': 'LEONARDO'}
        },
  
  'pr': {
    id: 'pr',
    nome: 'PR',
    planilhaId: '1_DlY-t96oZ5HMctUv40MjZSFPQNBkr0XmGglUQ5kBn0',
    geojsonPath: 'data/geojson/municipios-PR.geojson',
    view: [-24.7935, -50.0000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Jeison.svg',
    imagem: 'data/rc/Jeison.PNG',
    cidadesRC: {'4104808': 'ISRAEL'}
          },
  
  'sp': {
    id: 'sp',
    nome: 'SP',
    planilhaId: '1iIyNSJSvZO53txewSIdgulgOQr9LkKVlKC4jYdleH1U',
    geojsonPath: 'data/geojson/municipios-SP.geojson',
    view: [-22.1500, -48.0000],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Andre.svg',
    imagem: 'data/rc/Andre.PNG',
    cidadesRC: {'3529005': 'ANDRE'}
    },
  
  'ms': {
    id: 'ms',
    nome: 'MS',
    planilhaId: '1UCqKvj-R5QRhRaHo6bsLGhWRiLvlw2txPQsPeHG1-rE',
    geojsonPath: 'data/geojson/municipios-MS.geojson',
    view: [-20.4697, -54.6201],
    zoom: 7,
    marcadorIcone: 'data/rc/marcador_Jeison.svg',
    imagem: 'data/rc/Jeison.PNG',
    cidadesRC: {'5003702': 'GRAZIAN'}
  }
};

// Esta função não é mais usada diretamente, foi substituída por mostrarResumoEstadoComparativo()
// Mantida apenas para compatibilidade com código existente
function mostrarResumoEstado() {
  mostrarResumoEstadoComparativo();
}
