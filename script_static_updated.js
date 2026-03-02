// Comprehensive Pair-Based Evaluation System
let currentCategory = 'clutter';
let currentPairId = null;
let allPairEvaluations = {}; // Store evaluations per pair

// Initialize pair evaluation when a new pair is loaded
function initializePairEvaluation(pairId, pairMetadata) {
    currentPairId = pairId;
    
    // Use the simple evaluation system instead of complex category system
    if (typeof initializeSimpleEvaluation === 'function') {
        initializeSimpleEvaluation(pairId, pairMetadata);
    }
    
    // Update UI to show current pair evaluation status
    updateEvaluationStatus();
}

// Show specific category content (disabled for simplified evaluation)
function showCategory(category) {
    // Categories are no longer used in the simplified evaluation
    // This function is kept for compatibility but doesn't do anything
    console.log('Category switching disabled - using simplified evaluation');
    
    // Update page title to be generic
    document.title = 'Chart Pair Evaluation - Simple Questionnaire';
    
    // Update evaluation status indicators
    updateEvaluationStatus();
}

// Save clutter responses for current pair
async function saveClutterResponses() {
    if (!currentPairId) {
        alert('No pair loaded for evaluation');
        return;
    }
    
    const responses = {};
    
    // Primary question
    const primary = document.querySelector('input[name="primary_clutter"]:checked');
    responses.primary_clutter = primary ? primary.value : null;
    
    // Chart A rating
    const chartARating = document.querySelector('input[name="chart_a_clutter"]:checked');
    responses.chart_a_clutter = chartARating ? parseInt(chartARating.value) : null;
    
    // Chart B rating
    const chartBRating = document.querySelector('input[name="chart_b_clutter"]:checked');
    responses.chart_b_clutter = chartBRating ? parseInt(chartBRating.value) : null;
    
    // Rationale
    responses.rationale_clutter = document.getElementById('rationale_clutter') ? document.getElementById('rationale_clutter').value.trim() : '';
    
    // Update pair evaluation
    allPairEvaluations[currentPairId].evaluations.clutter = {
        completed: true,
        responses: responses,
        timestamp: new Date().toISOString()
    };
    
    // Update completion status
    allPairEvaluations[currentPairId].completionStatus.clutter = true;
    
    // Save to localStorage
    localStorage.setItem('pairEvaluations', JSON.stringify(allPairEvaluations));
    
    // Update UI
    updateEvaluationStatus();
    
    // Check if pair is complete and auto-submit - WAIT for completion
    await checkAndSubmitCompletedPair();
    
    alert('Visual Clutter responses saved successfully!');
}

// Save cognitive load responses for current pair
async function saveCognitiveResponses() {
    if (!currentPairId) {
        alert('No pair loaded for evaluation');
        return;
    }
    
    const responses = {};
    
    // Primary question
    const primary = document.querySelector('input[name="primary_cognitive_load"]:checked');
    responses.primary_cognitive_load = primary ? primary.value : null;
    
    // Chart A rating
    const chartARating = document.querySelector('input[name="chart_a_cognitive"]:checked');
    responses.chart_a_cognitive = chartARating ? parseInt(chartARating.value) : null;
    
    // Chart B rating
    const chartBRating = document.querySelector('input[name="chart_b_cognitive"]:checked');
    responses.chart_b_cognitive = chartBRating ? parseInt(chartBRating.value) : null;
    
    // Rationale
    responses.rationale_cognitive = document.getElementById('rationale_cognitive') ? document.getElementById('rationale_cognitive').value.trim() : '';
    
    // Update pair evaluation
    allPairEvaluations[currentPairId].evaluations.cognitive_load = {
        completed: true,
        responses: responses,
        timestamp: new Date().toISOString()
    };
    
    // Update completion status
    allPairEvaluations[currentPairId].completionStatus.cognitive_load = true;
    
    // Save to localStorage
    localStorage.setItem('pairEvaluations', JSON.stringify(allPairEvaluations));
    
    // Update UI
    updateEvaluationStatus();
    
    // Check if pair is complete and auto-submit - WAIT for completion
    await checkAndSubmitCompletedPair();
    
    alert('Cognitive Load responses saved successfully!');
}

