"use strict";

const Visualizer = {
    analyser: null,
    dataArray: null,
    canvas: null,
    ctx: null,
    isDrawing: false,
    particles: [],

    init(){
        if (typeof Equalizer === "undefined" || !Equalizer.analyser) {
            setTimeout(() => this.init(), 300);
            return;
        }

        this.analyser = Equalizer.analyser;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        this.canvas = document.getElementById("visualizer");
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext("2d");

        this.resize();
        window.addEventListener("resize", () => this.resize());

        if (!this.isDrawing) {
            this.isDrawing = true;
            this.draw();
        }
    },

    resize(){
        if (!this.canvas) return;
        this.canvas.width = this.canvas.clientWidth || 300;
        this.canvas.height = this.canvas.clientHeight || 150;
    },

    draw(){
        requestAnimationFrame(() => this.draw());

        if(!this.analyser || !this.canvas || !this.ctx) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        let width = this.canvas.width;
        let height = this.canvas.height;

        this.ctx.clearRect(0, 0, width, height);

        let barWidth = (width / this.dataArray.length) * 1.8;
        let x = 0;

        this.dataArray.forEach((value, index) => {
            let barHeight = (value / 255) * height * 1.4;

            // Efek Batu Menyala Terang (Neon Glow)
            this.ctx.shadowBlur = 18;
            this.ctx.shadowColor = "#00ffff";

            // GRADASI MIX 5 WARNA HALUS: Merah -> Hijau -> Cyan -> Kuning -> Neon Cyan
            let gradient = this.ctx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0.0, '#ff0033'); // Merah di bawah
            gradient.addColorStop(0.25, '#00ff66'); // Hijau
            gradient.addColorStop(0.5, '#00bfff'); // Cyan
            gradient.addColorStop(0.75, '#ffff00'); // Kuning
            gradient.addColorStop(1.0, '#00ffff'); // Neon Cyan Paling Menyala di atas

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

            // Puncak bar putih menyala
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(x, height - barHeight - 2, barWidth - 2, 2);

            // SPAWN PARTIKEL: Percikan api neon saat ketukan tinggi
            if (value > 180 && Math.random() < 0.3) {
                this.particles.push({
                    x: x + barWidth / 2,
                    y: height - barHeight,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -Math.random() * 3 - 1,
                    alpha: 1,
                    color: index % 2 === 0 ? "#00ffff" : "#ff0033"
                });
            }

            x += barWidth + 1;
        });

        // UPDATE & RENDER PARTIKEL
        this.ctx.shadowBlur = 12;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.globalAlpha = p.alpha;
            
            this.ctx.fillRect(p.x, p.y, 2, 6);

            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;

            if (p.alpha <= 0 || p.y < 0) {
                this.particles.splice(i, 1);
            }
        }
        this.ctx.globalAlpha = 1.0;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        Visualizer.init();
    }, 500);
});
