/**
 * Purrfect Pal - Virtual Cat Game
 * DOM-based interactive virtual cat
 */

// Global state object to track cat properties
let catState = {
    name: "Whiskers",
    gender: 'male',
    color: 'Orange',
    eyeColor: '#333333', // Default eye color (black)
    mood: 'Content',
    activity: 'Idle',
    energy: 100,
    isSleeping: false,
    position: { x: 50, y: 50 }, // % of container
    lastFed: Date.now(),
    lastPetted: Date.now(),
    isNightMode: false // Added for night mode state
};

// Timeout/interval references for animations and state changes
const actionTimeouts = {
    pet: null,
    feed: null,
    play: null,
    energyDepletion: null,
    energyRecovery: null,
    randomMovement: null
};

/**
 * Initialize the game
 */
function initGame() {
    // Get cat customization from localStorage
    catState.name = localStorage.getItem('catName') || 'Whiskers';
    catState.gender = localStorage.getItem('catGender') || 'male';
    catState.color = localStorage.getItem('catColor') || 'Orange';
    catState.eyeColor = localStorage.getItem('catEyeColor') || '#333333'; // Load eye color
    catState.isNightMode = localStorage.getItem('isNightMode') === 'true'; // Load night mode state
    
    // Set the initial value for the eye color dropdown
    const catEyeColorDropdown = document.getElementById('catEyeColor');
    if (catEyeColorDropdown) {
        catEyeColorDropdown.value = catState.eyeColor;
    }

    // Apply initial night mode setting
    applyNightMode();

    // Create DOM cat if it doesn't exist
    createDOMCat();
    
    // Update cat appearance based on color and eye color
    updateCatAppearance();
    
    // Update UI with initial cat info
    updateCatInfo();
    
    // Update button text with cat name
    updateButtonText();
    
    // Set up event listeners for buttons
    document.getElementById('petButton').addEventListener('click', petCat);
    document.getElementById('feedButton').addEventListener('click', feedCat);
    document.getElementById('playButton').addEventListener('click', playCat);
    document.getElementById('sleepWakeButton').addEventListener('click', toggleSleep);
    document.getElementById('saveCustomization').addEventListener('click', saveCatCustomization); 
    document.getElementById('toggleNightModeButton').addEventListener('click', toggleNightMode); 
    
    // Add event listener for Sirius star
    const siriusStarElement = document.getElementById('siriusStar');
    if (siriusStarElement) {
        siriusStarElement.addEventListener('click', () => {
            showMessage("Trust the plan, work , grind and rest. :D");
        });
    }
    
    // Make cat clickable for petting
    const catContainer = document.getElementById('catContainer');
    if (catContainer) {
        catContainer.addEventListener('click', petCat);
    }
    
    // Set up random cat movements
    startRandomMovements();
    
    // Start energy depletion
    startEnergyDepletion();
    
    // Show welcome message
    showMessage(`Meet ${catState.name}, your ${catState.color.toLowerCase()} ${catState.gender} cat! Try interacting with ${catState.gender === 'male' ? 'him' : 'her'}.`);
}

/**
 * Create DOM-based cat if it doesn't exist
 */
