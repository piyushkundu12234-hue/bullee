// Make functions global
window.createOffer = createOffer;
window.joinChat = joinChat;
window.acceptOffer = acceptOffer;
window.acceptAnswer = acceptAnswer;
window.copyOffer = copyOffer;
window.copyAnswer = copyAnswer;
window.sendMessage = sendMessage;
window.disconnect = disconnect;

let pc, dc;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.remove('hidden');
}

async function createOffer() {
  try {
    pc = new RTCPeerConnection(config);
    dc = pc.createDataChannel("chat");
    setupDataChannel();

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    document.getElementById('offerSDP').value = btoa(JSON.stringify(pc.localDescription));
    showScreen('connection');
  } catch(e) {
    alert("Error creating offer: " + e.message);
  }
}

function joinChat() {
  showScreen('joinScreen');
}

async function acceptOffer() {
  const offerStr = document.getElementById('remoteOffer').value.trim();
  if (!offerStr) return alert("Please paste the Offer first!");

  try {
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
  } catch(e) {
    alert("Error: " + e.message);
  }
}

async function acceptAnswer() {
  const answerStr = document.getElementById('answerInput').value.trim();
  if (!answerStr) return alert("Please paste the Answer first!");
  
  try {
    await pc.setRemoteDescription(JSON.parse(atob(answerStr)));
    showScreen('chat');
  } catch(e) {
    alert("Error connecting: " + e.message);
  }
}

function setupDataChannel() {
  dc.onopen = () => {
    showScreen('chat');
    addMessage("✅ Connected! Chat is private.", "system");
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
  if (!messages) return;
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function copyOffer() {
  const text = document.getElementById('offerSDP').value;
  navigator.clipboard.writeText(text);
  alert("✅ Offer copied!");
}

function copyAnswer() {
  const text = document.getElementById('myAnswer').value;
  navigator.clipboard.writeText(text);
  alert("✅ Answer copied!");
}

function disconnect() {
  location.reload();
}

// Auto-run when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("PhantomLink loaded successfully");
});