// Save interpretability responses for current pair
async function saveInterpretabilityResponses() {
    if (!currentPairId) {
        alert('No pair loaded for evaluation');
        return;
    }
    
    const responses = {};
    
    // Primary question
    const primary = document.querySelector('input[name="primary_interpretability"]:checked');
    responses.primary_interpretability = primary ? primary.value : null;
    
    // Chart A rating
    const chartARating = document.querySelector('input[name="chart_a_interpretability"]:checked');
    responses.chart_a_interpretability = chartARating ? parseInt(chartARating.value) : null;
    
    // Chart B rating
    const chartBRating = document.querySelector('input[name="chart_b_interpretability"]:checked');
    responses.chart_b_interpretability = chartBRating ? parseInt(chartBRating.value) : null;
    
    // Rationale
    responses.rationale_interpretability = document.getElementById('rationale_interpretability') ? document.getElementById('rationale_interpretability').value.trim() : '';
    
    // Update pair evaluation
    allPairEvaluations[currentPairId].evaluations.interpretability = {
        completed: true,
        responses: responses,
        timestamp: new Date().toISOString()
    };
    
    // Update completion status
    allPairEvaluations[currentPairId].completionStatus.interpretability = true;
    
    // Save to localStorage
    localStorage.setItem('pairEvaluations', JSON.stringify(allPairEvaluations));
    
    // Update UI
    updateEvaluationStatus();
    
    // Check if pair is complete and auto-submit - WAIT for completion
    await checkAndSubmitCompletedPair();
    
    alert('Interpretability responses saved successfully!');
}

// Save style responses for current pair
async function saveStyleResponses() {
    if (!currentPairId) {
        alert('No pair loaded for evaluation');
        return;
    }
    
    const responses = {};
    
    // Primary question
    const primary = document.querySelector('input[name="primary_style"]:checked');
    responses.primary_style = primary ? primary.value : null;
    
    // Chart A rating
    const chartARating = document.querySelector('input[name="chart_a_style"]:checked');
    responses.chart_a_style = chartARating ? parseInt(chartARating.value) : null;
    
    // Chart B rating
    const chartBRating = document.querySelector('input[name="chart_b_style"]:checked');
    responses.chart_b_style = chartBRating ? parseInt(chartBRating.value) : null;
    
    // Confidence rating
    const confidence = document.querySelector('input[name="confidence_style"]:checked');
    responses.confidence_style = confidence ? parseInt(confidence.value) : null;
    
    // Rationale
    responses.rationale_style = document.getElementById('rationale_style') ? document.getElementById('rationale_style').value.trim() : '';
    
    // Update pair evaluation
    allPairEvaluations[currentPairId].evaluations.style = {
        completed: true,
        responses: responses,
        timestamp: new Date().toISOString()
    };
    
    // Update completion status
    allPairEvaluations[currentPairId].completionStatus.style = true;
    
    // Save to localStorage
    localStorage.setItem('pairEvaluations', JSON.stringify(allPairEvaluations));
    
    // Update UI
    updateEvaluationStatus();
    
    // Check if pair is complete and auto-submit - WAIT for completion
    await checkAndSubmitCompletedPair();
    
    alert('Style responses saved successfully!');
}

// Submit evaluation for a category (now properly async)
async function submitEvaluation(category) {
    switch(category) {
        case 'clutter':
            await saveClutterResponses();
            break;
        case 'cognitive_load':
            await saveCognitiveResponses();
            break;
        case 'interpretability':
            await saveInterpretabilityResponses();
            break;
        case 'style':
            await saveStyleResponses();
            break;
    }
}

// Google Apps Script endpoint configuration
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxDPp-Iyd1JKHbhsuuHmkbXK9hZViDXJ1TsrapktPWVW3QXzT5obkYzkJcOBWKn8wou/exec';

// Test function to verify backend connection
async function testBackendConnection() {
    try {
        console.log('Testing backend connection...');
        const testData = {
            timestamp: new Date().toISOString(),
            pairId: 'test-pair-123',
            dataset: 'test-dataset',
            questionSet: 'test-question',
            pairNumber: 1,
            evaluations: {
                clutter: {
                    responses: {
                        primary_clutter: 'chart_a',
                        chart_a_clutter: 2,
                        chart_b_clutter: 3,
                        rationale_clutter: 'Test rationale'
                    }
                }
            }
        };
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Test response status:', response.status);
        const responseText = await response.text();
        console.log('Test response text:', responseText);
        
        if (response.ok) {
            alert('✅ Backend connection successful! Check your Google Sheet for test data.');
        } else {
            alert('❌ Backend connection failed. Check console for details.');
        }
    } catch (error) {
        console.error('Test connection error:', error);
        alert('❌ Connection test failed. Check console for details.');
    }
}

