// Simple Evaluation Form Functions

// Storage for evaluations
let simpleEvaluations = {};
let currentPair = null;

// Initialize simple evaluation for a pair
function initializeSimpleEvaluation(pairId, pairMetadata) {
    currentPair = { id: pairId, metadata: pairMetadata };
    
    if (!simpleEvaluations[pairId]) {
        simpleEvaluations[pairId] = {
            pairId: pairId,
            metadata: pairMetadata,
            chartA: {
                precision: { yes: false, no: false },
                readable: { yes: false, no: false },
                imagePath: null
            },
            chartB: {
                precision: { yes: false, no: false },
                readable: { yes: false, no: false },
                imagePath: null
            },
            overallPreference: null,
            completed: false,
            timestamp: null,
            displayedImages: {
                chartA: null,
                chartB: null
            }
        };
    }
    
    // Load saved responses into the form
    loadSimpleEvaluation(pairId);
}

// Save current evaluation responses
function saveSimpleEvaluation() {
    if (!currentPair) {
        console.warn('No current pair to save evaluation for');
        return;
    }
    
    const pairId = currentPair.id;
    const evaluation = simpleEvaluations[pairId];
    
    if (!evaluation) {
        console.warn('No evaluation object found for pair:', pairId);
        return;
    }
    
    // Collect form data - handle both yes and no checkboxes
    evaluation.chartA.readable = {
        yes: document.getElementById('chart_a_readable_yes') ? document.getElementById('chart_a_readable_yes').checked : false,
        no: document.getElementById('chart_a_readable_no') ? document.getElementById('chart_a_readable_no').checked : false
    };
    evaluation.chartA.precision = {
        yes: document.getElementById('chart_a_precision_yes') ? document.getElementById('chart_a_precision_yes').checked : false,
        no: document.getElementById('chart_a_precision_no') ? document.getElementById('chart_a_precision_no').checked : false
    };
    evaluation.chartB.readable = {
        yes: document.getElementById('chart_b_readable_yes') ? document.getElementById('chart_b_readable_yes').checked : false,
        no: document.getElementById('chart_b_readable_no') ? document.getElementById('chart_b_readable_no').checked : false
    };
    evaluation.chartB.precision = {
        yes: document.getElementById('chart_b_precision_yes') ? document.getElementById('chart_b_precision_yes').checked : false,
        no: document.getElementById('chart_b_precision_no') ? document.getElementById('chart_b_precision_no').checked : false
    };
    
    // Capture actual displayed image paths
    const chartAImg = document.getElementById('chartA');
    const chartBImg = document.getElementById('chartB');
    
    evaluation.chartA.imagePath = chartAImg ? chartAImg.src : null;
    evaluation.chartB.imagePath = chartBImg ? chartBImg.src : null;
    
    // Also store in displayedImages for backward compatibility
    evaluation.displayedImages = {
        chartA: evaluation.chartA.imagePath,
        chartB: evaluation.chartB.imagePath
    };
    
    // Get overall preference
    const preferenceRadios = document.querySelectorAll('input[name="overall_preference"]');
    evaluation.overallPreference = null;
    for (const radio of preferenceRadios) {
        if (radio.checked) {
            evaluation.overallPreference = radio.value;
            break;
        }
    }
    
    evaluation.timestamp = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('simpleEvaluations', JSON.stringify(simpleEvaluations));
    
    // Show success message
    showNotification('✅ Evaluation saved successfully!', 'success');
    
    console.log('Saved evaluation for pair:', pairId, evaluation);
}

