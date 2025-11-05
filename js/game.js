// Lake Superior Fishing Game - Fixed Version
class FishingGame {
    constructor() {
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('fishingBestScore')) || 0;
        this.timeLeft = 30;
        this.isGameActive = false;
        this.fishTimer = null;
        this.gameTimer = null;
        this.audioContext = null;
        this.waveSoundInterval = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateBestScore();
    }
    
    initializeAudio() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
            this.audioContext = null;
        }
    }
    
    playWaveSound() {
        if (!this.audioContext) return;
        
        try {
            // Create more realistic wave sound using Web Audio API
            const duration = 4; // 4 seconds for longer waves
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Wave types: 0 = gentle lapping, 1 = rolling wave, 2 = larger wave
            const waveType = Math.floor(Math.random() * 3);
            
            for (let i = 0; i < buffer.length; i++) {
                const time = i / sampleRate;
                
                let wave1, wave2, wave3, wave4, wave5;
                let noiseLevel = 0.15;
                let amplitude = 0.4;
                
                // Vary frequencies based on wave type for more realism
                switch(waveType) {
                    case 0: // Gentle lapping
                        wave1 = Math.sin(2 * Math.PI * 0.6 * time) * 0.25;
                        wave2 = Math.sin(2 * Math.PI * 1.1 * time) * 0.15;
                        wave3 = Math.sin(2 * Math.PI * 0.3 * time) * 0.2;
                        wave4 = Math.sin(2 * Math.PI * 1.8 * time) * 0.1;
                        amplitude = 0.3;
                        break;
                    case 1: // Rolling wave
                        wave1 = Math.sin(2 * Math.PI * 0.4 * time) * 0.35;
                        wave2 = Math.sin(2 * Math.PI * 0.8 * time) * 0.25;
                        wave3 = Math.sin(2 * Math.PI * 1.5 * time) * 0.18;
                        wave4 = Math.sin(2 * Math.PI * 0.2 * time) * 0.22;
                        wave5 = Math.sin(2 * Math.PI * 2.1 * time) * 0.08;
                        amplitude = 0.45;
                        break;
                    case 2: // Larger wave
                        wave1 = Math.sin(2 * Math.PI * 0.5 * time) * 0.4;
                        wave2 = Math.sin(2 * Math.PI * 0.9 * time) * 0.3;
                        wave3 = Math.sin(2 * Math.PI * 1.3 * time) * 0.22;
                        wave4 = Math.sin(2 * Math.PI * 0.15 * time) * 0.28;
                        wave5 = Math.sin(2 * Math.PI * 2.5 * time) * 0.12;
                        amplitude = 0.5;
                        break;
                }
                
                // Add filtered noise for water texture
                const noise = (Math.random() - 0.5) * noiseLevel * 
                    (1 + 0.3 * Math.sin(2 * Math.PI * 0.1 * time)); // Low frequency modulation
                
                // More natural envelope with variations
                let envelope = 1;
                const attackTime = 0.15 + Math.random() * 0.1; // 0.15-0.25 seconds
                const releaseTime = 0.8 + Math.random() * 0.4; // 0.8-1.2 seconds
                
                if (time < attackTime) {
                    envelope = time / attackTime; // fade in
                } else if (time > duration - releaseTime) {
                    envelope = Math.max(0, (duration - time) / releaseTime); // fade out
                }
                
                // Add slight randomization to prevent robotic sound
                const randomFactor = 1 + (Math.random() - 0.5) * 0.1;
                
                data[i] = (wave1 + wave2 + wave3 + wave4 + (wave5 || 0) + noise) * envelope * amplitude * randomFactor;
            }
            
            // Create and play the sound with some random variation in volume
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            const volume = 0.25 + Math.random() * 0.15; // Vary volume between 0.25-0.4
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
        } catch (e) {
            console.log('Error playing wave sound:', e);
        }
    }
    
    startBackgroundWaves() {
        if (!this.audioContext) return;
        
        // Play wave sound immediately
        this.playWaveSound();
        
        // Continue playing wave sounds more frequently with variation
        this.waveSoundInterval = setInterval(() => {
            if (this.isGameActive) {
                // Add some randomness to timing for natural sound
                const delay = 2000 + Math.random() * 2000; // 2-4 seconds
                setTimeout(() => {
                    if (this.isGameActive) {
                        this.playWaveSound();
                    }
                }, delay);
            }
        }, 3500); // Base interval of 3.5 seconds
    }
    
    stopBackgroundWaves() {
        if (this.waveSoundInterval) {
            clearInterval(this.waveSoundInterval);
            this.waveSoundInterval = null;
        }
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
        
        // Initialize audio context on user interaction
        if (!this.audioContext) {
            this.initializeAudio();
        }
        
        // Resume audio context if suspended (required for user interaction)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isGameActive = true;
        this.score = 0;
        this.timeLeft = 30;
        
        this.updateScore();
        this.updateTime();
        this.startButton.textContent = 'Game Running...';
        this.startButton.disabled = true;
        
        // Clear any existing fish
        this.clearAllFish();
        
        // Start background wave sounds
        this.startBackgroundWaves();
        
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
        
        // Stop background waves
        this.stopBackgroundWaves();
        
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
