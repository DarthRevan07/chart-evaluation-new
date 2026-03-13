// Simple Evaluation Form Functions - SLIDER VERSION

// Storage for evaluations
let simpleEvaluations = {};
let currentPair = null;

// Label maps for each slider dimension
const SLIDER_LABELS = {
    readability: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    precision:   ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    aesthetics:  ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
};
const SLIDER_COLORS = ['#dc3545', '#fd7e14', '#ffc107', '#17a2b8', '#28a745'];

// Description texts shown below slider per position
const SLIDER_DESCRIPTIONS = {
    readability: [
        'I could not extract any meaningful information even after careful inspection',
        'I had to look at the chart several times just to identify basic values/elements',
        'I could identify the values, but it took effort to understand the overall message.',
        'I could quickly understand the chart and determine overall message with little effort.',
        'The chart was immediately clear and effortless to understand.'
    ]
};

// Given a slider element ID and a numeric score, return { score, label }
function makeSliderValue(sliderId, score) {
    const dimension = Object.keys(SLIDER_LABELS).find(k => sliderId.endsWith(k));
    const label = dimension ? (SLIDER_LABELS[dimension][score] ?? '') : String(score);
    return { score, label };
}

// Initialize simple evaluation for a pair
function initializeSimpleEvaluation(pairId, pairMetadata) {
    currentPair = { id: pairId, metadata: pairMetadata };
    
    // Clear form first
    clearSimpleEvaluationForm();
    
    if (!simpleEvaluations[pairId]) {
        simpleEvaluations[pairId] = {
            pairId: pairId,
            metadata: pairMetadata,
            chartA: {
                readability: makeSliderValue('chart_a_readability', 1),
                precision:   makeSliderValue('chart_a_precision', 1),
                aesthetics:  makeSliderValue('chart_a_aesthetics', 1),
                imagePath: null
            },
            chartB: {
                readability: makeSliderValue('chart_b_readability', 1),
                precision:   makeSliderValue('chart_b_precision', 1),
                aesthetics:  makeSliderValue('chart_b_aesthetics', 1),
                imagePath: null
            },
            overallPreference: null,
            comments: '',
            completed: false,
            timestamp: null,
            displayedImages: {
                chartA: null,
                chartB: null
            }
        };
    }
    
    // Load saved responses into the form after a short delay to ensure form is cleared
    setTimeout(() => {
        loadSimpleEvaluation(pairId);
    }, 50);
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
    
    // Read slider values into { score, label } objects
    const readSlider = (id) => {
        const el = document.getElementById(id);
        const score = el ? parseInt(el.value) : 1;
        return makeSliderValue(id, score);
    };
    evaluation.chartA.readability = readSlider('chart_a_readability');
    evaluation.chartA.precision   = readSlider('chart_a_precision');
    evaluation.chartA.aesthetics  = readSlider('chart_a_aesthetics');
    evaluation.chartB.readability = readSlider('chart_b_readability');
    evaluation.chartB.precision   = readSlider('chart_b_precision');
    evaluation.chartB.aesthetics  = readSlider('chart_b_aesthetics');
    
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
    
    // Get overall preference — prefer the hidden input set by selectChart() on slide 3,
    // fall back to radio buttons in the preference section below the slides
    const hiddenPref = document.getElementById('overall_preference_hidden');
    const hiddenPrefValue = hiddenPref ? hiddenPref.value : '';
    if (hiddenPrefValue) {
        evaluation.overallPreference = hiddenPrefValue;
    } else {
        evaluation.overallPreference = null;
        const preferenceRadios = document.querySelectorAll('input[name="overall_preference"]');
        for (const radio of preferenceRadios) {
            if (radio.checked) {
                evaluation.overallPreference = radio.value;
                break;
            }
        }
    }
    
    // Get comments from each slide
    evaluation.comments_a    = document.getElementById('evaluation_comments_a')?.value.trim()    || '';
    evaluation.comments_b    = document.getElementById('evaluation_comments_b')?.value.trim()    || '';
    evaluation.comments_pref = document.getElementById('evaluation_comments_pref')?.value.trim() || '';
    evaluation.comments = [evaluation.comments_a, evaluation.comments_b, evaluation.comments_pref].filter(Boolean).join('; ');
    
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
    
    // Debug: Log the evaluation data being submitted
    console.log('Submitting evaluation data:', {
        pairId: pairId,
        evaluation: evaluation,
        comments: evaluation.comments,
        hasComments: !!evaluation.comments
    });

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
        
        // Debug: Log the complete submit data
        console.log('Complete submit data:', JSON.stringify(submitData, null, 2));
        const apiEndpoint = window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com') 
            ? '/.netlify/functions/submit-evaluation-slider'  // Different endpoint for slider version
            : window.location.hostname.includes('vercel.app') 
            ? '/api/submit-evaluation-slider'  // Vercel slider endpoint
            : window.location.hostname.includes('github.io')
            ? 'https://chart-evaluation-slider.netlify.app/.netlify/functions/submit-evaluation-slider'  // GitHub Pages to Netlify
            : '/api/submit-evaluation-slider';  // Local or other
        
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
    
    // Restore slider states
    const restoreSlider = (id, storedValue) => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + '_value');
        if (!slider) return;
        const score = storedValue && typeof storedValue === 'object' ? storedValue.score : (storedValue ?? 1);
        slider.value = score;
        updateSliderDisplay(slider, valueDisplay);
        updateTooltipDisplay(slider);
    };
    restoreSlider('chart_a_readability', evaluation.chartA.readability);
    restoreSlider('chart_a_precision',   evaluation.chartA.precision);
    restoreSlider('chart_a_aesthetics',  evaluation.chartA.aesthetics);
    restoreSlider('chart_b_readability', evaluation.chartB.readability);
    restoreSlider('chart_b_precision',   evaluation.chartB.precision);
    restoreSlider('chart_b_aesthetics',  evaluation.chartB.aesthetics);
    
    // Load overall preference
    if (evaluation.overallPreference) {
        const preferenceRadio = document.querySelector(`input[name="overall_preference"][value="${evaluation.overallPreference}"]`);
        if (preferenceRadio) {
            preferenceRadio.checked = true;
        }

        // Restore hidden input so saveSimpleEvaluation() reads it correctly
        const hiddenPref = document.getElementById('overall_preference_hidden');
        if (hiddenPref) hiddenPref.value = evaluation.overallPreference;

        // Restore visual card selection on slide 3
        document.querySelectorAll('.selectable-chart').forEach(chart => chart.classList.remove('selected'));
        const cardIdMap = { 'Chart A': 'selectableChartA', 'Chart B': 'selectableChartB', 'Both similar': 'selectableEqual' };
        const cardId = cardIdMap[evaluation.overallPreference];
        if (cardId) {
            const card = document.getElementById(cardId);
            if (card) card.classList.add('selected');
        }
    } else {
        // Clear hidden input when there's no saved preference
        const hiddenPref = document.getElementById('overall_preference_hidden');
        if (hiddenPref) hiddenPref.value = '';
    }
    
    // Load comments into per-slide textareas
    const ca = document.getElementById('evaluation_comments_a');
    const cb = document.getElementById('evaluation_comments_b');
    const cp = document.getElementById('evaluation_comments_pref');
    if (ca) ca.value = evaluation.comments_a    || '';
    if (cb) cb.value = evaluation.comments_b    || '';
    if (cp) cp.value = evaluation.comments_pref || '';
    
    console.log('Loaded evaluation for pair:', pairId, evaluation);
}