function createDOMCat() {
    // Check if cat environment exists
    let catEnvironment = document.getElementById('catEnvironment');
    if (!catEnvironment) {
        // Create cat environment if it doesn't exist
        catEnvironment = document.createElement('div');
        catEnvironment.id = 'catEnvironment';
        document.getElementById('gameArea').prepend(catEnvironment);
    }
    
    // Check if cat container exists
    let catContainer = document.getElementById('catContainer');
    if (!catContainer) {
        // Create cat container
        catContainer = document.createElement('div');
        catContainer.id = 'catContainer';
        catContainer.style.display = 'block';
        
        // Create cat body and parts
        catContainer.innerHTML = `
            <div id="catBody" class="cat-body">
                <div class="cat-head">
                    <div class="cat-ears">
                        <div class="cat-ear left"></div>
                        <div class="cat-ear right"></div>
                    </div>
                    <div class="cat-face">
                        <div class="cat-eyes">
                            <div class="cat-eye left"></div>
                            <div class="cat-eye right"></div>
                        </div>
                        <div class="cat-nose"></div>
                        <div class="cat-mouth"></div>
                    </div>
                </div>
                <div class="cat-torso"></div>
                <div class="cat-legs">
                    <div class="cat-leg front-left"></div>
                    <div class="cat-leg front-right"></div>
                    <div class="cat-leg back-left"></div>
                    <div class="cat-leg back-right"></div>
                </div>
                <div class="cat-tail"></div>
            </div>
            <div id="catShadow" class="cat-shadow"></div>
        `;
        
        catEnvironment.appendChild(catContainer);
        
        // Create interactive elements if they don't exist
        if (!document.getElementById('foodBowl')) {
            const foodBowl = document.createElement('div');
            foodBowl.id = 'foodBowl';
            foodBowl.className = 'food-bowl empty';
            catEnvironment.appendChild(foodBowl);
        }
        
        if (!document.getElementById('toyBall')) {
            const toyBall = document.createElement('div');
            toyBall.id = 'toyBall';
            toyBall.className = 'toy-ball';
            catEnvironment.appendChild(toyBall);
        }
        
        if (!document.getElementById('catBed')) {
            const catBed = document.createElement('div');
            catBed.id = 'catBed';
            catBed.className = 'cat-bed';
            catEnvironment.appendChild(catBed);
        }
    } else {
        // Make sure cat container is visible
        catContainer.style.display = 'block';
    }
}

/**
 * Update button text with cat name
 */
function updateButtonText() {
    const pronoun = catState.gender === 'male' ? 'him' : 'her';
    
    document.getElementById('petButton').textContent = `Pet ${catState.name}`;
    document.getElementById('feedButton').textContent = `Feed ${catState.name}`;
    document.getElementById('playButton').textContent = `Play with ${catState.name}`;
    document.getElementById('sleepWakeButton').textContent = 
        catState.isSleeping ? `Wake ${catState.name} Up` : `Let ${catState.name} Sleep`;
}

/**
 * Update cat's appearance based on color and eye color
 */
function updateCatAppearance() {
    const catBodyElement = document.getElementById('catBody');
    let colorVar;
    
    switch(catState.color.toLowerCase()) {
        case 'black':
            colorVar = 'var(--cat-black)';
            break;
        case 'white':
            colorVar = 'var(--cat-white)';
            break;
        case 'gray':
            colorVar = 'var(--cat-gray)';
            break;
        case 'calico':
            colorVar = 'var(--cat-calico)';
            break;
        case 'orange':
        default:
            colorVar = 'var(--cat-orange)';
    }
    
    // Apply main color to relevant parts
    const mainColorBodyParts = document.querySelectorAll('.cat-head, .cat-torso, .cat-leg, .cat-tail');
    mainColorBodyParts.forEach(part => {
        if (!part.classList.contains('inner-ear')) { 
            part.style.backgroundColor = colorVar;
        }
    });

    const ears = document.querySelectorAll('.cat-ear');
    ears.forEach(ear => ear.style.borderBottomColor = colorVar);

    if (catBodyElement) {
        catBodyElement.style.setProperty('--cat-eye-color-dynamic', catState.eyeColor);

        // Apply gender-specific body shape
        catBodyElement.classList.remove('male'); // Remove class first to reset
        if (catState.gender === 'male') {
            catBodyElement.classList.add('male');
        }
    }
    
    const eyes = document.querySelectorAll('.cat-eye');
    if (catState.isSleeping) {
        eyes.forEach(eye => eye.classList.add('sleeping'));
    } else {
        eyes.forEach(eye => eye.classList.remove('sleeping'));
    }
}

/**
 * Save cat customization settings
 */