// Debug function to check current evaluation state
function debugCurrentState() {
    console.log('=== DEBUG: Current Evaluation State ===');
    console.log('Current Pair ID:', currentPairId);
    console.log('All Pair Evaluations:', allPairEvaluations);
    
    if (currentPairId && allPairEvaluations[currentPairId]) {
        const currentPair = allPairEvaluations[currentPairId];
        console.log('Current Pair Data:', currentPair);
        console.log('Metadata Structure:', currentPair.metadata);
        console.log('Dataset:', currentPair.metadata?.dataset);
        console.log('Summary/QuestionSet:', currentPair.metadata?.summary);
        console.log('Question:', currentPair.metadata?.question);
        console.log('Pair Number:', currentPair.metadata?.pairNumber);
        console.log('Completion Status:', currentPair.completionStatus);
        console.log('Is Submitted?', currentPair.submitted);
        console.log('Submitted At:', currentPair.submittedAt);
        
        const status = currentPair.completionStatus;
        const isComplete = status.clutter && status.cognitive_load && status.interpretability && status.style;
        console.log('Is Complete?', isComplete);
        
        // Show what would be submitted
        if (isComplete) {
            const metadata = currentPair.metadata || {};
            const testSubmissionData = {
                timestamp: new Date().toISOString(),
                pairId: currentPairId,
                dataset: metadata.dataset || 'unknown',
                questionSet: metadata.summary || 'unknown',
                pairNumber: metadata.pairNumber || 1,
                evaluations: currentPair.evaluations
            };
            console.log('Would Submit This Data:', testSubmissionData);
        }
    }
    
    console.log('Google Apps Script URL:', GOOGLE_APPS_SCRIPT_URL);
    console.log('=== END DEBUG ===');
}

// Check if current pair is complete and auto-submit to backend
async function checkAndSubmitCompletedPair() {
    if (!currentPairId || !allPairEvaluations[currentPairId]) return;
    
    const status = allPairEvaluations[currentPairId].completionStatus;
    const isComplete = status.clutter && status.cognitive_load && status.interpretability && status.style;
    
    if (isComplete && !allPairEvaluations[currentPairId].submitted) {
        // Mark as submitted to prevent duplicate submissions
        allPairEvaluations[currentPairId].submitted = true;
        allPairEvaluations[currentPairId].submittedAt = new Date().toISOString();
        
        // Save updated status to localStorage
        localStorage.setItem('pairEvaluations', JSON.stringify(allPairEvaluations));
        
        // Submit to Google Apps Script
        await submitPairToBackend(currentPairId);
        
        // Update UI to show submission status
        showPairSubmissionStatus(true);
    }
}

// Submit completed pair to Google Apps Script backend
async function submitPairToBackend(pairId) {
    try {
        const pairData = allPairEvaluations[pairId];
        
        // Extract metadata - handle missing properties gracefully
        const metadata = pairData.metadata || {};
        
        const submissionData = {
            timestamp: new Date().toISOString(),
            pairId: pairId,
            dataset: metadata.dataset || 'unknown',
            questionSet: metadata.summary || 'unknown',  // This is the summaryDir like "sum1_ques1_25"
            pairNumber: metadata.pairNumber || 1,
            userAgent: navigator.userAgent,
            sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            evaluations: pairData.evaluations
        };
        
        console.log('Submitting pair to backend:', submissionData);
        console.log('Full pair data structure:', pairData);
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
            const responseText = await response.text();
            console.log('Response text:', responseText);
            console.log('Pair submitted successfully to backend');
            showPairSubmissionStatus(true);
            return true;  // Success
        } else {
            const errorText = await response.text();
            console.error('Backend submission failed:', response.status, response.statusText);
            console.error('Error response:', errorText);
            showPairSubmissionStatus(false);
            return false;  // Failure
        }
        
    } catch (error) {
        console.error('Error submitting to backend:', error);
        showPairSubmissionStatus(false);
        
        // Mark as not submitted so it can be retried
        allPairEvaluations[pairId].submitted = false;
        delete allPairEvaluations[pairId].submittedAt;
        localStorage.setItem('pairEvaluations', JSON.stringify(allPairEvaluations));
        
        return false;  // Failure
    }
}

