/**
 * GALACTIC DEFENDER: OMEGA
 * A modern space shooter built with vanilla JS and HTML5 Canvas
 */

// --- ASSET MANAGER ---
class AssetManager {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    loadImage(key, src) {
        this.totalAssets++;
        const img = new Image();
        img.src = src;
        img.onload = () => this.handleLoad();
        img.onerror = () => console.error(`Failed to load image: ${src}`);
        this.images[key] = img;
    }

    handleLoad() {
        this.loadedAssets++;
        if (this.loadedAssets === this.totalAssets && this.onComplete) {
            this.onComplete();
        }
    }

    onLoad(callback) {
        this.onComplete = callback;
    }

    getImage(key) {
        return this.images[key];
    }
}

// --- INPUT HANDLER ---
class InputHandler {
    constructor() {
        this.keys = {};
        this.onKeyDown = null;
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (this.onKeyDown) this.onKeyDown(e);
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    isDown(code) {
        return this.keys[code] === true;
    }
}

// --- GAME ENTITIES ---
class Entity {
    constructor(game, x, y, width, height, imageKey) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = game.assets.getImage(imageKey);
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        // Base update
    }

    draw(ctx) {
        if (this.image) {
            // Use 'screen' blend mode to make black background transparent
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.restore();
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    checkCollision(rect) {
        // Reduce hitbox size to 80% to be more forgiving
        const marginX = this.width * 0.1;
        const marginY = this.height * 0.1;
        return (
            this.x + marginX < rect.x + rect.width - (rect.width * 0.1) &&
            this.x + this.width - marginX > rect.x + (rect.width * 0.1) &&
            this.y + marginY < rect.y + rect.height - (rect.height * 0.1) &&
            this.y + this.height - marginY > rect.y + (rect.height * 0.1)
        );
    }
}

class Player extends Entity {
    constructor(game) {
        super(game, 0, 0, 60, 60, 'player');
        this.x = game.width / 2 - this.width / 2;
        this.y = game.height - this.height - 20;
        this.speed = 400; // pixels per second
        this.shootTimer = 0;
        this.shootInterval = 0.2; // seconds
        this.hp = 100;
        this.maxHp = 100;
    }

    update(deltaTime) {
        if (this.game.cheatMode) {
            this.updateAI(deltaTime);
        } else {
            this.updateManual(deltaTime);
        }

        // Boundaries
        this.x = Math.max(0, Math.min(this.game.width - this.width, this.x));
        this.y = Math.max(0, Math.min(this.game.height - this.height, this.y));

        // Shooting
        if (this.shootTimer > 0) this.shootTimer -= deltaTime;
        if ((this.game.input.isDown('Space') || this.game.cheatMode) && this.shootTimer <= 0) {
            this.shoot();
            this.shootTimer = this.shootInterval;
        }
    }

    updateManual(deltaTime) {
        if (this.game.input.isDown('ArrowLeft') || this.game.input.isDown('KeyA')) {
            this.x -= this.speed * deltaTime;
        }
        if (this.game.input.isDown('ArrowRight') || this.game.input.isDown('KeyD')) {
            this.x += this.speed * deltaTime;
        }
        if (this.game.input.isDown('ArrowUp') || this.game.input.isDown('KeyW')) {
            this.y -= this.speed * deltaTime;
        }
        if (this.game.input.isDown('ArrowDown') || this.game.input.isDown('KeyS')) {
            this.y += this.speed * deltaTime;
        }
    }

    updateAI(deltaTime) {
        // Find nearest enemy
        let nearestEnemy = null;
        let minDistance = Infinity;

        this.game.enemies.forEach(enemy => {
            const dist = Math.abs(enemy.x - this.x);
            if (dist < minDistance) {
                minDistance = dist;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            // Move towards enemy
            if (this.x + this.width / 2 < nearestEnemy.x + nearestEnemy.width / 2 - 10) {
                this.x += this.speed * deltaTime;
            } else if (this.x + this.width / 2 > nearestEnemy.x + nearestEnemy.width / 2 + 10) {
                this.x -= this.speed * deltaTime;
            }
        } else {
            // Return to center if no enemies
            if (this.x + this.width / 2 < this.game.width / 2) {
                this.x += this.speed * deltaTime;
            } else {
                this.x -= this.speed * deltaTime;
            }
        }
    }

    shoot() {
        const bulletX = this.x + this.width / 2 - 2.5;
        const bulletY = this.y;
        this.game.bullets.push(new Bullet(this.game, bulletX, bulletY, -600));
        this.game.audio.shoot();
    }

    takeDamage(amount) {
        if (this.game.cheatMode) return; // Invincible in cheat mode
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.game.gameOver();
        }
        this.game.ui.updateHp(this.hp, this.maxHp);
    }
}

class Bullet extends Entity {
    constructor(game, x, y, speed) {
        super(game, x, y, 5, 15, null); // No image for bullet yet, use rect
        this.speed = speed;
        this.color = '#00f3ff';
    }

    update(deltaTime) {
        this.y += this.speed * deltaTime;
        if (this.y < 0 || this.y > this.game.height) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Enemy extends Entity {
    constructor(game, x, y, type) {
        let width = 40;
        let height = 40;
        let imageKey = 'scout';
        let hp = 1;
        let score = 10;

        if (type === 'fighter') {
            width = 50;
            height = 50;
            imageKey = 'fighter';
            hp = 3;
            score = 30;
        } else if (type === 'boss') {
            width = 120;
            height = 100;
            imageKey = 'boss';
            hp = 50;
            score = 500;
        }

        super(game, x, y, width, height, imageKey);
        this.type = type;
        this.hp = hp;
        this.scoreValue = score;
        this.speedX = 0;
        this.speedY = 100;
        this.angle = 0;

        // Movement patterns
        if (type === 'scout') {
            this.speedY = 150;
            this.speedX = Math.random() < 0.5 ? -50 : 50;
        } else if (type === 'fighter') {
            this.speedY = 80;
        } else if (type === 'boss') {
            this.speedY = 20;
        }
    }

    update(deltaTime) {
        this.y += this.speedY * deltaTime;
        this.x += this.speedX * deltaTime;

        // Bounce off walls
        if (this.x <= 0 || this.x + this.width >= this.game.width) {
            this.speedX *= -1;
        }

        if (this.y > this.game.height) {
            this.markedForDeletion = true;
            // Penalty for missing enemies?
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.game.audio.enemyHit();
        if (this.hp <= 0) {
            this.markedForDeletion = true;
            this.game.score += this.scoreValue;
            this.game.ui.updateScore(this.game.score);

            if (this.type === 'boss') {
                // Boss Death Sequence
                this.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 100, '#ff0055');
                this.game.triggerChainReaction();
                setTimeout(() => {
                    this.game.victory();
                }, 2000);
            } else {
                this.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
            }
        }
    }
}

class Particle {
    constructor(game, x, y, color) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 200 - 100;
        this.speedY = Math.random() * 200 - 100;
        this.color = color || `hsl(${Math.random() * 60 + 180}, 100%, 50%)`;
        this.life = 1; // seconds
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        this.x += this.speedX * deltaTime;
        this.y += this.speedY * deltaTime;
        this.life -= deltaTime * 2;
        if (this.life <= 0) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// --- AUDIO MANAGER ---
class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3; // Default volume
        this.isMuted = false;
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.masterGain.gain.value = 0;
            return true;
        } else {
            this.masterGain.gain.value = 0.3;
            return false;
        }
    }

    playTone(freq, type, duration) {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    shoot() {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    explosion() {
        if (this.isMuted) return;
        const duration = 0.5;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }

    enemyHit() {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
}

// --- UI MANAGER ---
class UIManager {
    constructor() {
        this.scoreDisplay = document.getElementById('score-display');
        this.waveDisplay = document.getElementById('wave-display');
        this.hpBar = document.getElementById('hp-bar');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.hud = document.getElementById('hud');
        this.cheatIndicator = document.getElementById('cheat-indicator');
        this.muteBtn = document.getElementById('mute-btn');

        this.finalScore = document.getElementById('final-score');
        this.finalWave = document.getElementById('final-wave');
        this.victoryScore = document.getElementById('victory-score');

        document.getElementById('start-btn').addEventListener('click', (e) => {
            e.target.blur();
            game.start();
        });
        document.getElementById('restart-btn').addEventListener('click', (e) => {
            e.target.blur();
            game.restart();
        });
        document.getElementById('play-again-btn').addEventListener('click', (e) => {
            e.target.blur();
            game.restart();
        });
        document.getElementById('resume-btn').addEventListener('click', (e) => {
            e.target.blur();
            game.togglePause();
        });
        document.getElementById('quit-btn').addEventListener('click', (e) => {
            e.target.blur();
            game.quitGame();
        });
        this.muteBtn.addEventListener('click', (e) => {
            e.target.blur();
            game.toggleMute();
        });
    }

    showStartScreen() {
        this.hideAll();
        this.startScreen.classList.remove('hidden');
    }

    showGameUI() {
        this.hideAll();
        this.hud.classList.remove('hidden');
    }

    showGameOver(score, wave) {
        this.hud.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        this.finalScore.innerText = score;
        this.finalWave.innerText = wave;
    }

    showVictory(score) {
        this.hud.classList.add('hidden');
        this.victoryScreen.classList.remove('hidden');
        this.victoryScore.innerText = score;
    }

    togglePause(isPaused) {
        if (isPaused) {
            this.pauseScreen.classList.remove('hidden');
        } else {
            this.pauseScreen.classList.add('hidden');
        }
    }

    toggleCheatIndicator(isActive) {
        if (isActive) {
            this.cheatIndicator.classList.remove('hidden');
        } else {
            this.cheatIndicator.classList.add('hidden');
        }
    }

    updateMuteIcon(isMuted) {
        this.muteBtn.innerText = isMuted ? '🔇' : '🔊';
    }

    hideAll() {
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.hud.classList.add('hidden');
    }

    updateScore(score) {
        this.scoreDisplay.innerText = score.toString().padStart(6, '0');
    }

    updateWave(wave) {
        this.waveDisplay.innerText = wave;
    }

    updateHp(current, max) {
        const percent = (current / max) * 100;
        this.hpBar.style.width = `${percent}%`;
        if (percent < 30) {
            this.hpBar.style.background = 'linear-gradient(90deg, #ff2a2a, #ff8800)';
            this.hpBar.style.boxShadow = '0 0 10px #ff2a2a';
        } else {
            this.hpBar.style.background = 'linear-gradient(90deg, #00f3ff, #00ff9d)';
            this.hpBar.style.boxShadow = '0 0 10px #00ff9d';
        }
    }
}

// --- MAIN GAME CLASS ---
class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.assets = new AssetManager();
        this.input = new InputHandler();
        this.ui = new UIManager();
        this.audio = new AudioManager();

        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];

        this.score = 0;
        this.wave = 1;
        this.isRunning = false;
        this.isPaused = false;
        this.cheatMode = false;
        this.gameState = 'MENU'; // MENU, PLAYING, VICTORY, GAME_OVER
        this.lastTime = 0;

        this.enemyTimer = 0;
        this.enemyInterval = 1.5;

        this.backgroundY = 0;

        this.input.onKeyDown = (e) => this.handleInput(e);

        this.loadAssets();
    }

    loadAssets() {
        this.assets.loadImage('player', 'assets/player_ship.png');
        this.assets.loadImage('scout', 'assets/enemy_scout.png');
        this.assets.loadImage('fighter', 'assets/enemy_fighter.png');
        this.assets.loadImage('boss', 'assets/boss_ship.png');
        this.assets.loadImage('bg', 'assets/background_stars.png');

        this.assets.onLoad(() => {
            console.log('Assets loaded');
            // Ready to start
        });
    }

    handleInput(e) {
        if (e.code === 'Escape' && this.isRunning) {
            this.togglePause();
        }
        if (e.altKey && e.code === 'KeyC') {
            this.toggleCheatMode();
        }
        if (e.code === 'KeyM') {
            this.toggleMute();
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.ui.togglePause(this.isPaused);
    }

    toggleCheatMode() {
        this.cheatMode = !this.cheatMode;
        this.ui.toggleCheatIndicator(this.cheatMode);
    }

    toggleMute() {
        const isMuted = this.audio.toggleMute();
        this.ui.updateMuteIcon(isMuted);
    }

    quitGame() {
        this.isRunning = false;
        this.isPaused = false;
        this.gameState = 'MENU';
        this.ui.showStartScreen();
    }

    start() {
        this.audio.resume(); // Ensure audio context is running
        this.isRunning = true;
        this.isPaused = false;
        this.gameState = 'PLAYING';
        this.score = 0;
        this.wave = 1;
        this.player = new Player(this);
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.ui.showGameUI();
        this.ui.updateScore(0);
        this.ui.updateWave(1);
        this.ui.updateHp(100, 100);
        this.lastTime = performance.now();
        requestAnimationFrame((ts) => this.loop(ts));
    }

    restart() {
        this.start();
    }

    gameOver() {
        this.gameState = 'GAME_OVER';
        this.ui.showGameOver(this.score, this.wave);
    }

    victory() {
        this.gameState = 'VICTORY';
        this.ui.showVictory(this.score);
    }

    createExplosion(x, y, count = 10, color = null) {
        this.audio.explosion();
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(this, x, y, color));
        }
    }

    triggerChainReaction() {
        this.enemies.forEach((enemy, index) => {
            setTimeout(() => {
                if (!enemy.markedForDeletion) {
                    enemy.markedForDeletion = true;
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 20);
                }
            }, index * 100); // Stagger explosions
        });
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;

        // Background scroll
        this.backgroundY += 50 * deltaTime;
        if (this.backgroundY >= this.height) this.backgroundY = 0;

        // Particles always update
        this.particles.forEach(p => p.update(deltaTime));
        this.particles = this.particles.filter(p => !p.markedForDeletion);

        if (this.gameState === 'PLAYING') {
            // Player
            this.player.update(deltaTime);

            // Bullets
            this.bullets.forEach(b => b.update(deltaTime));
            this.bullets = this.bullets.filter(b => !b.markedForDeletion);

            // Enemies
            this.enemyTimer -= deltaTime;
            if (this.enemyTimer <= 0) {
                this.spawnEnemy();
                this.enemyTimer = this.enemyInterval;
            }
            this.enemies.forEach(e => e.update(deltaTime));
            this.enemies = this.enemies.filter(e => !e.markedForDeletion);

            // Collisions
            this.checkCollisions();

            // Wave progression
            if (this.score > this.wave * 500) {
                this.wave++;
                this.ui.updateWave(this.wave);
                this.enemyInterval = Math.max(0.5, 1.5 - (this.wave * 0.1));

                if (this.wave % 5 === 0) {
                    this.spawnBoss();
                }
            }
        }
    }

    spawnEnemy() {
        const x = Math.random() * (this.width - 50);
        const type = Math.random() < 0.3 + (this.wave * 0.05) ? 'fighter' : 'scout';
        this.enemies.push(new Enemy(this, x, -50, type));
    }

    spawnBoss() {
        // Only spawn if no boss exists
        if (!this.enemies.some(e => e.type === 'boss')) {
            this.enemies.push(new Enemy(this, this.width / 2 - 60, -100, 'boss'));
        }
    }

    checkCollisions() {
        // Bullets hit Enemies
        this.bullets.forEach(bullet => {
            this.enemies.forEach(enemy => {
                if (bullet.checkCollision(enemy)) {
                    bullet.markedForDeletion = true;
                    enemy.takeDamage(1);
                }
            });
        });

        // Enemies hit Player
        this.enemies.forEach(enemy => {
            if (enemy.checkCollision(this.player)) {
                enemy.markedForDeletion = true;
                this.player.takeDamage(20);
                this.createExplosion(enemy.x, enemy.y);
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Background
        const bg = this.assets.getImage('bg');
        if (bg) {
            // Simple parallax loop
            this.ctx.drawImage(bg, 0, this.backgroundY, this.width, this.height);
            this.ctx.drawImage(bg, 0, this.backgroundY - this.height, this.width, this.height);
        }

        if (this.gameState === 'PLAYING') {
            if (this.player) this.player.draw(this.ctx);
            this.bullets.forEach(b => b.draw(this.ctx));
            this.enemies.forEach(e => e.draw(this.ctx));
        }

        // Particles draw on top of everything, even in victory
        this.particles.forEach(p => p.draw(this.ctx));
    }

    loop(timestamp) {
        try {
            if (!this.isRunning) return;

            const deltaTime = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;

            this.update(deltaTime);
            this.draw();

            requestAnimationFrame((ts) => this.loop(ts));
        } catch (e) {
            console.error("Game Loop Error:", e);
            alert("Game Error: " + e.message);
            this.isRunning = false;
        }
    }
}

// Initialize
const game = new Game(800, 600);