function saveCatCustomization() {
    const nameInput = document.getElementById('catName');
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const colorInput = document.getElementById('catColor');
    const eyeColorInput = document.getElementById('catEyeColor');

    catState.name = nameInput ? nameInput.value : 'Whiskers';
    catState.gender = genderInput ? genderInput.value : 'male';
    catState.color = colorInput ? colorInput.value : 'Orange';
    catState.eyeColor = eyeColorInput ? eyeColorInput.value : '#333333';

    localStorage.setItem('catName', catState.name);
    localStorage.setItem('catGender', catState.gender);
    localStorage.setItem('catColor', catState.color);
    localStorage.setItem('catEyeColor', catState.eyeColor);

    updateCatAppearance();
    updateCatInfo(); // This function might need an update if you want to display eye color
    updateButtonText();
    showMessage(`${catState.name}'s settings have been updated!`);
}

/**
 * Update cat information display
 */
function updateCatInfo() {
    // Check if elements exist before updating
    const nameDisplay = document.getElementById('catNameDisplay');
    if (nameDisplay) nameDisplay.textContent = catState.name;
    
    const genderDisplay = document.getElementById('catGenderDisplay');
    if (genderDisplay) genderDisplay.textContent = catState.gender;
    
    const colorDisplay = document.getElementById('catColorDisplay');
    if (colorDisplay) colorDisplay.textContent = catState.color;
    // If you add an eye color display element:
    // const eyeColorDisplay = document.getElementById('catEyeColorDisplay');
    // if (eyeColorDisplay) eyeColorDisplay.textContent = catState.eyeColor; // Or a more friendly name

    document.getElementById('catMoodDisplay').textContent = catState.mood;
    document.getElementById('catActivityDisplay').textContent = catState.activity;
    document.getElementById('catEnergyDisplay').textContent = catState.energy;
    document.getElementById('energyBar').value = catState.energy;
    document.getElementById('catDescription').textContent = `${catState.name} - ${catState.color} ${catState.gender}`;
}

/**
 * Display a message to the user
 */
function showMessage(message) {
    const messageArea = document.getElementById('userMessage');
    if (messageArea) {
        messageArea.textContent = message;
        
        // Highlight the message briefly
        messageArea.style.backgroundColor = 'rgba(106, 76, 147, 0.1)';
        setTimeout(() => {
            messageArea.style.backgroundColor = '';
        }, 1500);
    }
}

/**
 * Pet the cat
 */
function petCat() {
    if (catState.isSleeping) {
        showMessage(`${catState.name} is sleeping. Try not to disturb ${catState.gender === 'male' ? 'him' : 'her'}.`);
        return;
    }
    
    // Update cat state
    catState.mood = 'Happy';
    catState.lastPetted = Date.now();
    
    // Show message
    showMessage(`${catState.name} purrs happily as you pet ${catState.gender === 'male' ? 'him' : 'her'}!`);
    
    // Update UI
    updateCatInfo();
    
    // Return to normal mood after a while
    clearTimeout(actionTimeouts.pet);
    actionTimeouts.pet = setTimeout(() => {
        if (catState.mood === 'Happy') {
            catState.mood = 'Content';
            updateCatInfo();
        }
    }, 5000);
    
    // Move cat to user's cursor position (simulating it coming to be petted)
    moveCatTo(40, 50);
}

/**
 * Feed the cat
 */
function feedCat() {
    if (catState.isSleeping) {
        showMessage(`${catState.name} is sleeping. Let ${catState.gender === 'male' ? 'him' : 'her'} rest for now.`);
        return;
    }
    
    // Fill the food bowl
    const foodBowl = document.getElementById('foodBowl');
    if (foodBowl) foodBowl.classList.add('filled');
    
    // Update cat state
    catState.activity = 'Eating';
    catState.mood = 'Content';
    catState.energy = Math.min(100, catState.energy + 30);
    catState.lastFed = Date.now();
    
    // Show message
    showMessage(`${catState.name} eagerly eats the food!`);
    
    // Move cat to food bowl
    moveCatTo(20, 80);
    
    // Update UI
    updateCatInfo();
    
    // Return to idle after eating
    clearTimeout(actionTimeouts.feed);
    actionTimeouts.feed = setTimeout(() => {
        if (catState.activity === 'Eating') {
            catState.activity = 'Idle';
            if (foodBowl) foodBowl.classList.remove('filled');
            updateCatInfo();
        }
    }, 6000);
}

