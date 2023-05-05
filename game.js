// Variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const playerSpeed = 5;
const bulletSpeed = 10;
const enemies = [];
const powerUps = [];
let spawnInterval = 2000;
let lastSpawnTime = 0;
let lastPowerUpSpawnTime = 0;
let powerUpSpawnInterval = 10000; // 10 seconds
let gameOver = false;
const gameState = { score: 0, upgrades: 0, defeatedEnemies: 0 };


const player = { x: canvas.width / 2, y: canvas.height / 2, size: 20 };
const bullets = [];

// Controls
let keys = {};
document.addEventListener("keydown", (e) => { keys[e.keyCode] = true; });
document.addEventListener("keyup", (e) => { keys[e.keyCode] = false; });
canvas.addEventListener("click", shootBullet);

// Game loop
function gameLoop() {
    if (gameOver) {
        showGameOverScreen();
        return;
    }

    update();
    render();

    if (Date.now() - lastPowerUpSpawnTime > powerUpSpawnInterval) {
        spawnPowerUp();
        lastPowerUpSpawnTime = Date.now();
    }

    requestAnimationFrame(gameLoop);
}

// Call gameLoop();
gameLoop();
function update() {
    handlePlayerMovement();
    handleBullets();
    handleEnemies();
    handlePowerUps(); // Add this line
    const pointsEarned = checkCollisions();
    gameState.score += pointsEarned;
    
    // Check upgrade when the player reaches 5 points
      if (gameState.score >= 10 && gameState.upgrades < 1) {
        gameState.upgrades = 1;
    }
}


function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPowerUps(); // Add this line
    drawKillCount();
}
// Helper functions
function handlePlayerMovement() {
    if (keys[87] || keys[38]) player.y = Math.max(player.y - playerSpeed, player.size / 2);
    if (keys[83] || keys[40]) player.y = Math.min(player.y + playerSpeed, canvas.height - player.size / 2);
    if (keys[65] || keys[37]) player.x = Math.max(player.x - playerSpeed, player.size / 2);
    if (keys[68] || keys[39]) player.x = Math.min(player.x + playerSpeed, canvas.width - player.size / 2);
}
function shootBullet(e) {
    const directionX = e.clientX - canvas.offsetLeft - player.x;
    const directionY = e.clientY - canvas.offsetTop - player.y;
    const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
    const normalizedDirectionX = directionX / magnitude;
    const normalizedDirectionY = directionY / magnitude;

    if (gameState.upgrades & 1) { // Check if the first bit is set
        const angleOffsets = [-15 * (Math.PI / 180), 0, 15 * (Math.PI / 180)];
        angleOffsets.forEach((angleOffset) => {
            shootBulletWithAngleOffset(normalizedDirectionX, normalizedDirectionY, angleOffset);
        });
    } else {
        const bullet = { x: player.x, y: player.y, directionX: normalizedDirectionX, directionY: normalizedDirectionY, size: 5 };
        bullets.push(bullet);
    }

    if (gameState.upgrades & (1 << 1)) { // Check if the second bit is set (backwards shooting power-up)
        const backwardsDirectionX = -normalizedDirectionX;
        const backwardsDirectionY = -normalizedDirectionY;
        const bullet = { x: player.x, y: player.y, directionX: backwardsDirectionX, directionY: backwardsDirectionY, size: 5 };
        bullets.push(bullet);
    }
}

function shootBulletWithAngleOffset(directionX, directionY, angleOffset) {
    const cosTheta = Math.cos(angleOffset);
    const sinTheta = Math.sin(angleOffset);
    const rotatedDirectionX = directionX * cosTheta - directionY * sinTheta;
    const rotatedDirectionY = directionX * sinTheta + directionY * cosTheta;

    const bullet = { x: player.x, y: player.y, directionX: rotatedDirectionX, directionY: rotatedDirectionY, size: 5 };
    bullets.push(bullet);
}





