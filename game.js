const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Background images
const bgMenu = new Image();
const bgShop = new Image();
const charSprite = new Image(); // Character sprite

// Menu Button
let button = { x: 100, y: 300, width: 160, height: 50, radius: 12, text: "Start" };

// Correct file paths (case-sensitive!)
bgMenu.src = "assets/Menu.png";
bgShop.src = "assets/Shop.png";
charSprite.src = "assets/Sprite.png"; // <- your character image

let currentScreen = "home"; // default view

// Character state
let player = {
    x: 50,
    y: 130,
    width: 90,
    height: 90,
    speed: 4,
    movingLeft: false,
    movingRight: false,
    facingRight: false // default: facing left
};

// Button listeners
document.getElementById("btnHome").addEventListener("click", () => {
    currentScreen = "home";
});
document.getElementById("btnShop").addEventListener("click", () => {
    currentScreen = "shop";
});
document.getElementById("settings").addEventListener("click", () => {
    currentScreen = "settings";
});
document.getElementById("info").addEventListener("click", () => {
    currentScreen = "info";
});

// Rounded rectangle function
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Draw loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentScreen === "home") {
        ctx.drawImage(bgMenu, 0, 0, canvas.width, canvas.height);

        // Draw Start button
        ctx.fillStyle = "#459CA9";
        roundRect(ctx, button.x, button.y, button.width, button.height, button.radius);
        ctx.fill();

        // Button text
        ctx.fillStyle = "#EFEFEF";
        ctx.font = "40px Luckiest Guy";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);

    } else if (currentScreen === "shop") {
        ctx.drawImage(bgShop, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillText("🛒 Shop Screen", 100, 100);

    } else if (currentScreen === "settings") {
        ctx.fillStyle = "#bdbdbdff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillText("⚙️ Settings Screen", 100, 100);

    } else if (currentScreen === "info") {
        ctx.fillStyle = "#d4d4d4ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("ℹ️ Info Screen", 100, 100);

    } else if (currentScreen === "game") {
        ctx.fillStyle = "#C2EAE7"; // light blue background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw player with facing direction
        if (player.facingRight) {
            ctx.save();
            ctx.scale(-1, 1); // flip horizontally
            ctx.drawImage(
                charSprite,
                -(player.x + player.width), // flip position
                player.y,
                player.width,
                player.height
            );
            ctx.restore();
        } else {
            ctx.drawImage(charSprite, player.x, player.y, player.width, player.height);
        }
    }
}

// Detect clicks inside canvas (for the Start button on menu)
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
        currentScreen === "home" && // only on menu
        mouseX >= button.x &&
        mouseX <= button.x + button.width &&
        mouseY >= button.y &&
        mouseY <= button.y + button.height
    ) {
        currentScreen = "game"; // switch to game screen
    }
});

// Handle key presses
document.addEventListener("keydown", (e) => {
    if (currentScreen === "game") {
        if (e.key === "ArrowLeft") {
            player.movingLeft = true;
            player.facingRight = false;
        }
        if (e.key === "ArrowRight") {
            player.movingRight = true;
            player.facingRight = true;
        }
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") player.movingLeft = false;
    if (e.key === "ArrowRight") player.movingRight = false;
});

// Game update
function update() {
    if (currentScreen === "game") {
        if (player.movingLeft) {
            player.x -= player.speed;
            if (player.x < 0) player.x = 0; // prevent leaving screen
        }
        if (player.movingRight) {
            player.x += player.speed;
            if (player.x + player.width > canvas.width) {
                player.x = canvas.width - player.width;
            }
        }
    }
}

// Main loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