// Show pair submission status in UI
function showPairSubmissionStatus(success) {
    const statusDiv = document.getElementById('pairSubmissionStatus') || document.createElement('div');
    statusDiv.id = 'pairSubmissionStatus';
    statusDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${success ? 
            'background: linear-gradient(135deg, #28a745, #20c997);' : 
            'background: linear-gradient(135deg, #dc3545, #c82333);'
        }
    `;
    
    statusDiv.innerHTML = success ? 
        '✅ Pair evaluation submitted successfully!' : 
        '❌ Submission failed - will retry later';
    
    document.body.appendChild(statusDiv);
    
    // Remove after 4 seconds
    setTimeout(() => {
        if (statusDiv.parentNode) {
            statusDiv.remove();
        }
    }, 4000);
}

// Load saved responses for current pair and category
function loadSavedResponsesForCurrentPair(category) {
    if (!currentPairId || !allPairEvaluations[currentPairId]) return;
    
    const evaluation = allPairEvaluations[currentPairId].evaluations[category];
    if (!evaluation.completed) return;
    
    const responses = evaluation.responses;
    
    // Load responses based on category
    switch(category) {
        case 'clutter':
            loadClutterResponses(responses);
            break;
        case 'cognitive_load':
            loadCognitiveResponses(responses);
            break;
        case 'interpretability':
            loadInterpretabilityResponses(responses);
            break;
        case 'style':
            loadStyleResponses(responses);
            break;
    }
}

// Load clutter responses into form
function loadClutterResponses(responses) {
    if (responses.primary_clutter) {
        const primaryRadio = document.querySelector(`input[name="primary_clutter"][value="${responses.primary_clutter}"]`);
        if (primaryRadio) primaryRadio.checked = true;
    }
    
    if (responses.chart_a_clutter) {
        const chartARadio = document.querySelector(`input[name="chart_a_clutter"][value="${responses.chart_a_clutter}"]`);
        if (chartARadio) chartARadio.checked = true;
    }
    
    if (responses.chart_b_clutter) {
        const chartBRadio = document.querySelector(`input[name="chart_b_clutter"][value="${responses.chart_b_clutter}"]`);
        if (chartBRadio) chartBRadio.checked = true;
    }
    
    if (responses.rationale_clutter) {
        const rationaleField = document.getElementById('rationale_clutter');
        if (rationaleField) rationaleField.value = responses.rationale_clutter;
    }
}

// Load cognitive responses into form
function loadCognitiveResponses(responses) {
    if (responses.primary_cognitive_load) {
        const primaryRadio = document.querySelector(`input[name="primary_cognitive_load"][value="${responses.primary_cognitive_load}"]`);
        if (primaryRadio) primaryRadio.checked = true;
    }
    
    if (responses.chart_a_cognitive) {
        const chartARadio = document.querySelector(`input[name="chart_a_cognitive"][value="${responses.chart_a_cognitive}"]`);
        if (chartARadio) chartARadio.checked = true;
    }
    
    if (responses.chart_b_cognitive) {
        const chartBRadio = document.querySelector(`input[name="chart_b_cognitive"][value="${responses.chart_b_cognitive}"]`);
        if (chartBRadio) chartBRadio.checked = true;
    }
    
    if (responses.rationale_cognitive) {
        const rationaleField = document.getElementById('rationale_cognitive');
        if (rationaleField) rationaleField.value = responses.rationale_cognitive;
    }
}

// Load interpretability responses into form  
function loadInterpretabilityResponses(responses) {
    if (responses.primary_interpretability) {
        const primaryRadio = document.querySelector(`input[name="primary_interpretability"][value="${responses.primary_interpretability}"]`);
        if (primaryRadio) primaryRadio.checked = true;
    }
    
    if (responses.chart_a_interpretability) {
        const chartARadio = document.querySelector(`input[name="chart_a_interpretability"][value="${responses.chart_a_interpretability}"]`);
        if (chartARadio) chartARadio.checked = true;
    }
    
    if (responses.chart_b_interpretability) {
        const chartBRadio = document.querySelector(`input[name="chart_b_interpretability"][value="${responses.chart_b_interpretability}"]`);
        if (chartBRadio) chartBRadio.checked = true;
    }
    
    if (responses.rationale_interpretability) {
        const rationaleField = document.getElementById('rationale_interpretability');
        if (rationaleField) rationaleField.value = responses.rationale_interpretability;
    }
}

// Load style responses into form
function loadStyleResponses(responses) {
    if (responses.primary_style) {
        const primaryRadio = document.querySelector(`input[name="primary_style"][value="${responses.primary_style}"]`);
        if (primaryRadio) primaryRadio.checked = true;
    }
    
    if (responses.chart_a_style) {
        const chartARadio = document.querySelector(`input[name="chart_a_style"][value="${responses.chart_a_style}"]`);
        if (chartARadio) chartARadio.checked = true;
    }
    
    if (responses.chart_b_style) {
        const chartBRadio = document.querySelector(`input[name="chart_b_style"][value="${responses.chart_b_style}"]`);
        if (chartBRadio) chartBRadio.checked = true;
    }
    
    if (responses.rationale_style) {
        const rationaleField = document.getElementById('rationale_style');
        if (rationaleField) rationaleField.value = responses.rationale_style;
    }
}

// Update evaluation status indicators
function updateEvaluationStatus() {
    if (!currentPairId || !allPairEvaluations[currentPairId]) return;
    
    const status = allPairEvaluations[currentPairId].completionStatus;
    const tabs = {
        'clutterTab': 'clutter',
        'cognitiveTab': 'cognitive_load',
        'interpretabilityTab': 'interpretability',
        'styleTab': 'style'
    };
    
    Object.entries(tabs).forEach(([tabId, category]) => {
        const tab = document.getElementById(tabId);
        if (tab) {
            // Add completion indicator
            const indicator = tab.querySelector('.completion-indicator') || document.createElement('span');
            indicator.className = 'completion-indicator';
            indicator.textContent = status[category] ? ' ✓' : '';
            indicator.style.color = status[category] ? '#28a745' : '#dc3545';
            indicator.style.fontWeight = 'bold';
            
            if (!tab.querySelector('.completion-indicator')) {
                tab.appendChild(indicator);
            }
        }
    });
    
    // Update pair completion info
    updatePairCompletionInfo();
    
    // Check if all evaluations across all pairs are complete
    checkForOverallCompletion();
}

// Check for overall completion and show completion button
function checkForOverallCompletion() {
    const totalPairs = currentPairProcessor ? currentPairProcessor.allPairs.length : 0;
    if (totalPairs === 0) return;
    
    const completedPairs = Object.keys(allPairEvaluations).filter(pairId => {
        const evaluation = allPairEvaluations[pairId];
        return evaluation.completionStatus.clutter && evaluation.completionStatus.cognitive_load && 
               evaluation.completionStatus.interpretability && evaluation.completionStatus.style;
    }).length;
    
    // Show completion button if all pairs are done
    if (completedPairs === totalPairs) {
        showCompletionButton();
    }
}

// Show completion button when all evaluations are done
function showCompletionButton() {
    if (document.getElementById('completionButton')) return; // Already exists
    
    const navContainer = document.getElementById('pairNavigationContainer');
    if (navContainer) {
        const completionDiv = document.createElement('div');
        completionDiv.id = 'completionButton';
        completionDiv.style.cssText = `
            margin-top: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #28a745, #20c997);
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            animation: slideIn 0.5s ease-out;
        `;
        
        completionDiv.innerHTML = `
            <h3 style="color: white; margin: 0 0 15px 0;">🎉 All Evaluations Complete!</h3>
            <p style="color: white; margin: 0 0 15px 0;">You have successfully evaluated all chart pairs for this dataset.</p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button onclick="finalSubmitAndReturn()" style="
                    background: white;
                    color: #28a745;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    min-width: 180px;
                ">📋 Submit All Data</button>
                <button onclick="exportAllPairEvaluations()" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 2px solid white;
                    padding: 12px 25px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    min-width: 150px;
                ">💾 Export Results</button>
            </div>
        `;
        
        navContainer.appendChild(completionDiv);
    }
}

// Final submission (no automatic redirect)
function finalSubmitAndReturn() {
    const totalEvaluations = Object.keys(allPairEvaluations).length;
    const result = confirm(`Submit all ${totalEvaluations} pair evaluations?`);
    
    if (result) {
        // Try to submit to backend
        submitAllEvaluationsToBackend();
        
        // Show success message only
        setTimeout(() => {
            alert('All evaluations submitted successfully!');
        }, 1000);
    }
}

// Submit all evaluations to backend
async function submitAllEvaluationsToBackend() {
    try {
        const submissionData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            totalPairs: Object.keys(allPairEvaluations).length,
            evaluations: allPairEvaluations
        };
        
        // Use the same backend submission as individual evaluations
        await submitToBackend(submissionData, 'complete_session');
        
    } catch (error) {
        console.error('Backend submission failed:', error);
    }
}

// Update pair completion information
function updatePairCompletionInfo() {
    if (!currentPairId || !allPairEvaluations[currentPairId]) return;
    
    const pairData = allPairEvaluations[currentPairId];
    const status = pairData.completionStatus;
    const completed = Object.values(status).filter(Boolean).length;
    const total = Object.keys(status).length;
    const isComplete = completed === total;
    const isSubmitted = pairData.submitted;
    
    // Add completion info to dataset info section
    const datasetInfo = document.querySelector('.dataset-info');
    if (datasetInfo) {
        let completionInfo = datasetInfo.querySelector('.completion-info');
        if (!completionInfo) {
            completionInfo = document.createElement('div');
            completionInfo.className = 'completion-info';
            datasetInfo.appendChild(completionInfo);
        }
        
        let bgColor, borderColor, textColor;
        if (isSubmitted) {
            bgColor = '#d1ecf1'; borderColor = '#bee5eb'; textColor = '#0c5460';
        } else if (isComplete) {
            bgColor = '#d4edda'; borderColor = '#c3e6cb'; textColor = '#155724';
        } else {
            bgColor = '#fff3cd'; borderColor = '#ffeeba'; textColor = '#856404';
        }
        
        completionInfo.style.cssText = `
            margin-top: 10px;
            padding: 15px;
            background: ${bgColor};
            border: 1px solid ${borderColor};
            border-radius: 8px;
            color: ${textColor};
        `;
        
        let statusMessage = '';
        if (isSubmitted) {
            statusMessage = `
                <div style="color: #0c5460; margin-bottom: 10px;">
                    ✅ <strong>Submitted to Backend!</strong> 
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">
                        Submitted at: ${new Date(pairData.submittedAt).toLocaleString()}
                    </div>
                </div>
            `;
        } else if (isComplete) {
            statusMessage = `
                <div style="color: #28a745; margin-bottom: 10px;">
                    🚀 <strong>Complete! Auto-submitting to backend...</strong>
                </div>
            `;
        }
        
        completionInfo.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Evaluation Progress:</strong> ${completed}/${total} categories completed
            </div>
            ${statusMessage}
            ${!isComplete ? `
                <div style="font-size: 14px; opacity: 0.8;">
                    Complete all ${total} categories to auto-submit to backend
                </div>
            ` : ''}
        `;
    }
}