function handleBullets() {
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        bullet.x += bullet.directionX * bulletSpeed;
        bullet.y += bullet.directionY * bulletSpeed;

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

function handleEnemies() {
    if (Date.now() - lastSpawnTime > spawnInterval) {
        spawnEnemy();
        lastSpawnTime = Date.now();
        spawnInterval *= 0.99;
    }

    for (const enemy of enemies) {
        const directionX = player.x - enemy.x;
        const directionY = player.y - enemy.y;
        const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
        const normalizedDirectionX = directionX / magnitude;
        const normalizedDirectionY = directionY / magnitude;

        // Adjust enemy speed when the player's score reaches 10 points
        const speedMultiplier = (gameState.score >= 10) ? 2 : 1;
        const adjustedSpeed = enemy.speed * speedMultiplier;

        enemy.x += normalizedDirectionX * adjustedSpeed;
        enemy.y += normalizedDirectionY * adjustedSpeed;
    }
}



function spawnEnemy() {
    const { defeatedEnemies } = gameState;
    let x, y;
    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
    } while (Math.hypot(player.x - x, player.y - y) < 100);
    
    const baseEnemy = { x: x, y: y, size: 20, hits: 0, speed: 2 };
    const balloonProperties = getBalloonProperties(defeatedEnemies);
    
    const enemy = { ...baseEnemy, ...balloonProperties };
    enemies.push(enemy);
}


function drawPlayer() {
    ctx.fillStyle = "teal";
    ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
}

function drawBullets() {
    ctx.fillStyle = "red";
    for (const bullet of bullets) {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawEnemies() {
    for (const enemy of enemies) {
        switch (enemy.type) {
            case 'red':
                ctx.fillStyle = "red";
                break;
            case 'blue':
                ctx.fillStyle = "blue";
                break;
            case 'green':
                ctx.fillStyle = "green";
                break;
            case 'yellow':
                ctx.fillStyle = "yellow";
                break;
            case 'pink':
                ctx.fillStyle = "pink";
                break;
            case 'black':
                ctx.fillStyle = "black";
                break;
            case 'purple':
                ctx.fillStyle = "#800080";
                break;
            case 'white':
                ctx.fillStyle = "white";
                break;
            case 'silver':
                ctx.fillStyle = "#C0C0C0";
                break;
            case 'bw': // black and white
                ctx.fillStyle = ctx.createLinearGradient(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.x + enemy.size / 2, enemy.y + enemy.size / 2);
                ctx.fillStyle.addColorStop(0, "black");
                ctx.fillStyle.addColorStop(1, "white");
                break;
            case 'rainbow':
                const gradient = ctx.createLinearGradient(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.x + enemy.size / 2, enemy.y + enemy.size / 2);
                gradient.addColorStop(0, "red");
                gradient.addColorStop(0.15, "orange");
                gradient.addColorStop(0.3, "yellow");
                gradient.addColorStop(0.45, "green");
                gradient.addColorStop(0.6, "blue");
                gradient.addColorStop(0.75, "indigo");
                gradient.addColorStop(1, "violet");
                ctx.fillStyle = gradient;
                break;
            case 'ceramic':
                ctx.fillStyle = "#B5B5B5";
                break;
        }
        ctx.fillRect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
    }
}


function splitEnemy(enemy) {
    const { type, x, y, size, health, speed } = enemy;
    return [{ x, y, size, health, speed, hits: 0, type: enemy.childrenType },
            { x, y, size, health, speed, hits: 0, type: enemy.childrenType }];
}

function checkCollisions() {
    let enemiesDestroyed = 0;

    for (const enemy of enemies) {
        if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < (player.size + enemy.size) / 2) {
            gameOver = true;
            break;
        }
    }

    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            const bullet = bullets[i];
            const enemy = enemies[j];

            if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < (bullet.size + enemy.size) / 2) {
                bullets.splice(i, 1);
                i--;

                enemy.hits++;
                if (enemy.hits === enemy.health) {
                    enemies.splice(j, 1);
                    j--;
                    gameState.defeatedEnemies++;
                    enemiesDestroyed++;

                    if (enemy.childrenType) {
                        const children = splitEnemy(enemy);
                        enemies.push(...children);
                    }
                }
                break;
            }
        }
    }

    return enemiesDestroyed;
}

function showGameOverScreen() {
    const gameOverScreen = document.getElementById("gameOverScreen");
    gameOverScreen.innerHTML = `<h1>Game Over</h1><p>Score: ${gameState.score}</p><button id="restartButton">Restart</button>`;
    gameOverScreen.style.display = "block";
}