/**
 * Play with the cat
 */
function playCat() {
    if (catState.isSleeping) {
        showMessage(`${catState.name} is sleeping. Let ${catState.gender === 'male' ? 'him' : 'her'} rest for now.`);
        return;
    }
    
    // Check energy level
    if (catState.energy < 20) {
        showMessage(`${catState.name} is too tired to play right now. Try feeding ${catState.gender === 'male' ? 'him' : 'her'} first!`);
        return;
    }
    
    // Update cat state
    catState.mood = 'Happy';
    catState.activity = 'Playing';
    catState.energy = Math.max(0, catState.energy - 15);
    
    // Show message
    showMessage(`${catState.name} jumps and plays excitedly!`);
    
    // Move cat to toy ball
    moveCatTo(70, 80);
    
    // Update UI
    updateCatInfo();
    
    // Return to idle after playing
    clearTimeout(actionTimeouts.play);
    actionTimeouts.play = setTimeout(() => {
        if (catState.activity === 'Playing') {
            catState.activity = 'Idle';
            
            // Cat might get hungry after playing
            if (catState.energy < 30) {
                catState.mood = 'Hungry';
                showMessage(`${catState.name} seems hungry after playing.`);
            } else {
                catState.mood = 'Content';
            }
            
            updateCatInfo();
        }
    }, 8000);
}

/**
 * Toggle cat's sleep state
 */
function toggleSleep() {
    if (catState.isSleeping) {
        // Wake up the cat
        catState.isSleeping = false;
        catState.activity = 'Idle';
        catState.mood = 'Content';
        
        showMessage(`${catState.name} wakes up and stretches.`);
        clearInterval(actionTimeouts.energyRecovery); // Stop energy recovery when woken up
    } else {
        // Put cat to sleep
        catState.isSleeping = true;
        catState.activity = 'Sleeping';
        
        showMessage(`${catState.name} curls up and falls asleep.`);
        
        // Move cat to bed
        moveCatTo(80, 70);
        
        // Recover energy while sleeping
        clearInterval(actionTimeouts.energyRecovery); // Clear any existing interval
        actionTimeouts.energyRecovery = setInterval(() => {
            if (catState.isSleeping) {
                catState.energy = Math.min(100, catState.energy + 5);
                updateCatInfo(); // Update energy display
                
                // Cat wakes up when fully rested
                if (catState.energy >= 100) {
                    showMessage(`${catState.name} is fully rested and wakes up!`);
                    toggleSleep(); // This will flip isSleeping and call necessary updates
                    // The interval will be cleared by the toggleSleep call or the isSleeping check
                }
            } else {
                clearInterval(actionTimeouts.energyRecovery);
            }
        }, 3000);
    }
    
    // Update UI
    updateCatInfo();
    updateCatAppearance(); // Handles eye closing/opening
    updateButtonText();    // Correctly updates the sleep/wake button text
}

/**
 * Move cat to a specific position in the environment
 * @param {number} x - X position as percentage of container width
 * @param {number} y - Y position as percentage of container height
 */
function moveCatTo(x, y) {
    const catContainer = document.getElementById('catContainer');
    if (catContainer) {
        catState.position.x = x;
        catState.position.y = y;
        
        catContainer.style.transition = 'all 1s ease';
        catContainer.style.left = `${x}%`;
        catContainer.style.top = `${y}%`;
    }
}

/**
 * Start random cat movements when idle
 */
function startRandomMovements() {
    clearInterval(actionTimeouts.randomMovement);
    
    actionTimeouts.randomMovement = setInterval(() => {
        // Only move if cat is idle and not sleeping
        if (catState.activity === 'Idle' && !catState.isSleeping) {
            // 30% chance to move
            if (Math.random() < 0.3) {
                const newX = 10 + Math.random() * 80; // Keep away from edges
                const newY = 20 + Math.random() * 60; // Keep away from edges
                
                moveCatTo(newX, newY);
            }
        }
    }, 5000);
}

