const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let x = 50, y = 50, radius = 15;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
}
function moveDot() {
    x = Math.random() * (canvas.width - radius * 2) + radius;
    y = Math.random() * (canvas.height - radius * 2) + radius;
    draw();
}
canvas.addEventListener("click", e => {
    const dx = e.offsetX - x;
    const dy = e.offsetY - y;
    if (Math.sqrt(dx*dx + dy*dy) < radius) {
        moveDot();
        alert("Hit!");
    }
});
draw();
