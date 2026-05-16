let pc, dc;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.remove('hidden');
}

async function createOffer() {
  pc = new RTCPeerConnection(config);
  dc = pc.createDataChannel("chat");
  setupDataChannel();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  
  document.getElementById('offerSDP').value = btoa(JSON.stringify(pc.localDescription));
  showScreen('connection');
}

function joinChat() {
  showScreen('joinScreen');
}

async function acceptOffer() {
  const offerStr = document.getElementById('remoteOffer').value.trim();
  if (!offerStr) return alert("Please paste the Offer first!");

  pc = new RTCPeerConnection(config);
  pc.ondatachannel = e => {
    dc = e.channel;
    setupDataChannel();
  };

  await pc.setRemoteDescription(JSON.parse(atob(offerStr)));
  
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  
  document.getElementById('myAnswer').value = btoa(JSON.stringify(pc.localDescription));
  document.getElementById('myAnswerArea').classList.remove('hidden');
}

async function acceptAnswer() {
  const answerStr = document.getElementById('answerInput').value.trim();
  if (!answerStr) return alert("Please paste the Answer first!");
  
  await pc.setRemoteDescription(JSON.parse(atob(answerStr)));
  showScreen('chat');
}

function setupDataChannel() {
  dc.onopen = () => {
    showScreen('chat');
    addMessage("✅ Connected! This chat is private.", "system");
  };
  
  dc.onmessage = (e) => {
    addMessage(e.data, "them");
  };
}

function sendMessage() {
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text || !dc) return;
  
  dc.send(text);
  addMessage(text, "own");
  input.value = '';
}

function addMessage(text, type) {
  const messages = document.getElementById('messages');