/**
 * Gradually decrease energy over time when cat is active
 */
function startEnergyDepletion() {
    clearInterval(actionTimeouts.energyDepletion);
    
    actionTimeouts.energyDepletion = setInterval(() => {
        // Only decrease energy if cat is not sleeping
        if (!catState.isSleeping) {
            // Decrease energy
            catState.energy = Math.max(0, catState.energy - 1);
            
            // Update UI
            updateCatInfo();
            
            // Cat gets hungry when energy is low
            if (catState.energy < 30 && catState.mood !== 'Hungry') {
                catState.mood = 'Hungry';
                showMessage(`${catState.name} is getting hungry.`);
                updateCatInfo();
            }
            
            // Cat falls asleep automatically when very tired
            if (catState.energy < 10 && !catState.isSleeping) {
                showMessage(`${catState.name} is too tired and falls asleep.`);
                toggleSleep();
            }
        }
    }, 5000); // Decrease energy every 5 seconds
}

/**
 * Handle cat customization form
 */
function setupCustomizationForm() {
    const saveButton = document.getElementById('saveCustomization');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            // Get values from form
            const nameInput = document.getElementById('catName');
            const genderInputs = document.getElementsByName('gender');
            const colorSelect = document.getElementById('catColor');
            
            // Update cat name
            if (nameInput) {
                catState.name = nameInput.value || 'Whiskers';
                localStorage.setItem('catName', catState.name);
            }
            
            // Update cat gender
            let selectedGender = 'male';
            for (const input of genderInputs) {
                if (input.checked) {
                    selectedGender = input.value;
                    break;
                }
            }
            catState.gender = selectedGender;
            localStorage.setItem('catGender', catState.gender);
            
            // Update cat color
            if (colorSelect) {
                catState.color = colorSelect.value || 'Orange';
                localStorage.setItem('catColor', catState.color);
            }
            
            // Update cat appearance
            updateCatAppearance();
            
            // Update UI
            updateCatInfo();
            
            // Show message
            showMessage(`${catState.name}'s appearance has been updated!`);
        });
    }
    
    // Initialize form with current values
    const nameInput = document.getElementById('catName');
    if (nameInput) {
        nameInput.value = catState.name;
    }
    
    const genderInputs = document.getElementsByName('gender');
    for (const input of genderInputs) {
        if (input.value === catState.gender) {
            input.checked = true;
            break;
        }
    }
    
    const colorSelect = document.getElementById('catColor');
    if (colorSelect) {
        for (let i = 0; i < colorSelect.options.length; i++) {
            if (colorSelect.options[i].value === catState.color) {
                colorSelect.selectedIndex = i;
                break;
            }
        }
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    initGame();
    
    // Set up customization form
    setupCustomizationForm();
});

// Handle window resize
window.addEventListener('resize', () => {
    // No need to adjust anything for DOM-based cat
});

/**
 * Toggles night mode on/off
 */
function toggleNightMode() {
    catState.isNightMode = !catState.isNightMode;
    localStorage.setItem('isNightMode', catState.isNightMode.toString()); // Store as string
    applyNightMode();
}

/**
 * Applies night mode visuals based on catState.isNightMode
 */
function applyNightMode() {
    const gameArea = document.getElementById('gameArea');
    const toggleButton = document.getElementById('toggleNightModeButton');
    // const siriusStar = document.getElementById('siriusStar'); // CSS handles visibility

    if (gameArea) {
        if (catState.isNightMode) {
            gameArea.classList.add('night-mode');
            if (toggleButton) toggleButton.textContent = 'Disable Night Mode';
            // if (siriusStar) siriusStar.style.display = 'block'; // CSS handles this now
        } else {
            gameArea.classList.remove('night-mode');
            if (toggleButton) toggleButton.textContent = 'Enable Night Mode';
            // if (siriusStar) siriusStar.style.display = 'none'; // CSS handles this now
        }
    }
}