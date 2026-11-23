// Símbolos inspirados no tema oriental com pesos probabilísticos
const SIMBOLOS = [
  { icon: '🍊', nome: 'Tangerina', peso: 38, mult: 3 },
  { icon: '🧨', nome: 'Fogos',     peso: 28, mult: 5 },
  { icon: '🧧', nome: 'Envelope',  peso: 18, mult: 8 },
  { icon: '💰', nome: 'Saco Ouro', peso: 10, mult: 10 },
  { icon: '🎋', nome: 'Amuleto',   peso: 4,  mult: 25 },
  { icon: '🏆', nome: 'Lingote',   peso: 2,  mult: 100 }
];

const APOSTAS_DISPONIVEIS = [1, 2, 5, 10, 20];
let indiceAposta = 1; // Começa em R$ 2,00
let modoTurbo = false;
let girando = false;

// As 5 linhas clássicas (1: meio, 2: topo, 3: base, 4 e 5: diagonais)
const LINHAS_VITORIA = [
  [3, 4, 5], // Linha 1
  [0, 1, 2], // Linha 2
  [6, 7, 8], // Linha 3
  [0, 4, 8], // Linha 4
  [6, 4, 2]  // Linha 5
];

let estado = JSON.parse(localStorage.getItem('simulador_tiger_edu')) || {
  saldo: 100,
  rodadas: 0,
  totalApostado: 0,
  totalGanho: 0,
  ultimoGanho: 0
};

const elSaldo = document.getElementById('saldo');
const elAposta = document.getElementById('aposta-display');
const elUltimoGanho = document.getElementById('ultimo-ganho');
const elGrid = document.getElementById('grid');
const elMensagem = document.getElementById('mensagem');

function sortearSimbolo() {
  const somaPesos = SIMBOLOS.reduce((acc, s) => acc + s.peso, 0);
  let r = Math.random() * somaPesos;
  for (const s of SIMBOLOS) {
    if (r < s.peso) return s;
    r -= s.peso;
  }
  return SIMBOLOS[0];
}

function atualizarUI() {
  const apostaAtual = APOSTAS_DISPONIVEIS[indiceAposta];
  elSaldo.textContent = `R$ ${estado.saldo.toFixed(2).replace('.', ',')}`;
  elAposta.textContent = `R$ ${apostaAtual.toFixed(2).replace('.', ',')}`;
  elUltimoGanho.textContent = `R$ ${estado.ultimoGanho.toFixed(2).replace('.', ',')}`;

  document.getElementById('total-rodadas').textContent = estado.rodadas;
  document.getElementById('total-apostado').textContent = `R$ ${estado.totalApostado.toFixed(2)}`;
  document.getElementById('total-ganho').textContent = `R$ ${estado.totalGanho.toFixed(2)}`;

  const rtp = estado.totalApostado > 0
    ? ((estado.totalGanho / estado.totalApostado) * 100).toFixed(2)
    : '0.00';
  document.getElementById('rtp-real').textContent = `${rtp}%`;

  localStorage.setItem('simulador_tiger_edu', JSON.stringify(estado));
}

function girar() {
  if (girando) return;
  const aposta = APOSTAS_DISPONIVEIS[indiceAposta];

  if (estado.saldo < aposta) {
    elMensagem.textContent = 'Saldo fictício insuficiente! Clique em RESET.';
    return;
  }

  girando = true;
  estado.saldo -= aposta;
  estado.rodadas += 1;
  estado.totalApostado += aposta;
  estado.ultimoGanho = 0;
  atualizarUI();

  const cells = elGrid.querySelectorAll('.cell');
  cells.forEach(c => {
    c.classList.remove('win');
    c.classList.add('spinning');
  });
  elMensagem.textContent = 'Sorteando matriz RNG...';

  const tempoGiro = modoTurbo ? 150 : 500;

  setTimeout(() => {
    const resultado = Array.from({ length: 9 }, () => sortearSimbolo());
    
    cells.forEach((cell, i) => {
      cell.classList.remove('spinning');
      cell.textContent = resultado[i].icon;
    });

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
      estado.ultimoGanho = ganhoRodada;
      elMensagem.textContent = `🎉 GANHO FICTÍCIO: R$ ${ganhoRodada.toFixed(2).replace('.', ',')}!`;
    } else {
      elMensagem.textContent = 'Sem combinação. Tente novamente!';
    }

    girando = false;
    atualizarUI();
  }, tempoGiro);
}

// Eventos dos botões
document.getElementById('btn-girar').addEventListener('click', girar);

document.getElementById('btn-menos').addEventListener('click', () => {
  if (indiceAposta > 0) {
    indiceAposta--;
    atualizarUI();
  }
});

document.getElementById('btn-mais').addEventListener('click', () => {
  if (indiceAposta < APOSTAS_DISPONIVEIS.length - 1) {
    indiceAposta++;
    atualizarUI();
  }
});

document.getElementById('btn-turbo').addEventListener('click', (e) => {
  modoTurbo = !modoTurbo;
  e.currentTarget.classList.toggle('active', modoTurbo);
});

document.getElementById('btn-reset').addEventListener('click', () => {
  estado = { saldo: 100, rodadas: 0, totalApostado: 0, totalGanho: 0, ultimoGanho: 0 };
  elMensagem.textContent = 'Simulação resetada para R$ 100,00.';
  atualizarUI();
});

atualizarUI();
