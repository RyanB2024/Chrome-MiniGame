// Pixel Paws: Freefall — tiny canvas game for a Chrome extension popup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// --- Assets (using your provided PNGs as screens/overlays) ---
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
let state = 'menu'; // 'menu' | 'playing' | 'over' | 'shop'
let score = 0;
let high = +localStorage.getItem('pp_high') || 0;
let pet = localStorage.getItem('pp_pet') || 'cat'; // 'cat' or 'dog'

const player = {
    x: W / 2, y: H * 0.2, vx: 0, w: 22, h: 22,
};
const input = { left: false, right: false };

const hearts = [];
const birds = [];
let scroll = 0;

// UI
const btnStart = document.getElementById('btnStart');
const btnShop = document.getElementById('btnShop');
const btnCat = document.getElementById('btnCat');
const btnDog = document.getElementById('btnDog');
const uiScore = document.getElementById('score');

btnCat.classList.toggle('active', pet === 'cat');
btnDog.classList.toggle('active', pet === 'dog');

btnStart.onclick = () => { startGame(); };
btnShop.onclick = () => { state = (state === 'shop' ? 'menu' : 'shop'); };
btnCat.onclick = () => { pet = 'cat'; localStorage.setItem('pp_pet', pet); btnCat.classList.add('active'); btnDog.classList.remove('active'); };
btnDog.onclick = () => { pet = 'dog'; localStorage.setItem('pp_pet', pet); btnDog.classList.add('active'); btnCat.classList.remove('active'); };

// Input
addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') input.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') input.right = true;
    if (e.key === ' ' && state !== 'playing') startGame();
});
addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') input.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') input.right = false;
});

function reset() {
    score = 0;
    player.x = W / 2; player.y = H * 0.2; player.vx = 0;
    hearts.length = 0; birds.length = 0; scroll = 0;
}

function startGame() {
    reset();
    state = 'playing';
}

function spawnHeart() {
    hearts.push({ x: Math.random() * (W - 16) + 8, y: H + 16, r: 6 });
}
function spawnBird() {
    const size = 18 + Math.random() * 10;
    birds.push({ x: Math.random() * (W - size), y: H + size, w: size, h: 10 + Math.random() * 8, vx: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 1.5) });
}

function update(dt) {
    if (state === 'playing') {
        // Side control
        const speed = 160;
        player.vx = (input.right ? 1 : 0 - (input.left ? 1 : 0)) * speed;
        player.x += player.vx * dt;
        player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));
        scroll += 60 * dt;

        // Spawns
        if (Math.random() < 0.03) spawnHeart();
        if (Math.random() < 0.025 + Math.min(0.02, score * 0.0005)) spawnBird();

        // Move objects upward (player is falling)
        for (const h of hearts) h.y -= 120 * dt;
        for (const b of birds) { b.y -= 120 * dt; b.x += b.vx; if (b.x < 0 || b.x > W - b.w) b.vx *= -1; }

        // Collect hearts
        for (let i = hearts.length - 1; i >= 0; i--) {
            const h = hearts[i];
            if (h.y < -20) { hearts.splice(i, 1); continue; }
            if (Math.hypot(player.x - h.x, player.y - h.y) < h.r + player.w * 0.5) {
                score += 10;
                hearts.splice(i, 1);
            }
        }

        // Hit birds
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
}

function drawBg() {
    // Parallax gradient sky + optional demo image overlay for vibe
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#74b3ff');
    g.addColorStop(1, '#d0f0ff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // faint clouds using the demo image if loaded
    const img = images.demo;
    if (img?.complete) ctx.globalAlpha = 0.15, ctx.drawImage(img, 0, 0, W, H), ctx.globalAlpha = 1;
}

function drawPet(x, y) {
    ctx.save();
    ctx.translate(x, y);
    // simple pixel pet: cat or dog color palettes
    const px = (sx, sy, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2); };
    // body
    for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
        const dist = Math.hypot(i * 0.9, j * 0.7);
        if (dist < 6.2) px(i * 2, j * 2, pet === 'cat' ? '#f9e6c8' : '#f7c27b');
    }
    // outline
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.strokeRect(-player.w / 2, -player.h / 2, player.w, player.h);
    // ears/tail hints
    ctx.fillStyle = pet === 'cat' ? '#f39c6b' : '#8b5e3c';
    ctx.fillRect(-player.w / 2 - 2, -player.h / 2 - 4, 4, 4);
    ctx.fillRect(player.w / 2 - 2, -player.h / 2 - 6, 4, 4);
    ctx.fillRect(player.w / 2 + 4, 0, 6, 2);
    // goggles
    ctx.fillStyle = '#2b2b5a';
    ctx.fillRect(-8, -2, 16, 4);
    ctx.restore();
}

function draw() {
    drawBg();
    if (state === 'menu' || state === 'shop') {
        const img = state === 'menu' ? images.menu : images.shop;
        if (img?.complete) ctx.drawImage(img, 0, 0, W, H);
        // help text
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(0, H - 32, W, 32);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px system-ui';
        ctx.fillText('Press SPACE or click Start — Move with ← → / A D', 12, H - 12);
    } else if (state === 'playing') {
        // falling particles
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        for (let i = 0; i < 40; i++) {
            const y = (i * 14 + (scroll % 14));
            ctx.fillRect((i * 37) % W, y, 2, 2);
        }
        // objects
        ctx.fillStyle = '#e63946';
        for (const h of hearts) {
            // tiny heart sprite
            ctx.fillRect(h.x - 2, h.y, 4, 2);
            ctx.fillRect(h.x - 4, h.y + 2, 8, 2);
            ctx.fillRect(h.x - 6, h.y + 4, 12, 2);
            ctx.fillRect(h.x - 4, h.y + 6, 8, 2);
            ctx.fillRect(h.x - 2, h.y + 8, 4, 2);
        }
        ctx.fillStyle = '#1f2937';
        for (const b of birds) {
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillRect(b.x - 4, b.y + Math.max(2, b.h - 4), 8, 4); // tail
        }
        // player
        drawPet(player.x, player.y);
        // score
        uiScore.textContent = `${score} ★ (Hi ${high})`;
    } else if (state === 'over') {
        drawBg();
        const img = images.over?.complete ? images.over : images.ending;
        if (img?.complete) ctx.drawImage(img, 0, 0, W, H);
        ctx.fillStyle = 'rgba(0,0,0,.6)';
        ctx.fillRect(0, H - 60, W, 60);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px system-ui';
        ctx.fillText(`Score: ${score} — High: ${high}`, 12, H - 28);
        ctx.font = '14px system-ui';
        ctx.fillText('Press SPACE or click Start to try again', 12, H - 10);
    }
}

let last = 0;
function loop(ts = 0) {
    const dt = Math.min(0.033, (ts - last) / 1000);
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}
loop();