// Clear form responses
function clearSimpleEvaluationForm() {
    // Reset sliders to position 1 (Disagree)
    const sliders = document.querySelectorAll('.simple-evaluation-form input[type="range"]');
    sliders.forEach(slider => {
        slider.value = 1; // Default to "Disagree" position
        const valueDisplay = document.getElementById(slider.id + '_value');
        if (valueDisplay) {
            updateSliderDisplay(slider, valueDisplay);
        }
        // Update tooltip display
        updateTooltipDisplay(slider);
    });
    
    // Clear radio buttons
    const radioButtons = document.querySelectorAll('.simple-evaluation-form input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
    });

    // Clear the hidden preference input used by slide 3 card selection
    const hiddenPref = document.getElementById('overall_preference_hidden');
    if (hiddenPref) hiddenPref.value = '';

    // Clear slide 3 visual card selection
    document.querySelectorAll('.selectable-chart').forEach(chart => chart.classList.remove('selected'));
    
    // Clear per-slide comment textareas
    ['evaluation_comments_a', 'evaluation_comments_b', 'evaluation_comments_pref'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    console.log('Form cleared for new pair');
}

// Global function to clear form when switching pairs
function clearFormResponses() {
    clearSimpleEvaluationForm();
}

// Function to load evaluation for current pair after pair change
function loadSavedResponsesForCurrentPair(pairId) {
    if (pairId && simpleEvaluations[pairId]) {
        loadSimpleEvaluation(pairId);
        console.log('Loaded saved responses for pair:', pairId);
    } else {
        console.log('No saved responses found for pair:', pairId);
    }
}

