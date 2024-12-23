document.addEventListener('DOMContentLoaded', () => {
    const gameState = {
        currentStep: 0,
        isTutorialComplete: false,
        score: 0,
        level: 1,
        totalGoodBlocks: 3,
    };

    const elements = {
        tutorialOverlay: document.getElementById('tutorial-overlay'),
        tutorialText: document.getElementById('tutorial-text'),
        initializeGame: document.getElementById('initialize-game'),
        gameArea: document.getElementById('game-area'),
        blocksContainer: document.getElementById('blocks-container'),
        score: document.getElementById('score'),
        level: document.getElementById('level'),
        musicVolume: document.getElementById('music-volume'),
    };

    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
    const synth = new Tone.Synth().toDestination();

    // Background music setup with Howler.js
    const retroMusic = new Howl({
        src: ['retro-game-soundtrack.mp3'], // Replace with your audio file path
        loop: true,
        volume: parseFloat(elements.musicVolume.value),
    });

    // Handle music volume slider
    elements.musicVolume.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        console.log('Adjusting volume to:', volume); // Debugging volume slider
        retroMusic.volume(volume); // Dynamically adjust Howler's volume
    });

    // Toggle music play/pause
    const toggleMusicButton = document.getElementById('toggle-music');
    toggleMusicButton.addEventListener('click', () => {
        if (retroMusic.playing()) {
            retroMusic.pause();
            toggleMusicButton.textContent = 'Play Music';
        } else {
            retroMusic.play();
            toggleMusicButton.textContent = 'Pause Music';
        }
    });

    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    }

    function showTutorialStep() {
        const tutorialSteps = [
            "Welcome to Memory Palace! Press Space or Enter to proceed.",
            "Use Tab to navigate blocks and Space or Enter to select.",
            "Your goal is to find safe blocks using sound cues. Press Enter to start the game.",
        ];
        elements.tutorialText.textContent = tutorialSteps[gameState.currentStep];
        speak(tutorialSteps[gameState.currentStep]);
    }

    function startGame() {
        gameState.isTutorialComplete = true;
        elements.tutorialOverlay.style.display = 'none';
        elements.gameArea.style.display = 'block';
        document.getElementById('music-controls').style.display = 'flex'; // Show music controls
        if (!retroMusic.playing()) retroMusic.play(); // Ensure music doesn't restart
        createBlocks();
        speak("Game started! Use Tab to navigate the blocks and Space or Enter to select them.");
    }

    function createBlocks() {
        elements.blocksContainer.innerHTML = '';
        const totalBlocks = 5;
        const goodBlockIndices = new Set();

        while (goodBlockIndices.size < gameState.totalGoodBlocks) {
            goodBlockIndices.add(Math.floor(Math.random() * totalBlocks));
        }

        for (let i = 0; i < totalBlocks; i++) {
            const block = document.createElement('div');
            block.classList.add('block');
            block.tabIndex = 0; // Make block focusable with Tab
            block.dataset.note = notes[Math.floor(Math.random() * notes.length)];
            block.dataset.isGood = goodBlockIndices.has(i).toString();

            // Play sound on hover or focus
            block.addEventListener('mouseenter', () => synth.triggerAttackRelease(block.dataset.note, '8n'));
            block.addEventListener('focus', () => synth.triggerAttackRelease(block.dataset.note, '8n'));

            // Handle block selection
            block.addEventListener('click', () => handleBlockSelection(block));
            block.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleBlockSelection(block);
                }
            });

            elements.blocksContainer.appendChild(block);
        }
    }

    function handleBlockSelection(block) {
        const isGood = block.dataset.isGood === 'true';
        if (isGood) {
            block.classList.add('selected');
            gameState.score += 10;
            elements.score.textContent = gameState.score;
            speak("Correct block selected!");
        } else {
            block.classList.add('bad');
            speak("Oops! That was a bad block.");
        }

        // Check if all good blocks are selected
        const allGoodBlocksSelected = [...elements.blocksContainer.children].every(
            (block) => block.dataset.isGood === 'true' && block.classList.contains('selected')
        );

        if (allGoodBlocksSelected) {
            speak("Level complete! Proceeding to the next level.");
            setTimeout(() => {
                gameState.level++;
                gameState.totalGoodBlocks++;
                elements.level.textContent = gameState.level;
                createBlocks();
            }, 2000); // Small delay before regenerating blocks
        }
    }

    elements.initializeGame.addEventListener('click', () => {
        showTutorialStep();
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!gameState.isTutorialComplete) {
                    if (gameState.currentStep < 2) {
                        gameState.currentStep++;
                        showTutorialStep();
                    } else {
                        startGame();
                    }
                }
            }
        });
    });
});