// Submit evaluation (complete it)
async function submitSimpleEvaluation() {
    if (!currentPair) {
        console.warn('No current pair to submit evaluation for');
        return;
    }
    
    const pairId = currentPair.id;
    
    // First save the current responses
    saveSimpleEvaluation();
    
    const evaluation = simpleEvaluations[pairId];
    
    // Check if all required fields are filled
    if (!evaluation.overallPreference) {
        showNotification('❗ Please select an overall preference before submitting.', 'warning');
        return;
    }
    
    // Mark as completed
    evaluation.completed = true;
    evaluation.submittedAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('simpleEvaluations', JSON.stringify(simpleEvaluations));
    
    // Show submitting message
    showNotification('⏳ Submitting evaluation...', 'info');
    
    try {
        // Submit to backend
        const submitData = {
            pairId: pairId,
            evaluation: evaluation,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            sessionId: getOrCreateSessionId(),
            url: window.location.href,
            imageInfo: {
                chartA: {
                    src: evaluation.chartA.imagePath,
                    filename: evaluation.chartA.imagePath ? evaluation.chartA.imagePath.split('/').pop() : null
                },
                chartB: {
                    src: evaluation.chartB.imagePath,
                    filename: evaluation.chartB.imagePath ? evaluation.chartB.imagePath.split('/').pop() : null
                },
                baseUrl: window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '')
            }
        };
        
        // Determine the API endpoint based on environment
        const apiEndpoint = window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com') 
            ? '/.netlify/functions/submit-evaluation'  // Netlify
            : window.location.hostname.includes('vercel.app') 
            ? '/api/submit-evaluation'  // Vercel
            : window.location.hostname.includes('github.io')
            ? 'https://your-netlify-site.netlify.app/.netlify/functions/submit-evaluation'  // GitHub Pages to Netlify
            : '/api/submit-evaluation';  // Local or other
        
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submitData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Backend submission successful:', result);
        
        // Show success message
        showNotification('🎉 Evaluation submitted successfully to server!', 'success');
        
    } catch (error) {
        console.error('Error submitting to backend:', error);
        showNotification('⚠️ Evaluation saved locally but failed to submit to server. Will retry later.', 'warning');
        
        // Mark for retry
        evaluation.needsServerSubmission = true;
        localStorage.setItem('simpleEvaluations', JSON.stringify(simpleEvaluations));
    }
    
    // Update navigation controls if they exist
    if (typeof updateNavigationControls === 'function') {
        updateNavigationControls();
    }
    
    console.log('Submitted evaluation for pair:', pairId, evaluation);
    
    // Optional: automatically move to next pair
    setTimeout(() => {
        if (typeof goToNextPair === 'function') {
            goToNextPair();
        }
    }, 1500);
}

// Load saved evaluation into the form
function loadSimpleEvaluation(pairId) {
    const evaluation = simpleEvaluations[pairId];
    
    if (!evaluation) {
        console.log('No saved evaluation found for pair:', pairId);
        return;
    }
    
    // Load checkbox states - handle both old and new formats
    const chartAReadableYes = document.getElementById('chart_a_readable_yes');
    const chartAReadableNo = document.getElementById('chart_a_readable_no');
    const chartAPrecisionYes = document.getElementById('chart_a_precision_yes');
    const chartAPrecisionNo = document.getElementById('chart_a_precision_no');
    const chartBReadableYes = document.getElementById('chart_b_readable_yes');
    const chartBReadableNo = document.getElementById('chart_b_readable_no');
    const chartBPrecisionYes = document.getElementById('chart_b_precision_yes');
    const chartBPrecisionNo = document.getElementById('chart_b_precision_no');
    
    if (evaluation.chartA.readable && typeof evaluation.chartA.readable === 'object') {
        if (chartAReadableYes) chartAReadableYes.checked = evaluation.chartA.readable.yes;
        if (chartAReadableNo) chartAReadableNo.checked = evaluation.chartA.readable.no;
    }
    if (evaluation.chartA.precision && typeof evaluation.chartA.precision === 'object') {
        if (chartAPrecisionYes) chartAPrecisionYes.checked = evaluation.chartA.precision.yes;
        if (chartAPrecisionNo) chartAPrecisionNo.checked = evaluation.chartA.precision.no;
    }
    if (evaluation.chartB.readable && typeof evaluation.chartB.readable === 'object') {
        if (chartBReadableYes) chartBReadableYes.checked = evaluation.chartB.readable.yes;
        if (chartBReadableNo) chartBReadableNo.checked = evaluation.chartB.readable.no;
    }
    if (evaluation.chartB.precision && typeof evaluation.chartB.precision === 'object') {
        if (chartBPrecisionYes) chartBPrecisionYes.checked = evaluation.chartB.precision.yes;
        if (chartBPrecisionNo) chartBPrecisionNo.checked = evaluation.chartB.precision.no;
    }
    
    // Load overall preference
    if (evaluation.overallPreference) {
        const preferenceRadio = document.querySelector(`input[name="overall_preference"][value="${evaluation.overallPreference}"]`);
        if (preferenceRadio) {
            preferenceRadio.checked = true;
        }
    }
    
    console.log('Loaded evaluation for pair:', pairId, evaluation);
}

