export const characters = [
  { id: 'ghork', name: 'Ghork', color: '#b9652c', pale: '#edd6b3', symbol: '◆', phrase: 'Sempre encontra outro caminho.', sprite: 4 },
  { id: 'lala', name: 'Lala', color: '#7753a0', pale: '#dfd0ed', symbol: '✦', phrase: 'Ela tem um plano.', sprite: 6 },
  { id: 'drull', name: 'Drull', color: '#247a75', pale: '#b8dcd1', symbol: '⬟', phrase: 'Drull pula!', sprite: 1 },
  { id: 'dam', name: 'Dam', color: '#a74d60', pale: '#e9c7ca', symbol: '▣', phrase: 'Isso vai dar confusão.', sprite: 3 },
];
export const character = (id) => characters.find((c) => c.id === id);
