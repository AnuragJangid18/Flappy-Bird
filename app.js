        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        let gameStarted = false;
        let gameOver = false;
        let score = 0;
        let bestScore = 0;
        let frameCount = 0;

        // Bird properties
        const bird = {
            x: 80,
            y: 250,
            width: 34,
            height: 24,
            velocity: 0,
            gravity: 0.12,
            jump: -3.5,
            rotation: 0
        };

        // Pipe properties
        const pipes = [];
        const pipeWidth = 60;
        const pipeGap = 150;
        const pipeSpeed = 2.5;

        function drawBird() {
            ctx.save();
            ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
            
            // Rotate based on velocity
            const rotation = Math.min(Math.max(bird.velocity * 3, -30), 90) * Math.PI / 180;
            ctx.rotate(rotation);
            
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
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
            ctx.strokeStyle = '#1a6b1a';
            ctx.lineWidth = 3;
            ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);
            
            // Pipe cap top
            ctx.fillRect(pipe.x - 5, pipe.top - 25, pipeWidth + 10, 25);
            ctx.strokeRect(pipe.x - 5, pipe.top - 25, pipeWidth + 10, 25);
            
            // Bottom pipe
            const bottomStart = pipe.top + pipeGap;
            ctx.fillRect(pipe.x, bottomStart, pipeWidth, canvas.height - bottomStart);
            ctx.strokeRect(pipe.x, bottomStart, pipeWidth, canvas.height - bottomStart);
            
            // Pipe cap bottom
            ctx.fillRect(pipe.x - 5, bottomStart, pipeWidth + 10, 25);
            ctx.strokeRect(pipe.x - 5, bottomStart, pipeWidth + 10, 25);
        }

        function drawBackground() {
            // Sky gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F6FF');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Ground
            ctx.fillStyle = '#DEB887';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 5);
        }

        function createPipe() {
            const minTop = 50;
            const maxTop = canvas.height - pipeGap - 100;
            const top = Math.random() * (maxTop - minTop) + minTop;
            
            pipes.push({
                x: canvas.width,
                top: top,
                scored: false
            });
        }

        function updateBird() {
            bird.velocity += bird.gravity;
            bird.y += bird.velocity;
            
            // Ground collision
            if (bird.y + bird.height >= canvas.height - 50) {
                bird.y = canvas.height - 50 - bird.height;
                endGame();
            }
            
            // Ceiling collision
            if (bird.y <= 0) {
                bird.y = 0;
                bird.velocity = 0;
            }
        }

        function updatePipes() {
            if (frameCount % 90 === 0) {
                createPipe();
            }
            
            for (let i = pipes.length - 1; i >= 0; i--) {
                pipes[i].x -= pipeSpeed;
                
                // Check collision
                if (
                    bird.x + bird.width > pipes[i].x &&
                    bird.x < pipes[i].x + pipeWidth &&
                    (bird.y < pipes[i].top || bird.y + bird.height > pipes[i].top + pipeGap)
                ) {
                    endGame();
                }
                
                // Score point
                if (!pipes[i].scored && pipes[i].x + pipeWidth < bird.x) {
                    pipes[i].scored = true;
                    score++;
                    updateScore();
                }
                
                // Remove off-screen pipes
                if (pipes[i].x + pipeWidth < 0) {
                    pipes.splice(i, 1);
                }
            }
        }

        function updateScore() {
            document.getElementById('score').textContent = score;
            if (score > bestScore) {
                bestScore = score;
                document.getElementById('best').textContent = bestScore;
            }
        }

        function flap() {
            if (!gameStarted || gameOver) return;
            bird.velocity = bird.jump;
        }

        function startGame() {
            if (gameStarted && !gameOver) return;
            
            gameStarted = true;
            gameOver = false;
            score = 0;
            frameCount = 0;
            bird.y = 250;
            bird.velocity = 0;
            pipes.length = 0;
            
            document.getElementById('gameOver').classList.remove('show');
            updateScore();
            gameLoop();
        }

        function endGame() {
            if (gameOver) return;
            gameOver = true;
            gameStarted = false;
            
            document.getElementById('finalScore').textContent = score;
            document.getElementById('bestScore').textContent = bestScore;
            document.getElementById('gameOver').classList.add('show');
        }

        function restartGame() {
            startGame();
        }

        function gameLoop() {
            if (!gameStarted || gameOver) return;
            
            frameCount++;
            
            drawBackground();
            
            updateBird();
            updatePipes();
            
            pipes.forEach(drawPipe);
            drawBird();
            
            requestAnimationFrame(gameLoop);
        }

        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!gameStarted) {
                    startGame();
                } else {
                    flap();
                }
            }
        });

        canvas.addEventListener('click', () => {
            if (!gameStarted) {
                startGame();
            } else {
                flap();
            }
        });

        // Initial draw
        drawBackground();
        drawBird();