function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    bullets.length = 0;
    enemies.length = 0;
    spawnInterval = 2000;
    lastSpawnTime = 0;
    gameOver = false;
    gameState.score = 0;
    gameState.upgrades = 0; // Added this line to reset player upgrades
    gameState.defeatedEnemies = 0; // Added this line to reset defeatedEnemies

    const gameOverScreen = document.getElementById("gameOverScreen");
    gameOverScreen.style.display = "none";

    gameLoop();
}

function drawKillCount() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.fillText(`Kills: ${gameState.defeatedEnemies}`, canvas.width - 10, 30);

    let currentLevel = 1;
    if(gameState.defeatedEnemies >= 30) currentLevel = 4;
    else if(gameState.defeatedEnemies >= 20) currentLevel = 3;
    else if(gameState.defeatedEnemies >= 10) currentLevel = 2;

    ctx.fillText(`Level: ${currentLevel}`, canvas.width - 10, 60);
}

function getBalloonProperties(defeatedEnemies) {
    const baseSpeed = 2;
    const speedIncrement = 0.15;

    if (defeatedEnemies < 10) 
        return {
            type: 'red', 
            health: 1, 
            speed: baseSpeed 
        };
    if (defeatedEnemies < 20) 
        return {
            type: 'blue', 
            health: 2, 
            speed: baseSpeed * (1 + speedIncrement),
            childrenType: 'red', 
            childrenHealth: 1
        };
    if (defeatedEnemies < 30) 
        return {
            type: 'green', 
            health: 3, 
            speed: baseSpeed * (1 + speedIncrement * 2), 
            childrenType: 'blue', 
            childrenHealth: 2 
        };
    if (defeatedEnemies < 40) 
        return {
            type: 'yellow', 
            health: 4, 
            speed: baseSpeed * (1 + speedIncrement * 3),
            childrenType: 'green', 
            childrenHealth: 3
        };
	 if (defeatedEnemies < 50)
        return {
            type: 'black',
            health: 6,
            speed: baseSpeed * (1 + speedIncrement * 5),
            childrenType: 'pink',
            childrenHealth: 5
        };
    if (defeatedEnemies < 60)
        return {
            type: 'white',
            health: 7,
            speed: baseSpeed * (1 + speedIncrement * 6),
            childrenType: 'black',
            childrenHealth: 6
        };
    if (defeatedEnemies < 70)
        return {
            type: 'purple',
            health: 8,
            speed: baseSpeed * (1 + speedIncrement * 7),
            childrenType: 'white',
            childrenHealth: 7
        };
    if (defeatedEnemies < 80)
        return {
            type: 'silver',
            health: 9,
            speed: baseSpeed * (1 + speedIncrement * 8),
            childrenType: 'purple',
            childrenHealth: 8
        };
    if (defeatedEnemies < 90)
        return {
            type: 'bw',
            health: 10,
            speed: baseSpeed * (1 + speedIncrement * 9),
            childrenType: 'silver',
            childrenHealth: 9
        };
    if (defeatedEnemies < 100)
        return {
            type: 'rainbow',
            health: 11,
            speed: baseSpeed * (1 + speedIncrement * 10),
            childrenType: 'bw',
            childrenHealth: 10
        };
    if (defeatedEnemies < 110)
        return {
            type: 'ceramic',
            health: 12,
            speed: baseSpeed * (1 + speedIncrement * 11),
            childrenType: 'rainbow',
            childrenHealth: 11
        };
    return { 
        type: 'red', 
        health: 1, 
        speed: baseSpeed
    };
}
function spawnPowerUp() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    const powerUp = { x: x, y: y, size: 10, type: 'backwards_shooting' };
    powerUps.push(powerUp);
}
function handlePowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        const powerUp = powerUps[i];

        if (Math.hypot(player.x - powerUp.x, player.y - powerUp.y) < (player.size + powerUp.size) / 2) {
            powerUps.splice(i, 1);
            i--;

            if (powerUp.type === 'backwards_shooting') {
                gameState.upgrades |= 1 << 1; // Set the second bit to 1
            }
        }
    }
}
function drawPowerUps() {
    ctx.fillStyle = "cyan";
    for (const powerUp of powerUps) {
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.size, 0, 2 * Math.PI);
        ctx.fill();
    }
}
document.addEventListener("click", (e) => {
    if (e.target.id === "restartButton") {
        resetGame();
    }
});
gameLoop();