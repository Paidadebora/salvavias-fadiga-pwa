// Registra SW para PWA offline
if ('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}

import { FatigueEngine } from './fatigue.js';

const cam = document.getElementById('cam');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
const btn = document.getElementById('btnStart');
const statusEl = document.getElementById('status');
const bpmEl = document.getElementById('bpm');
const perclosEl = document.getElementById('perclos');
const marEl = document.getElementById('mar');
const alertaEl = document.getElementById('alerta');
const chkAudio = document.getElementById('chkAudio');
const sens = document.getElementById('sens');

let engine;

function speak(text){
  if(!chkAudio.checked) return;
  const ut = new SpeechSynthesisUtterance(text);
  ut.lang = 'pt-BR';
  speechSynthesis.speak(ut);
}

async function start(){
  btn.disabled = true;
  statusEl.textContent = 'Solicitando câmera…';
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'user', width:{ideal:1280}, height:{ideal:720} }, audio:false });
  cam.srcObject = stream;
  await cam.play();
  overlay.width = cam.videoWidth;
  overlay.height = cam.videoHeight;
  engine = new FatigueEngine({ onMetrics:updateMetrics, onAlert });
  await engine.init(cam, (lm)=>{
    ctx.clearRect(0,0,overlay.width,overlay.height);
    ctx.strokeStyle = '#2dd4bf88';
    ctx.lineWidth = 1.5;
    if (!lm) return;
    for(const p of lm){
      ctx.beginPath();
      ctx.arc(p.x*overlay.width, p.y*overlay.height, 1.2, 0, Math.PI*2);
      ctx.stroke();
    }
  });
  statusEl.textContent = 'Em execução offline';
}

function updateMetrics(m){
  bpmEl.textContent = m.blinksPerMin.toFixed(1);
  perclosEl.textContent = (m.perclos*100).toFixed(1) + '%';
  marEl.textContent = m.mar.toFixed(3);
  alertaEl.textContent = m.state;
  alertaEl.className = m.level;
}

function onAlert(level, state){
  if(level==='warn'){ speak('Atenção: possíveis sinais de fadiga'); }
  if(level==='danger'){ speak('Perigo: fadiga detectada. Pare o veículo com segurança.'); }
}

btn.addEventListener('click', start);
sens.addEventListener('input', ()=>{
  if(engine) engine.setSensitivity(Number(sens.value));
});