// Update slider display text — context-aware per dimension
function updateSliderDisplay(slider, valueDisplay) {
    const score = parseInt(slider.value);
    const dimension = Object.keys(SLIDER_LABELS).find(k => slider.id.endsWith(k));
    const labels = dimension ? SLIDER_LABELS[dimension] : null;

    if (valueDisplay) {
        valueDisplay.textContent = labels ? (labels[score] ?? score) : score;
        valueDisplay.style.color = SLIDER_COLORS[score] ?? '#6c757d';
    }

    // Update the description text if available for this dimension
    const descEl = document.getElementById(slider.id + '_desc');
    if (descEl && dimension && SLIDER_DESCRIPTIONS[dimension]) {
        descEl.textContent = SLIDER_DESCRIPTIONS[dimension][score] ?? '';
    }
}

// Update tooltip display based on current slider value
function updateTooltipDisplay(slider) {
    const sliderWrapper = slider.closest('.slider-wrapper');
    if (!sliderWrapper) return;
    
    const tooltips = sliderWrapper.querySelectorAll('.slider-tooltip');
    const currentValue = parseInt(slider.value);
    
    tooltips.forEach(tooltip => {
        const position = parseInt(tooltip.getAttribute('data-position'));
        tooltip.classList.remove('active');
        if (position === currentValue) {
            tooltip.classList.add('active');
        }
    });
}

