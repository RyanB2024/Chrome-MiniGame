// Pixel Paws: Freefall — tiny canvas game for a Chrome extension popup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// --- Assets ---
const ASSETS = {
    menu: 'assets/Menu.png',
    start: 'assets/Start.png',
    over: 'assets/Game Over.png',
    ending: 'assets/Ending.png',
    demo: 'assets/Mini-game demo.png',
    shop: 'assets/Shop.png'
};
const images = {};
for (const [k, src] of Object.entries(ASSETS)) {
    const img = new Image();
    img.src = src;
    images[k] = img;
}

// --- Game state ---
let state = 'menu';
let score = 0;
let high = +localStorage.getItem('pp_high') || 0;
let pet = localStorage.getItem('pp_pet') || 'cat';

const player = { x: W / 2, y: H * 0.2, vx: 0, w: 22, h: 22 };
const input = { left: false, right: false };
const hearts = [];
const birds = [];
let scroll = 0;

// --- UI elements ---
const btnStart = document.getElementById('btnStart');
const btnShop = document.getElementById('btnShop');
const btnCat = document.getElementById('btnCat');
const btnDog = document.getElementById('btnDog');
const uiScore = document.getElementById('score');

btnCat.classList.toggle('active', pet === 'cat');
btnDog.classList.toggle('active', pet === 'dog');

btnStart.onclick = () => startGame();
btnShop.onclick = () => { state = (state === 'shop' ? 'menu' : 'shop'); };
btnCat.onclick = () => { setPet('cat'); };
btnDog.onclick = () => { setPet('dog'); };

function setPet(p) {
    pet = p;
    localStorage.setItem('pp_pet', pet);
    btnCat.classList.toggle('active', pet === 'cat');
    btnDog.classList.toggle('active', pet === 'dog');
}

// --- Input ---
addEventListener('keydown', e => {
    if (['ArrowLeft', 'a'].includes(e.key)) input.left = true;
    if (['ArrowRight', 'd'].includes(e.key)) input.right = true;
    if (e.key === ' ' && state !== 'playing') startGame();
});
addEventListener('keyup', e => {
    if (['ArrowLeft', 'a'].includes(e.key)) input.left = false;
    if (['ArrowRight', 'd'].includes(e.key)) input.right = false;
});

// --- Game functions ---
function reset() {
    score = 0;
    player.x = W / 2; player.y = H * 0.2; player.vx = 0;
    hearts.length = 0; birds.length = 0; scroll = 0;
}

function startGame() { reset(); state = 'playing'; }

function spawnHeart() { hearts.push({ x: Math.random() * (W - 16) + 8, y: H + 16, r: 6 }); }
function spawnBird() {
    const size = 18 + Math.random() * 10;
    birds.push({
        x: Math.random() * (W - size),
        y: H + size,
        w: size,
        h: 10 + Math.random() * 8,
        vx: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 1.5)
    });
}

function update(dt) {
    if (state !== 'playing') return;

    const speed = 160;
    player.vx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    player.x += player.vx * speed * dt;
    player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));
    scroll += 60 * dt;

    if (Math.random() < 0.03) spawnHeart();
    if (Math.random() < 0.025 + Math.min(0.02, score * 0.0005)) spawnBird();

    hearts.forEach(h => h.y -= 120 * dt);
    birds.forEach(b => { b.y -= 120 * dt; b.x += b.vx; if (b.x < 0 || b.x > W - b.w) b.vx *= -1; });

    for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        if (h.y < -20) { hearts.splice(i, 1); continue; }
        if (Math.hypot(player.x - h.x, player.y - h.y) < h.r + player.w * 0.5) { score += 10; hearts.splice(i, 1); }
    }

    for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i];
        if (b.y < -20) { birds.splice(i, 1); continue; }
        if (Math.abs(player.x - (b.x + b.w / 2)) < (player.w / 2 + b.w / 2) &&
            Math.abs(player.y - (b.y + b.h / 2)) < (player.h / 2 + b.h / 2)) {
            state = 'over';
            high = Math.max(high, score);
            localStorage.setItem('pp_high', high);
        }
    }
}

// --- Drawing ---
function drawBg() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#74b3ff'); g.addColorStop(1, '#d0f0ff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (images.demo?.complete) { ctx.globalAlpha = 0.15; ctx.drawImage(images.demo, 0, 0, W, H); ctx.globalAlpha = 1; }
}

function drawPet(x, y) {
    ctx.save(); ctx.translate(x, y);
    const px = (sx, sy, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2); };
    for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
        if (Math.hypot(i * 0.9, j * 0.7) < 6.2) px(i * 2, j * 2, pet === 'cat' ? '#f9e6c8' : '#f7c27b');
    }
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
    ctx.strokeRect(-6, -6, 12, 12); ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, W, H); drawBg();

    hearts.forEach(h => { ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill(); });
    birds.forEach(b => { ctx.fillStyle = 'black'; ctx.fillRect(b.x, b.y, b.w, b.h); });

    drawPet(player.x, player.y);

    uiScore.textContent = `${score} ★ (Hi ${high})`;

    if (state === 'menu') { ctx.drawImage(images.menu, 0, 0, W, H); }
    if (state === 'over') { ctx.drawImage(images.over, 0, 0, W, H); }
    if (state === 'shop') { ctx.drawImage(images.shop, 0, 0, W, H); }
}

let last = 0;
function loop(ts) {
    const dt = (ts - last) / 1000; last = ts;
    update(dt); draw(); requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
