// Pair Navigation - Now handled by annotation_ui_controller.js
// This file is kept for backwards compatibility but most functionality
// has been moved to the annotation system

let slider = null;
let sliderInfo = null;

// Initialize slider functionality - DISABLED in favor of annotation system
function initializePairSlider() {
    console.log('Pair slider initialization delegated to annotation system');
    // The annotation_ui_controller.js handles all slider functionality now
}

// Handle slider value changes - DISABLED in favor of annotation system
function handleSliderChange(event) {
    console.log('Slider change handled by annotation system');
    // The annotation_ui_controller.js handles slider changes
}

// Update slider info text - DISABLED in favor of annotation system
function updateSliderInfo() {
    console.log('Slider info updated by annotation system');
    // The annotation_ui_controller.js handles slider info updates
}

// Backwards compatibility function
function onPairsLoaded() {
    console.log('Pairs loaded - annotation system active');
    // No longer needed as annotation system handles initialization
}
    }
}

// Enhanced navigation functions that also update slider
function goToNextPairWithSlider() {
    if (typeof currentPairProcessor !== 'undefined' && currentPairProcessor) {
        if (currentPairIndex < currentPairProcessor.allPairs.length - 1) {
            currentPairIndex++;
            if (typeof loadCurrentPair === 'function') {
                loadCurrentPair();
            }
            updateSliderPosition();
        }
    }
}

function goToPreviousPairWithSlider() {
    if (typeof currentPairProcessor !== 'undefined' && currentPairProcessor) {
        if (currentPairIndex > 0) {
            currentPairIndex--;
            if (typeof loadCurrentPair === 'function') {
                loadCurrentPair();
            }
            updateSliderPosition();
        }
    }
}

// Jump to specific pair
function jumpToPair(index) {
    if (typeof currentPairProcessor !== 'undefined' && currentPairProcessor) {
        if (index >= 0 && index < currentPairProcessor.allPairs.length) {
            currentPairIndex = index;
            if (typeof loadCurrentPair === 'function') {
                loadCurrentPair();
            }
            updateSliderPosition();
        }
    }
}

// Add keyboard shortcuts for navigation
document.addEventListener('keydown', function(event) {
    // Don't interfere if user is typing in form fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch(event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            event.preventDefault();
            goToPreviousPairWithSlider();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            event.preventDefault();
            goToNextPairWithSlider();
            break;
        case 'Home':
            event.preventDefault();
            jumpToPair(0);
            break;
        case 'End':
            event.preventDefault();
            if (currentPairProcessor) {
                jumpToPair(currentPairProcessor.allPairs.length - 1);
            }
            break;
    }
});

// Initialize slider when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other initializations to complete
    setTimeout(initializePairSlider, 500);
});

// Also initialize after pairs are loaded
function onPairsLoaded() {
    setTimeout(() => {
        initializePairSlider();
        // Initialize navigation buttons if the function exists
        if (typeof updateNavigationButtons === 'function') {
            updateNavigationButtons();
        }
    }, 100);
}