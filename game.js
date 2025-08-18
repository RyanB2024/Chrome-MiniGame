const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const bgMenu = new Image();
const bgShop = new Image();

//Menu Button
let button = { x: 100, y: 300, width: 160, height: 50, radius: 12, text: "Start" };

bgMenu.src = "assets/Menu.png"; // path to your image
bgShop.src = "assets/shop.png"; // path to your image

bgMenu.onload = () => {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
};

bgShop.onload = () => {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
};

let currentScreen = "home"; // default view

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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentScreen === "home") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw background first
        ctx.drawImage(bgMenu, 0, 0, canvas.width, canvas.height);

        // draws start button
        ctx.fillStyle = "#459CA9";
        roundRect(ctx, button.x, button.y, button.width, button.height, button.radius);
        ctx.fill();

        // Button text
        ctx.fillStyle = "#EFEFEF";
        ctx.font = "40px Luckiest Guy";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }

    else if (currentScreen === "shop") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw background first
        ctx.drawImage(bgShop, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillText("🛒 Shop Screen", 100, 100);
    }

    else if (currentScreen === "settings") {
        ctx.fillStyle = "#bdbdbdff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillText("⚙️ Settings Screen", 100, 100);
    }

    else if (currentScreen === "info") {
        ctx.fillStyle = "#d4d4d4ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("ℹ️ Info Screen", 100, 100);
    }
}

// Detect clicks
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
        mouseX >= button.x &&
        mouseX <= button.x + button.width &&
        mouseY >= button.y &&
        mouseY <= button.y + button.height
    ) {
        alert("Button clicked!");
    }
});

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
