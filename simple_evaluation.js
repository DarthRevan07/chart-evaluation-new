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
                precision: false,
                readable: false
            },
            chartB: {
                precision: false,
                readable: false
            },
            overallPreference: null,
            completed: false,
            timestamp: null
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
    
    // Collect form data
    evaluation.chartA.precision = document.getElementById('chart_a_precision').checked;
    evaluation.chartA.readable = document.getElementById('chart_a_readable').checked;
    evaluation.chartB.precision = document.getElementById('chart_b_precision').checked;
    evaluation.chartB.readable = document.getElementById('chart_b_readable').checked;
    
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
            url: window.location.href
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
    
    // Load checkbox states
    const chartAPrecision = document.getElementById('chart_a_precision');
    const chartAReadable = document.getElementById('chart_a_readable');
    const chartBPrecision = document.getElementById('chart_b_precision');
    const chartBReadable = document.getElementById('chart_b_readable');
    
    if (chartAPrecision) chartAPrecision.checked = evaluation.chartA.precision;
    if (chartAReadable) chartAReadable.checked = evaluation.chartA.readable;
    if (chartBPrecision) chartBPrecision.checked = evaluation.chartB.precision;
    if (chartBReadable) chartBReadable.checked = evaluation.chartB.readable;
    
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

// Na