// Initialize slider displays and event listeners
function initializeSliderDisplays() {
    const sliders = document.querySelectorAll('.evaluation-slider');
    sliders.forEach(slider => {
        const valueDisplay = document.getElementById(slider.id + '_value');
        if (valueDisplay) {
            // Set initial display
            updateSliderDisplay(slider, valueDisplay);
            updateTooltipDisplay(slider);
            
            // Add input event listener for real-time updates
            slider.addEventListener('input', function() {
                updateSliderDisplay(this, valueDisplay);
                updateTooltipDisplay(this);
            });
            
            // Add change event for auto-save
            slider.addEventListener('change', function() {
                updateSliderDisplay(this, valueDisplay);
                updateTooltipDisplay(this);
                if (currentPair && currentPair.id) {
                    setTimeout(() => {
                        saveSimpleEvaluation();
                        console.log('Auto-saved slider change for pair:', currentPair.id);
                    }, 100);
                }
            });
            
            // Add mouse enter/leave for enhanced tooltip visibility
            const sliderWrapper = slider.closest('.slider-wrapper');
            if (sliderWrapper) {
                sliderWrapper.addEventListener('mouseenter', function() {
                    const tooltips = sliderWrapper.querySelectorAll('.slider-tooltip');
                    const currentValue = parseInt(slider.value);
                    
                    tooltips.forEach(tooltip => {
                        const position = parseInt(tooltip.getAttribute('data-position'));
                        if (position === currentValue) {
                            tooltip.classList.add('active');
                        } else {
                            tooltip.style.opacity = '0.6';
                            tooltip.style.visibility = 'visible';
                        }
                    });
                });
                
                sliderWrapper.addEventListener('mouseleave', function() {
                    const tooltips = sliderWrapper.querySelectorAll('.slider-tooltip');
                    tooltips.forEach(tooltip => {
                        if (!tooltip.classList.contains('active')) {
                            tooltip.style.opacity = '0';
                            tooltip.style.visibility = 'hidden';
                        }
                    });
                });
            }
        }
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
    // Flush current form state to in-memory store before exporting
    if (currentPair && currentPair.id) {
        const pairId = currentPair.id;
        const evaluation = simpleEvaluations[pairId];
        if (evaluation) {
            const readSlider = (id) => {
                const el = document.getElementById(id);
                const score = el ? parseInt(el.value) : 1;
                return makeSliderValue(id, score);
            };
            evaluation.chartA.readability = readSlider('chart_a_readability');
            evaluation.chartA.precision   = readSlider('chart_a_precision');
            evaluation.chartA.aesthetics  = readSlider('chart_a_aesthetics');
            evaluation.chartB.readability = readSlider('chart_b_readability');
            evaluation.chartB.precision   = readSlider('chart_b_precision');
            evaluation.chartB.aesthetics  = readSlider('chart_b_aesthetics');
            const hiddenPref = document.getElementById('overall_preference_hidden');
            const hiddenPrefValue = hiddenPref ? hiddenPref.value : '';
            if (hiddenPrefValue) {
                evaluation.overallPreference = hiddenPrefValue;
            } else {
                const preferenceRadios = document.querySelectorAll('input[name="overall_preference"]');
                for (const radio of preferenceRadios) {
                    if (radio.checked) { evaluation.overallPreference = radio.value; break; }
                }
            }
            evaluation.comments_a    = document.getElementById('evaluation_comments_a')?.value.trim()    || '';
            evaluation.comments_b    = document.getElementById('evaluation_comments_b')?.value.trim()    || '';
            evaluation.comments_pref = document.getElementById('evaluation_comments_pref')?.value.trim() || '';
            evaluation.comments = [evaluation.comments_a, evaluation.comments_b, evaluation.comments_pref].filter(Boolean).join('; ');
            evaluation.timestamp = new Date().toISOString();
        }
    }
    localStorage.setItem('simpleEvaluations', JSON.stringify(simpleEvaluations));
    const evaluations = simpleEvaluations;
    const dataStr = JSON.stringify(evaluations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'chart-evaluations-slider-' + new Date().toISOString().slice(0, 10) + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('📁 Evaluations exported successfully!', 'success');
}

// Export all evaluations in CSV format for analysis (slider version)
function exportEvaluationsCSV() {
    const evaluations = simpleEvaluations;
    
    if (Object.keys(evaluations).length === 0) {
        showNotification('❗ No evaluations to export', 'warning');
        return;
    }
    
    // Create CSV headers for slider version
    const headers = [
        'Timestamp', 'Pair ID', 'Overall Preference',
        'Chart A - Readability (Score)', 'Chart A - Readability (Label)',
        'Chart A - Precision (Score)', 'Chart A - Precision (Label)',
        'Chart A - Aesthetics (Score)', 'Chart A - Aesthetics (Label)',
        'Chart B - Readability (Score)', 'Chart B - Readability (Label)',
        'Chart B - Precision (Score)', 'Chart B - Precision (Label)',
        'Chart B - Aesthetics (Score)', 'Chart B - Aesthetics (Label)',
        'Chart A Image', 'Chart B Image', 'Comments', 'Completed'
    ];

    // Create CSV rows
    const rows = Object.values(evaluations).map(ev => [
        ev.timestamp || '',
        ev.pairId || '',
        ev.overallPreference || '',
        ev.chartA?.readability?.score ?? '', ev.chartA?.readability?.label ?? '',
        ev.chartA?.precision?.score ?? '',   ev.chartA?.precision?.label ?? '',
        ev.chartA?.aesthetics?.score ?? '',  ev.chartA?.aesthetics?.label ?? '',
        ev.chartB?.readability?.score ?? '', ev.chartB?.readability?.label ?? '',
        ev.chartB?.precision?.score ?? '',   ev.chartB?.precision?.label ?? '',
        ev.chartB?.aesthetics?.score ?? '',  ev.chartB?.aesthetics?.label ?? '',
        ev.chartA?.imagePath?.split('/').pop() || '',
        ev.chartB?.imagePath?.split('/').pop() || '',
        ev.comments || '',
        ev.completed ? 'Yes' : 'No'
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    // Download CSV
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = 'chart-evaluations-slider-' + new Date().toISOString().slice(0, 10) + '.csv';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('📊 CSV exported successfully!', 'success');
}

// Add export buttons to the page
function addExportButtons() {
    // Find the form actions container or create one at the end of the form
    let targetContainer = document.querySelector('.form-actions');
    if (!targetContainer) {
        // If no form-actions container exists, create one at the end of the simple-evaluation-form
        const evaluationForm = document.querySelector('.simple-evaluation-form');
        if (evaluationForm) {
            targetContainer = document.createElement('div');
            targetContainer.className = 'export-actions';
            targetContainer.style.cssText = `
                margin-top: 20px;
                text-align: center;
                padding: 20px;
                border-top: 1px solid #dee2e6;
                background-color: #f8f9fa;
            `;
            evaluationForm.appendChild(targetContainer);
        } else {
            // Fallback: add to end of document body
            targetContainer = document.createElement('div');
            targetContainer.className = 'export-actions';
            targetContainer.style.cssText = `
                margin: 20px auto;
                text-align: center;
                padding: 20px;
                max-width: 800px;
                border-top: 1px solid #dee2e6;
                background-color: #f8f9fa;
            `;
            document.body.appendChild(targetContainer);
        }
    }
    
    // Create export section header
    const exportHeader = document.createElement('h4');
    exportHeader.textContent = 'Export Your Data';
    exportHeader.style.cssText = `
        margin: 0 0 15px 0;
        color: #495057;
        font-size: 1.1em;
    `;
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
    `;
    
    const jsonBtn = document.createElement('button');
    jsonBtn.textContent = '📁 Export JSON';
    jsonBtn.onclick = exportSimpleEvaluations;
    jsonBtn.style.cssText = `
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.3s ease;
    `;
    jsonBtn.addEventListener('mouseenter', () => {
        jsonBtn.style.backgroundColor = '#0056b3';
    });
    jsonBtn.addEventListener('mouseleave', () => {
        jsonBtn.style.backgroundColor = '#007bff';
    });
    
    // Add description text
    const description = document.createElement('p');
    description.textContent = 'Download your slider-based evaluation data as JSON for analysis.';
    description.style.cssText = `
        margin: 15px 0 0 0;
        font-size: 12px;
        color: #6c757d;
        line-height: 1.4;
    `;
    
    // Append elements to target container
    if (!targetContainer.querySelector('h4')) { // Don't add header if it already exists
        targetContainer.appendChild(exportHeader);
    }
    buttonsContainer.appendChild(jsonBtn);
    targetContainer.appendChild(buttonsContainer);
    if (!targetContainer.querySelector('p')) { // Don't add description if it already exists
        targetContainer.appendChild(description);
    }
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
    // Always start fresh — clear any persisted evaluations from previous sessions
    simpleEvaluations = {};
    localStorage.removeItem('simpleEvaluations');
    addExportButtons();
    initializeSliderDisplays(); // Initialize slider-specific functionality
    
    // Add event listeners for radio button changes to auto-save
    document.addEventListener('change', function(e) {
        if (e.target.closest('.simple-evaluation-form') && e.target.type === 'radio') {
            // Auto-save when radio button changes, but only if we have a current pair
            if (currentPair && currentPair.id) {
                setTimeout(() => {
                    saveSimpleEvaluation();
                    console.log('Auto-saved radio change for pair:', currentPair.id);
                }, 100);
            }
        }
    });
    
    // Try to submit any pending submissions
    retryFailedSubmissions();
});

// Enhanced pair initialization that properly handles form state
function initializePairEvaluation(pairId, pairMetadata) {
    console.log('Initializing slider evaluation for pair:', pairId);
    
    // Initialize the evaluation data structure
    initializeSimpleEvaluation(pairId, pairMetadata);
    
    // Update image paths after images load
    setTimeout(() => {
        updateEvaluationImagePaths(pairId);
    }, 200);
}

// Global function that can be called when pairs change
window.initializePairEvaluation = initializePairEvaluation;

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
                ? '/.netlify/functions/submit-evaluation-slider'
                : window.location.hostname.includes('vercel.app') 
                ? '/api/submit-evaluation-slider'
                : window.location.hostname.includes('github.io')
                ? 'https://chart-evaluation-slider.netlify.app/.netlify/functions/submit-evaluation-slider'
                : '/api/submit-evaluation-slider';
            
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