// Submit complete evaluation for current pair
function submitCompleteEvaluation() {
    if (!currentPairId || !allPairEvaluations[currentPairId]) {
        alert('No pair evaluation data to submit');
        return;
    }
    
    // Check if all categories are completed
    const status = allPairEvaluations[currentPairId].completionStatus;
    const allCompleted = Object.values(status).every(completed => completed);
    
    if (!allCompleted) {
        alert('Please complete all 4 evaluation categories before submitting.');
        return;
    }
    
    // Mark evaluation as fully submitted
    allPairEvaluations[currentPairId].completedAt = new Date().toISOString();
    allPairEvaluations[currentPairId].submitted = true;
    allPairEvaluations[currentPairId].submissionTimestamp = new Date().toISOString();
    
    // Add user identification (you can customize this)
    const userId = getUserId(); // Generate or get user ID
    
    // Create comprehensive evaluation summary
    const evaluation = allPairEvaluations[currentPairId];
    const completeSummary = {
        userId: userId,
        sessionId: getSessionId(),
        pairId: currentPairId,
        metadata: evaluation.metadata,
        startedAt: evaluation.startedAt,
        completedAt: evaluation.completedAt,
        submitted: true,
        submissionTimestamp: evaluation.submissionTimestamp,
        userAgent: navigator.userAgent,
        screenResolution: screen.width + 'x' + screen.height,
        evaluationSummary: {
            clutter: {
                primary_choice: evaluation.evaluations.clutter.responses.primary_clutter,
                chart_a_rating: evaluation.evaluations.clutter.responses.chart_a_clutter,
                chart_b_rating: evaluation.evaluations.clutter.responses.chart_b_clutter,
                rationale: evaluation.evaluations.clutter.responses.rationale_clutter,
                completed_at: evaluation.evaluations.clutter.timestamp
            },
            cognitive_load: {
                primary_choice: evaluation.evaluations.cognitive_load.responses.primary_cognitive_load,
                chart_a_rating: evaluation.evaluations.cognitive_load.responses.chart_a_cognitive,
                chart_b_rating: evaluation.evaluations.cognitive_load.responses.chart_b_cognitive,
                rationale: evaluation.evaluations.cognitive_load.responses.rationale_cognitive,
                completed_at: evaluation.evaluations.cognitive_load.timestamp
            },
            interpretability: {
                primary_choice: evaluation.evaluations.interpretability.responses.primary_interpretability,
                chart_a_rating: evaluation.evaluations.interpretability.responses.chart_a_interpretability,
                chart_b_rating: evaluation.evaluations.interpretability.responses.chart_b_interpretability,
                rationale: evaluation.evaluations.interpretability.responses.rationale_interpretability,
                completed_at: evaluation.evaluations.interpretability.timestamp
            },
            style: {
                primary_choice: evaluation.evaluations.style.responses.primary_style,
                chart_a_rating: evaluation.evaluations.style.responses.chart_a_style,
                chart_b_rating: evaluation.evaluations.style.responses.chart_b_style,
                rationale: evaluation.evaluations.style.responses.rationale_style,
                completed_at: evaluation.evaluations.style.timestamp
            }
        },
        fullEvaluationData: evaluation.evaluations
    };
    
    // Save complete evaluation to localStorage
    localStorage.setItem('pairEvaluations', JSON.stringify(allPairEvaluations));
    
    // Submit to backend (choose one method below)
    submitToBackend(completeSummary).then(() => {
        // Auto-export the complete evaluation locally as backup
        const dataStr = JSON.stringify(completeSummary, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `complete_evaluation_pair_${currentPairId}_${Date.now()}.json`;
        link.click();
        
        // Update UI to show submission success
        updateEvaluationStatus();
        
        // Show success message with next steps
        const nextPairAvailable = currentPairProcessor && (currentPairIndex + 1) < currentPairProcessor.allPairs.length;
        const message = `✅ Complete evaluation submitted successfully!\n\n` +
                       `📁 Evaluation sent to server and saved locally\n` +
                       `🏷️ Pair: ${currentPairId}\n` +
                       `📊 All 4 categories evaluated\n\n` +
                       (nextPairAvailable ? 
                        `Next: You can now evaluate the next pair or review other pairs.` :
                        `You have completed all available pairs in this dataset.`);
        
        alert(message);
        
        // Note: Removed automatic navigation to prevent interference with data submission
        if (nextPairAvailable) {
            console.log('Next pair available - user can manually navigate if desired');
        }
    }).catch(error => {
        console.error('Submission failed:', error);
        alert('⚠️ Submission failed. Your data has been saved locally. Please check your internet connection and try again.');
        
        // Still provide local download as fallback
        const dataStr = JSON.stringify(completeSummary, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `complete_evaluation_pair_${currentPairId}_${Date.now()}.json`;
        link.click();
    });
}

// Generate unique user ID
function getUserId() {
    let userId = localStorage.getItem('chart_evaluator_user_id');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chart_evaluator_user_id', userId);
    }
    return userId;
}

// Generate session ID
function getSessionId() {
    let sessionId = sessionStorage.getItem('chart_evaluator_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('chart_evaluator_session_id', sessionId);
    }
    return sessionId;
}

// Submit data to backend - Multiple options (choose one)
async function submitToBackend(data) {
    // OPTION 1: Formspree (Replace YOUR_FORM_ID with your actual Formspree form ID)
    // Sign up at formspree.io and get your form endpoint
    /*
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            evaluation_data: JSON.stringify(data),
            user_id: data.userId,
            pair_id: data.pairId,
            submission_time: data.submissionTimestamp
        })
    });
    */
    
    // OPTION 2: Google Apps Script Web App
    // Deploy a Google Apps Script as web app and replace YOUR_SCRIPT_URL
    const response = await fetch('https://script.google.com/macros/s/AKfycbxDPp-Iyd1JKHbhsuuHmkbXK9hZViDXJ1TsrapktPWVW3QXzT5obkYzkJcOBWKn8wou/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    // OPTION 3: Your custom API endpoint
    // Replace with your actual API endpoint
    /*
    const response = await fetch('/api/submit-evaluation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    */
    
    // OPTION 4: Airtable (Replace with your Airtable details)
    /*
    const response = await fetch('https://api.airtable.com/v0/YOUR_BASE_ID/YOUR_TABLE_NAME', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_AIRTABLE_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            records: [{
                fields: {
                    'User ID': data.userId,
                    'Pair ID': data.pairId,
                    'Submission Time': data.submissionTimestamp,
                    'Evaluation Data': JSON.stringify(data.evaluationSummary),
                    'Full Data': JSON.stringify(data)
                }
            }]
        })
    });
    */
    
    // TEMPORARY: Email submission (requires email service)
    // This is a placeholder - you need to implement actual submission
    console.log('Evaluation submitted:', data);
    
    // For now, just resolve successfully (remove this when you implement real backend)
    // return Promise.resolve({ ok: true });
    
    if (!response.ok) {
        throw new Error('Submission failed');
    }
    
    return response;
}

// Export all evaluations for current pair
function exportCurrentPairEvaluations() {
    if (!currentPairId || !allPairEvaluations[currentPairId]) {
        alert('No pair evaluation data to export');
        return;
    }
    
    const pairData = allPairEvaluations[currentPairId];
    const exportData = {
        ...pairData,
        exportedAt: new Date().toISOString(),
        metadata: {
            ...pairData.metadata,
            userAgent: navigator.userAgent,
            screenResolution: screen.width + 'x' + screen.height
        }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `pair_${currentPairId}_evaluation_${Date.now()}.json`;
    link.click();
}

// Export all pair evaluations
function exportAllPairEvaluations() {
    if (Object.keys(allPairEvaluations).length === 0) {
        alert('No evaluation data to export');
        return;
    }
    
    const exportData = {
        exportedAt: new Date().toISOString(),
        totalPairs: Object.keys(allPairEvaluations).length,
        pairEvaluations: allPairEvaluations,
        metadata: {
            userAgent: navigator.userAgent,
            screenResolution: screen.width + 'x' + screen.height
        }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `all_pair_evaluations_${Date.now()}.json`;
    link.click();
}

// Check if current pair evaluation is complete
function isCurrentPairComplete() {
    if (!currentPairId || !allPairEvaluations[currentPairId]) return false;
    
    const status = allPairEvaluations[currentPairId].completionStatus;
    return Object.values(status).every(completed => completed);
}

// Get evaluation summary for current pair
function getCurrentPairSummary() {
    if (!currentPairId || !allPairEvaluations[currentPairId]) return null;
    
    const evaluation = allPairEvaluations[currentPairId];
    const status = evaluation.completionStatus;
    const completed = Object.values(status).filter(Boolean).length;
    const total = Object.keys(status).length;
    
    return {
        pairId: currentPairId,
        completed: completed,
        total: total,
        isComplete: completed === total,
        completedCategories: Object.entries(status).filter(([k, v]) => v).map(([k, v]) => k)
    };
}

// Clear form responses
function clearFormResponses() {
    // Use the simple evaluation form clearing function if available
    if (typeof clearSimpleEvaluationForm === 'function') {
        clearSimpleEvaluationForm();
    } else {
        // Fallback: Clear all radio buttons, checkboxes and text areas
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => radio.checked = false);
        
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        
        const textAreas = document.querySelectorAll('textarea');
        textAreas.forEach(textarea => textarea.value = '');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Load pair evaluations from localStorage (kept for compatibility)
    const savedPairEvaluations = localStorage.getItem('pairEvaluations');
    if (savedPairEvaluations) {
        try {
            allPairEvaluations = JSON.parse(savedPairEvaluations);
        } catch (error) {
            console.error('Error loading saved pair evaluations:', error);
            allPairEvaluations = {};
        }
    }
    
    // No need to show categories anymore - simplified evaluation is always shown
    console.log('Initialized simplified chart evaluation system');
});

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === '1') {
        event.preventDefault();
        showCategory('clutter');
    } else if (event.ctrlKey && event.key === '2') {
        event.preventDefault();
        showCategory('cognitive_load');
    } else if (event.ctrlKey && event.key === '3') {
        event.preventDefault();
        showCategory('interpretability');
    } else if (event.ctrlKey && event.key === '4') {
        event.preventDefault();
        showCategory('style');
    }
});


