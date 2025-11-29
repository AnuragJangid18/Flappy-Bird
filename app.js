        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Mobile detection
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Responsive canvas setup
        function setupCanvas() {
            const container = canvas.parentElement;
            const maxWidth = Math.min(400, window.innerWidth - 40);
            const aspectRatio = 600 / 400;
            const width = maxWidth;
            const height = width * aspectRatio;
            
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }
        
        setupCanvas();
        
        // Canvas dimensions
        let CANVAS_WIDTH = canvas.width;
        let CANVAS_HEIGHT = canvas.height;
        const GROUND_HEIGHT = 50;
        let GROUND_Y = CANVAS_HEIGHT - GROUND_HEIGHT;
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (!gameStarted) {
                    setupCanvas();
                    CANVAS_WIDTH = canvas.width;
                    CANVAS_HEIGHT = canvas.height;
                    GROUND_Y = CANVAS_HEIGHT - GROUND_HEIGHT;
                    drawBackground();
                    drawBird();
                }
            }, 250);
        });
        
        // Difficulty configurations
        const DIFFICULTY_SETTINGS = {
            easy: {
                name: 'Easy',
                gravity: 0.16,
                jump: -3.8,
                basePipeSpeed: 2.3,
                pipeWidth: 60,
                pipeGap: 165,
                spawnInterval: 1450,
                hitboxPadding: 7,
                progressiveIncrease: true,
                speedBoostAt50: 1.15,
                speedBoostAt100: 1.35
            },
            normal: {
                name: 'Normal',
                gravity: 0.20,
                jump: -4.2,
                basePipeSpeed: 2.8,
                pipeWidth: 60,
                pipeGap: 140,
                spawnInterval: 1300,
                hitboxPadding: 5,
                progressiveIncrease: true,
                speedBoostAt50: 1.2,
                speedBoostAt100: 1.4
            },
            hard: {
                name: 'Hard',
                gravity: 0.24,
                jump: -4.8,
                basePipeSpeed: 3.5,
                pipeWidth: 60,
                pipeGap: 115,
                spawnInterval: 1100,
                hitboxPadding: 3,
                progressiveIncrease: true,
                speedBoostAt50: 1.25,
                speedBoostAt100: 1.5
            },
            endless: {
                name: 'Endless',
                gravity: 0.20,
                jump: -4.2,
                basePipeSpeed: 2.8,
                pipeWidth: 60,
                pipeGap: 140,
                spawnInterval: 1300,
                hitboxPadding: 5,
                progressiveIncrease: false,
                speedBoostAt50: 1.2,
                speedBoostAt100: 1.4
            }
        };
        
        let currentDifficulty = 'normal';
        let CONFIG = { ...DIFFICULTY_SETTINGS[currentDifficulty] };
        
        // Cache DOM elements
        const DOM = {
            score: document.getElementById('score'),
            best: document.getElementById('best'),
            gameOver: document.getElementById('gameOver'),
            pauseOverlay: document.getElementById('pauseOverlay'),
            finalScore: document.getElementById('finalScore'),
            bestScore: document.getElementById('bestScore')
        };
        
        let gameStarted = false;
        let gameOver = false;
        let gamePaused = false;
        let score = 0;
        let bestScore = loadBestScore();
        let lastTime = 0;
        let lastPipeTime = 0;
        let pausedTime = 0;
        let touchIndicator = { active: false, x: 0, y: 0, opacity: 1, startTime: 0 };

        // Difficulty management
        function setDifficulty(difficulty) {
            if (gameStarted && !gameOver) return; // Can't change during gameplay
            
            currentDifficulty = difficulty;
            CONFIG = { ...DIFFICULTY_SETTINGS[difficulty] };
            
            // Update UI
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
            
            // Save preference
            try {
                localStorage.setItem('flappyBird_difficulty', difficulty);
            } catch (e) {
                console.warn('Could not save difficulty preference:', e);
            }
        }
        
        function loadDifficulty() {
            try {
                const saved = localStorage.getItem('flappyBird_difficulty');
                return saved && DIFFICULTY_SETTINGS[saved] ? saved : 'normal';
            } catch (e) {
                return 'normal';
            }
        }

        // Storage helper functions
        function loadBestScore() {
            try {
                const saved = localStorage.getItem('flappyBird_bestScore');
                return saved ? parseInt(saved, 10) : 0;
            } catch (e) {
                console.warn('localStorage not available:', e);
                return 0;
            }
        }

        function saveBestScore(score) {
            try {
                localStorage.setItem('flappyBird_bestScore', score.toString());
            } catch (e) {
                console.warn('Could not save to localStorage:', e);
            }
        }

        function incrementGamesPlayed() {
            try {
                const played = parseInt(localStorage.getItem('flappyBird_gamesPlayed') || '0', 10);
                localStorage.setItem('flappyBird_gamesPlayed', (played + 1).toString());
            } catch (e) {
                console.warn('Could not save games played:', e);
            }
        }

        // Bird properties
        const bird = {
            x: 80,
            y: 250,
            width: 34,
            height: 24,
            velocity: 0,
            rotation: 0
        };

        // Pipe properties
        const pipes = [];

        function drawTouchIndicator() {
            if (!touchIndicator.active) return;
            
            const elapsed = performance.now() - touchIndicator.startTime;
            const maxDuration = 300; // ms
            
            if (elapsed > maxDuration) {
                touchIndicator.active = false;
                return;
            }
            
            const progress = elapsed / maxDuration;
            const radius = 10 + progress * 20;
            touchIndicator.opacity = 1 - progress;
            
            ctx.save();
            ctx.globalAlpha = touchIndicator.opacity;
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(touchIndicator.x, touchIndicator.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        function showTouchIndicator(x, y) {
            touchIndicator.active = true;
            touchIndicator.x = x;
            touchIndicator.y = y;
            touchIndicator.startTime = performance.now();
        }

        function drawBird() {
            ctx.save();
            ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
            
            // Smooth rotation based on velocity
            const targetDeg = Math.max(Math.min(bird.velocity * 10, 80), -25);
            bird.rotation = bird.rotation + (targetDeg - bird.rotation) * 0.12;
            ctx.rotate(bird.rotation * Math.PI / 180);
            
            // Draw bird body
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw wing
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.ellipse(-8, 0, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw eye
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(10, -4, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw beak
            ctx.fillStyle = '#FF6347';
            ctx.beginPath();
            ctx.moveTo(bird.width / 2 - 5, 0);
            ctx.lineTo(bird.width / 2 + 5, -2);
            ctx.lineTo(bird.width / 2 + 5, 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }

        function drawPipe(pipe) {
            // Top pipe
            ctx.fillStyle = '#228B22';
            ctx.fillRect(pipe.x, 0, CONFIG.pipeWidth, pipe.top);
            ctx.strokeStyle = '#1a6b1a';
            ctx.lineWidth = 3;
            ctx.strokeRect(pipe.x, 0, CONFIG.pipeWidth, pipe.top);
            
            // Pipe cap top
            ctx.fillRect(pipe.x - 5, pipe.top - 25, CONFIG.pipeWidth + 10, 25);
            ctx.strokeRect(pipe.x - 5, pipe.top - 25, CONFIG.pipeWidth + 10, 25);
            
            // Bottom pipe
            const bottomStart = pipe.top + pipe.gap;
            ctx.fillRect(pipe.x, bottomStart, CONFIG.pipeWidth, CANVAS_HEIGHT - bottomStart);
            ctx.strokeRect(pipe.x, bottomStart, CONFIG.pipeWidth, CANVAS_HEIGHT - bottomStart);
            
            // Pipe cap bottom
            ctx.fillRect(pipe.x - 5, bottomStart, CONFIG.pipeWidth + 10, 25);
            ctx.strokeRect(pipe.x - 5, bottomStart, CONFIG.pipeWidth + 10, 25);
        }

        function drawBackground() {
            // Sky gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F6FF');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // Ground
            ctx.fillStyle = '#DEB887';
            ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, GROUND_HEIGHT);
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 5);
        }

        function createPipe() {
            // Progressive difficulty - gap decreases as score increases (if enabled)
            let gap = CONFIG.pipeGap;
            if (CONFIG.progressiveIncrease) {
                gap = Math.max(110, CONFIG.pipeGap - Math.floor(score / 5) * 5);
            }
            
            const minTop = 50;
            const maxTop = CANVAS_HEIGHT - gap - 100;
            const top = Math.random() * (maxTop - minTop) + minTop;
            
            pipes.push({
                x: CANVAS_WIDTH,
                top: top,
                gap: gap,
                scored: false
            });
        }

        function getSpeedMultiplier() {
            if (score >= 100) {
                return CONFIG.speedBoostAt100;
            } else if (score >= 50) {
                return CONFIG.speedBoostAt50;
            }
            return 1.0;
        }

        function updateBird(delta) {
            const dt = delta / 16; // normalize to ~60fps baseline
            const speedMult = getSpeedMultiplier();
            bird.velocity += CONFIG.gravity * dt * speedMult;
            bird.y += bird.velocity * dt * speedMult;
            
            // Ground collision
            if (bird.y + bird.height >= GROUND_Y) {
                bird.y = GROUND_Y - bird.height;
                endGame();
            }
            
            // Ceiling collision
            if (bird.y <= 0) {
                bird.y = 0;
                bird.velocity = 0;
            }
        }

        function updatePipes(delta, timestamp) {
            // Time-based pipe spawning
            if (timestamp - lastPipeTime > CONFIG.spawnInterval) {
                createPipe();
                lastPipeTime = timestamp;
            }
            
            // Progressive difficulty - speed increases with score (if enabled)
            let speed = CONFIG.basePipeSpeed;
            if (CONFIG.progressiveIncrease) {
                speed = CONFIG.basePipeSpeed + Math.min(3, score * 0.08);
            }
            
            // Apply score-based speed multiplier
            const speedMult = getSpeedMultiplier();
            const move = speed * speedMult * (delta / 16);
            
            for (let i = pipes.length - 1; i >= 0; i--) {
                pipes[i].x -= move;
                
                // Forgiving hitbox collision detection
                const padding = CONFIG.hitboxPadding;
                if (
                    bird.x + padding + bird.width - 2 * padding > pipes[i].x &&
                    bird.x + padding < pipes[i].x + CONFIG.pipeWidth &&
                    (bird.y + padding < pipes[i].top || bird.y + bird.height - padding > pipes[i].top + pipes[i].gap)
                ) {
                    endGame();
                }
                
                // Score point
                if (!pipes[i].scored && pipes[i].x + CONFIG.pipeWidth < bird.x) {
                    pipes[i].scored = true;
                    score++;
                    updateScore();
                }
                
                // Remove off-screen pipes
                if (pipes[i].x + CONFIG.pipeWidth < 0) {
                    pipes.splice(i, 1);
                }
            }
        }

        function updateScore() {
            DOM.score.textContent = score;
            if (score > bestScore) {
                bestScore = score;
                DOM.best.textContent = bestScore;
                saveBestScore(bestScore);
            }
        }

        function flap() {
            if (!gameStarted || gameOver) return;
            bird.velocity = CONFIG.jump;
        }

        function startGame() {
            if (gameStarted && !gameOver) return;
            
            gameStarted = true;
            gameOver = false;
            gamePaused = false;
            score = 0;
            lastTime = 0;
            lastPipeTime = 0;
            pausedTime = 0;
            bird.y = 250;
            bird.velocity = 0;
            bird.rotation = 0;
            pipes.length = 0;
            
            DOM.gameOver.classList.remove('show');
            DOM.pauseOverlay.classList.remove('show');
            updateScore();
            requestAnimationFrame(gameLoop);
        }

        function endGame() {
            if (gameOver) return;
            gameOver = true;
            gameStarted = false;
            
            incrementGamesPlayed();
            
            DOM.finalScore.textContent = score;
            DOM.bestScore.textContent = bestScore;
            DOM.gameOver.classList.add('show');
        }

        function restartGame() {
            startGame();
        }

        function pauseGame() {
            if (!gameStarted || gameOver || gamePaused) return;
            gamePaused = true;
            pausedTime = performance.now();
            DOM.pauseOverlay.classList.add('show');
        }

        function resumeGame() {
            if (!gamePaused) return;
            gamePaused = false;
            const pauseDuration = performance.now() - pausedTime;
            lastTime += pauseDuration;
            lastPipeTime += pauseDuration;
            DOM.pauseOverlay.classList.remove('show');
            requestAnimationFrame(gameLoop);
        }

        function gameLoop(timestamp) {
            if (!gameStarted || gameOver || gamePaused) return;
            
            // Initialize timing on first frame
            if (!lastTime) {
                lastTime = timestamp;
                lastPipeTime = timestamp;
            }
            
            const delta = timestamp - lastTime;
            lastTime = timestamp;
            
            drawBackground();
            
            updateBird(delta);
            updatePipes(delta, timestamp);
            
            pipes.forEach(drawPipe);
            drawBird();
            
            if (isMobile) {
                drawTouchIndicator();
            }
            
            requestAnimationFrame(gameLoop);
        }

        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                if (!gameStarted) {
                    startGame();
                } else if (gamePaused) {
                    resumeGame();
                } else {
                    flap();
                }
            } else if (e.code === 'Escape' || e.key === 'Escape') {
                e.preventDefault();
                if (gameStarted && !gameOver) {
                    if (gamePaused) {
                        resumeGame();
                    } else {
                        pauseGame();
                    }
                }
            }
        });

        // Use pointer events for better touch support
        canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            
            // Show touch indicator on mobile
            if (isMobile) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                showTouchIndicator(x, y);
            }
            
            if (!gameStarted) {
                startGame();
            } else if (gamePaused) {
                resumeGame();
            } else {
                flap();
            }
        });
        
        // Prevent double-tap zoom on mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Pause game when window loses focus
        window.addEventListener('blur', () => {
            if (gameStarted && !gameOver && !gamePaused) {
                pauseGame();
            }
        });

        // Initial draw and setup
        DOM.best.textContent = bestScore;
        
        // Load saved difficulty
        const savedDifficulty = loadDifficulty();
        setDifficulty(savedDifficulty);
        
        drawBackground();
        drawBird();