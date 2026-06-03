const _canvasEl = document.getElementById('confetti');
let canvas = null;
let ctx = null;
let confettiParticles = [];
let _confettiSupported = false;

if (_canvasEl && _canvasEl.getContext) {
    canvas = _canvasEl;
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    _confettiSupported = true;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function fireConfetti() {
    if (!_confettiSupported) return;
    confettiParticles = [];
    for (let i = 0; i < 150; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * 3 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            size: Math.random() * 8 + 4
        });
    }
    animateConfetti();
}

function animateConfetti() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles.forEach((p, i) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        if (p.y > canvas.height) confettiParticles.splice(i, 1);
    });
    if (confettiParticles.length > 0) requestAnimationFrame(animateConfetti);
}
