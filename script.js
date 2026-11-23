// Tabela de símbolos com pesos probabilísticos e multiplicadores
const SIMBOLOS = [
  { icon: '🍊', peso: 40, mult: 2 },   // Comum (40% de chance)
  { icon: '🧨', peso: 30, mult: 3 },   // Médio (30% de chance)
  { icon: '🧧', peso: 18, mult: 5 },   // Incomum (18% de chance)
  { icon: '💰', peso: 9,  mult: 10 },  // Raro (9% de chance)
  { icon: '🐯', peso: 3,  mult: 25 }   // Lendário (3% de chance)
];

// Linhas de pagamento (3 horizontais + 2 diagonais)
const LINHAS_VITORIA = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
  [0, 4, 8], [2, 4, 6]             // Diagonais
];

// Estado inicial salvo no navegador
let estado = JSON.parse(localStorage.getItem('simulador_rng')) || {
  saldo: 100,
  rodadas: 0,
  totalApostado: 0,
  totalGanho: 0
};

const elSaldo = document.getElementById('saldo');
const elAposta = document.getElementById('aposta');
const elGrid = document.getElementById('grid');
const elMensagem = document.getElementById('mensagem');
const elRodadas = document.getElementById('total-rodadas');
const elApostado = document.getElementById('total-apostado');
const elGanho = document.getElementById('total-ganho');
const elRtp = document.getElementById('rtp-real');

function sortearSimbolo() {
  const somaPesos = SIMBOLOS.reduce((acc, s) => acc + s.peso, 0);
  let random = Math.random() * somaPesos;
  
  for (const simbolo of SIMBOLOS) {
    if (random < simbolo.peso) return simbolo;
    random -= simbolo.peso;
  }
  return SIMBOLOS[0];
}

function atualizarTela() {
  elSaldo.textContent = `R$ ${estado.saldo.toFixed(2)}`;
  elRodadas.textContent = estado.rodadas;
  elApostado.textContent = `R$ ${estado.totalApostado.toFixed(2)}`;
  elGanho.textContent = `R$ ${estado.totalGanho.toFixed(2)}`;
  
  const rtp = estado.totalApostado > 0 
    ? ((estado.totalGanho / estado.totalApostado) * 100).toFixed(2) 
    : '0.00';
  elRtp.textContent = `${rtp}%`;

  localStorage.setItem('simulador_rng', JSON.stringify(estado));
}

function girar() {
  const aposta = Number(elAposta.value);

  if (estado.saldo < aposta) {
    elMensagem.textContent = 'Saldo fictício insuficiente! Clique em Resetar Dados.';
    elMensagem.style.color = '#ef4444';
    return;
  }

  estado.saldo -= aposta;
  estado.rodadas += 1;
  estado.totalApostado += aposta;

  // Gera matriz 3x3 (9 posições)
  const resultado = Array.from({ length: 9 }, () => sortearSimbolo());
  const cells = elGrid.querySelectorAll('.cell');
  
  cells.forEach((cell, idx) => {
    cell.textContent = resultado[idx].icon;
    cell.classList.remove('win');
  });

  // Verifica combinações vencedoras
  let ganhoRodada = 0;
  LINHAS_VITORIA.forEach(linha => {
    const [a, b, c] = linha;
    if (resultado[a].icon === resultado[b].icon && resultado[b].icon === resultado[c].icon) {
      ganhoRodada += aposta * resultado[a].mult;
      cells[a].classList.add('win');
      cells[b].classList.add('win');
      cells[c].classList.add('win');
    }
  });

  if (ganhoRodada > 0) {
    estado.saldo += ganhoRodada;
    estado.totalGanho += ganhoRodada;
    elMensagem.textContent = `🎉 Combinação! Retorno fictício de R$ ${ganhoRodada.toFixed(2)}`;
    elMensagem.style.color = '#22c55e';
  } else {
    elMensagem.textContent = 'Sem combinação nesta rodada.';
    elMensagem.style.color = '#a3a3a3';
  }

  atualizarTela();
}

document.getElementById('btn-girar').addEventListener('click', girar);

document.getElementById('btn-reset').addEventListener('click', () => {
  estado = { saldo: 100, rodadas: 0, totalApostado: 0, totalGanho: 0 };
  elMensagem.textContent = 'Dados da simulação resetados.';
  elMensagem.style.color = '#fbbf24';
  atualizarTela();
});

atualizarTela();