// Clear form responses
function clearSimpleEvaluationForm() {
    // Clear checkboxes
    const checkboxes = document.querySelectorAll('.simple-evaluation-form input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear radio buttons
    const radioButtons = document.querySelectorAll('.simple-evaluation-form input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
}

// Get evaluation statistics
function getSimpleEvaluationStats() {
    const totalEvaluations = Object.keys(simpleEvaluations).length;
    const completedEvaluations = Object.values(simpleEvaluations).filter(eval => eval.completed).length;
    
    return {
        total: totalEvaluations,
        completed: completedEvaluations,
        remaining: totalEvaluations - completedEvaluations
    };
}

// Export evaluations as JSON
function exportSimpleEvaluations() {
    const evaluations = JSON.parse(localStorage.getItem('simpleEvaluations') || '{}');
    const dataStr = JSON.stringify(evaluations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'simple-chart-evaluations-' + new Date().toISOString().slice(0, 10) + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('📁 Evaluations exported successfully!', 'success');
}

// Show notification message
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#d4edda' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
        color: ${type === 'success' ? '#155724' : type === 'warning' ? '#856404' : '#0c5460'};
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Navigation helper functions
function goToNextPair() {
    // Use the enhanced slider navigation if available
    if (typeof goToNextPairWithSlider === 'function') {
        goToNextPairWithSlider();
    } else if (typeof currentPairProcessor !== 'undefined' && currentPairProcessor) {
        if (currentPairIndex < currentPairProcessor.allPairs.length - 1) {
            currentPairIndex++;
            if (typeof loadCurrentPair === 'function') {
                loadCurrentPair();
            }
        }
    }
}

function goToPreviousPair() {
    // Use the enhanced slider navigation if available
    if (typeof goToPreviousPairWithSlider === 'function') {
        goToPreviousPairWithSlider();
    } else if (typeof currentPairProcessor !== 'undefined' && currentPairProcessor) {
        if (currentPairIndex > 0) {
            currentPairIndex--;
            if (typeof loadCurrentPair === 'function') {
                loadCurrentPair();
            }
        }
    }
}

// Load saved evaluations from localStorage on page load
function loadSavedSimpleEvaluations() {
    const saved = localStorage.getItem('simpleEvaluations');
    if (saved) {
        try {
            simpleEvaluations = JSON.parse(saved);
            console.log('Loaded saved evaluations:', Object.keys(simpleEvaluations).length, 'pairs');
        } catch (error) {
            console.error('Error loading saved evaluations:', error);
            simpleEvaluations = {};
        }
    }
}

// Update image paths for current evaluation
function updateEvaluationImagePaths(pairId) {
    if (!pairId || !simpleEvaluations[pairId]) return;
    
    const chartAImg = document.getElementById('chartA');
    const chartBImg = document.getElementById('chartB');
    
    if (chartAImg && chartAImg.src) {
        simpleEvaluations[pairId].chartA.imagePath = chartAImg.src;
        simpleEvaluations[pairId].displayedImages.chartA = chartAImg.src;
        console.log('Updated Chart A path:', chartAImg.src);
    }
    
    if (chartBImg && chartBImg.src) {
        simpleEvaluations[pairId].chartB.imagePath = chartBImg.src;
        simpleEvaluations[pairId].displayedImages.chartB = chartBImg.src;
        console.log('Updated Chart B path:', chartBImg.src);
    }
    
    // Save updated paths
    localStorage.setItem('simpleEvaluations', JSON.stringify(simpleEvaluations));
}

// Global function to be called when images are loaded
window.updateCurrentEvaluationImages = function() {
    if (currentPair && currentPair.id) {
        updateEvaluationImagePaths(currentPair.id);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    addNotificationStyles();
    loadSavedSimpleEvaluations();
    
    // Add event listeners for checkbox and radio changes to auto-save
    document.addEventListener('change', function(e) {
        if (e.target.closest('.simple-evaluation-form')) {
            // Auto-save when form changes
            setTimeout(saveSimpleEvaluation, 100);
        }
    });
    
    // Try to submit any pending submissions
    retryFailedSubmissions();
});

// Get or create a session ID
function getOrCreateSessionId() {
    let sessionId = localStorage.getItem('evaluationSessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('evaluationSessionId', sessionId);
    }
    return sessionId;
}

// Retry failed submissions
async function retryFailedSubmissions() {
    const evaluations = Object.values(simpleEvaluations).filter(eval => eval.needsServerSubmission);
    
    for (const evaluation of evaluations) {
        try {
            const submitData = {
                pairId: evaluation.pairId,
                evaluation: evaluation,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                sessionId: getOrCreateSessionId(),
                url: window.location.href,
                retryAttempt: true
            };
            
            const apiEndpoint = window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com') 
                ? '/.netlify/functions/submit-evaluation'
                : window.location.hostname.includes('vercel.app') 
                ? '/api/submit-evaluation'
                : window.location.hostname.includes('github.io')
                ? 'https://your-netlify-site.netlify.app/.netlify/functions/submit-evaluation'
                : '/api/submit-evaluation';
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData)
            });
            
            if (response.ok) {
                // Remove retry flag
                delete evaluation.needsServerSubmission;
                localStorage.setItem('simpleEvaluations', JSON.stringify(simpleEvaluations));
                console.log('Retry submission successful for:', evaluation.pairId);
            }
        } catch (error) {
            console.log('Retry failed for:', evaluation.pairId, error);
        }
    }
}