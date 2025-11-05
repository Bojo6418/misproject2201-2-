// Lake Superior Fishing Game - Fixed Version
class FishingGame {
    constructor() {
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('fishingBestScore')) || 0;
        this.timeLeft = 30;
        this.isGameActive = false;
        this.fishTimer = null;
        this.gameTimer = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateBestScore();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.timeElement = document.getElementById('time');
        this.bestElement = document.getElementById('best');
        this.startButton = document.getElementById('start');
        this.playArea = document.querySelector('.play-area');
    }
    
    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
    }
    
    startGame() {
        if (this.isGameActive) return;
        
        this.isGameActive = true;
        this.score = 0;
        this.timeLeft = 30;
        
        this.updateScore();
        this.updateTime();
        this.startButton.textContent = 'Game Running...';
        this.startButton.disabled = true;
        
        // Clear any existing fish
        this.clearAllFish();
        
        // Start the timers
        this.startGameTimer();
        this.startFishSpawner();
    }
    
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateTime();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    startFishSpawner() {
        this.fishTimer = setInterval(() => {
            this.spawnFish();
        }, 1500); // Spawn fish every 1.5 seconds
    }
    
    spawnFish() {
        const fishTypes = [
            { class: 'fish-1', emoji: '🐟', points: 10 },
            { class: 'fish-2', emoji: '🐠', points: 15 },
            { class: 'fish-3', emoji: '🐡', points: 20 },
            { class: 'fish-4', emoji: '🦈', points: 25 }
        ];
        
        const randomFish = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        const fish = document.createElement('div');
        fish.className = `fish ${randomFish.class}`;
        fish.textContent = randomFish.emoji;
        fish.dataset.points = randomFish.points;
        
        // Enhanced fish attributes for better clicking
        fish.style.cursor = 'pointer';
        fish.style.zIndex = '10';
        fish.style.pointerEvents = 'auto';
        fish.style.userSelect = 'none';
        fish.style.position = 'absolute';
        fish.style.transform = 'none';
        fish.style.animation = 'swim 6s linear infinite';
        fish.style.webkitUserSelect = 'none';
        fish.style.mozUserSelect = 'none';
        fish.style.msUserSelect = 'none';
        
        // Random vertical position within play area
        const playAreaRect = this.playArea.getBoundingClientRect();
        const fishSize = 50;
        const maxHeight = Math.max(0, playAreaRect.height - fishSize - 20);
        const randomY = Math.random() * maxHeight;
        
        fish.style.top = `${randomY}px`;
        fish.style.left = '-50px'; // Start off-screen on the left
        
        // Add comprehensive event listeners for all interaction types
        const catchHandler = (e) => {
            console.log('Fish clicked!', randomFish.emoji, 'points:', randomFish.points);
            e.preventDefault();
            e.stopPropagation();
            this.catchFish(fish);
        };
        
        fish.addEventListener('click', catchHandler, false);
        fish.addEventListener('mousedown', catchHandler, false);
        fish.addEventListener('touchstart', catchHandler, false);
        fish.addEventListener('pointerdown', catchHandler, false);
        
        this.playArea.appendChild(fish);
        
        // Remove fish after slower animation (8 seconds)
        setTimeout(() => {
            if (fish.parentNode) {
                this.playArea.removeChild(fish);
            }
        }, 8000);
    }
    
    catchFish(fish) {
        console.log('catchFish called');
        if (!this.isGameActive) {
            console.log('Game not active');
            return;
        }
        
        const points = parseInt(fish.dataset.points);
        console.log('Adding points:', points);
        this.score += points;
        
        // Enhanced visual feedback
        fish.style.transform = 'scale(1.5) rotate(15deg)';
        fish.style.opacity = '0.3';
        fish.style.transition = 'all 0.2s ease';
        
        // Update score with animation
        this.scoreElement.classList.add('score-change');
        setTimeout(() => {
            this.scoreElement.classList.remove('score-change');
        }, 500);
        
        this.updateScore();
        
        // Remove the fish immediately
        if (fish.parentNode) {
            this.playArea.removeChild(fish);
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateTime() {
        this.timeElement.textContent = this.timeLeft;
    }
    
    updateBestScore() {
        this.bestElement.textContent = this.bestScore;
    }
    
    endGame() {
        this.isGameActive = false;
        
        // Clear timers
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.fishTimer) {
            clearInterval(this.fishTimer);
            this.fishTimer = null;
        }
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('fishingBestScore', this.bestScore.toString());
            this.updateBestScore();
        }
        
        // Clear all fish
        this.clearAllFish();
        
        // Show game over message
        this.showGameOverMessage();
        
        // Reset start button
        this.startButton.textContent = 'Start Game';
        this.startButton.disabled = false;
    }
    
    clearAllFish() {
        const fishElements = this.playArea.querySelectorAll('.fish');
        fishElements.forEach(fish => fish.remove());
    }
    
    showGameOverMessage() {
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>Time's Up!</h2>
            <p>Your Score: ${this.score}</p>
            <p>Best Score: ${this.bestScore}</p>
            <button class="btn" onclick="this.parentElement.remove()">Close</button>
        `;
        
        this.playArea.appendChild(gameOverDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (gameOverDiv.parentNode) {
                gameOverDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    const fishingGame = new FishingGame();
});
