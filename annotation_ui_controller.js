/**
 * Annotation UI Controller
 * Manages the UI for displaying annotation data and navigation
 */

class AnnotationUIController {
    constructor() {
        this.loader = window.annotationLoader;
        this.isInitialized = false;
    }

    /**
     * Initialize the UI controller
     */
    async initialize() {
        console.log('Initializing Annotation UI Controller...');
        
        // Initialize the data loader first
        const success = await this.loader.initialize();
        if (!success) {
            this.showError('Failed to load annotation data');
            return false;
        }

        // Setup UI event listeners
        this.setupEventListeners();
        
        // Load the first annotation
        this.loadCurrentAnnotation();
        
        this.isInitialized = true;
        console.log('Annotation UI Controller initialized successfully');
        return true;
    }

    /**
     * Setup event listeners for navigation
     */
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Previous button
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigatePrevious());
        }

        // Next button
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateNext());
        }

        // Slider
        const slider = document.getElementById('pairSlider');
        if (slider) {
            slider.addEventListener('input', (e) => this.handleSliderChange(e.target.value));
            
            // Update slider max value
            slider.max = this.loader.getTotalAnnotations() - 1;
            slider.value = 0;
            console.log('Slider configured: max =', slider.max, 'current =', slider.value);
        }

        // Update slider label text
        this.updateSliderLabel();
    }

    /**
     * Navigate to previous annotation
     */
    navigatePrevious() {
        console.log('navigatePrevious called, current index:', this.loader.getCurrentIndex());
        const annotation = this.loader.previousAnnotation();
        if (annotation) {
            console.log('Moved to annotation index:', annotation.annotation_index);
            this.updateUI(annotation);
            this.updateNavigationUI();
        }
    }

    /**
     * Navigate to next annotation
     */
    navigateNext() {
        console.log('navigateNext called, current index:', this.loader.getCurrentIndex());
        const annotation = this.loader.nextAnnotation();
        if (annotation) {
            console.log('Moved to annotation index:', annotation.annotation_index);
            this.updateUI(annotation);
            this.updateNavigationUI();
        }
    }

    /**
     * Handle slider change
     */
    handleSliderChange(value) {
        console.log('handleSliderChange called with value:', value);
        const index = parseInt(value);
        const annotation = this.loader.navigateToAnnotation(index);
        if (annotation) {
            console.log('Slider moved to annotation index:', annotation.annotation_index);
            this.updateUI(annotation);
            this.updateNavigationUI();
        }
    }

    /**
     * Load and display the current annotation
     */
    loadCurrentAnnotation() {
        const annotation = this.loader.getCurrentAnnotationWithDatasetInfo();
        if (annotation) {
            this.updateUI(annotation);
            this.updateNavigationUI();
        }
    }

    /**
     * Update the UI with annotation data
     */
    updateUI(annotation) {
        console.log('Updating UI with annotation:', annotation);

        // Update dataset name from YAML instead of annotation fallback
        this.updateDatasetName(annotation.table);

        // Update question display
        this.updateQuestion(annotation.question_string);

        // Update context
        this.updateContext(annotation.narrative_summary);

        // Update dataset modal content
        this.updateDatasetModal(annotation);

        // Update any additional UI elements
        this.updateAdditionalInfo(annotation);
    }

    /**
     * Update dataset name display using YAML data
     */
    async updateDatasetName(tableNumber) {
        const datasetNameElement = document.getElementById('datasetName');
        if (datasetNameElement) {
            // Show loading state
            datasetNameElement.textContent = 'Loading...';
            
            // Load dataset name from YAML
            if (typeof window.loadDatasetNameFromYAML === 'function') {
                const datasetName = await window.loadDatasetNameFromYAML(tableNumber);
                if (datasetName) {
                    datasetNameElement.textContent = datasetName;
                } else {
                    datasetNameElement.textContent = 'Dataset name not found';
                }
            } else {
                console.warn('loadDatasetNameFromYAML function not available');
                datasetNameElement.textContent = `Table ${tableNumber}`;
            }
        }
    }

    /**
     * Update question display
     */
    updateQuestion(questionString) {
        // Update the main question area
        let questionElement = document.getElementById('currentQuestion');
        if (!questionElement) {
            // Create question element if it doesn't exist
            const masterSection = document.getElementById('masterQuestionSection');
            if (masterSection) {
                const questionDiv = document.createElement('div');
                questionDiv.id = 'currentQuestion';
                questionDiv.className = 'current-question';
                questionDiv.style.cssText = `
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 10px 0;
                    font-size: 16px;
                    font-weight: 500;
                    color: #495057;
                `;
                
                // Insert after dataset info but before info links
                const infoLinks = masterSection.querySelector('.info-links-section');
                if (infoLinks) {
                    masterSection.insertBefore(questionDiv, infoLinks);
                } else {
                    masterSection.appendChild(questionDiv);
                }
                
                questionElement = questionDiv;
            }
        }

        if (questionElement) {
            questionElement.innerHTML = `<strong>Question:</strong> ${questionString}`;
        }
    }

    /**
     * Update context modal
     */
    updateContext(narrativeSummary) {
        // Store context for modal display
        this.currentContext = narrativeSummary;
        
        // Update context modal if it exists
        const contextModal = document.getElementById('contextModal');
        const contextContent = document.getElementById('contextContent');
        
        if (contextContent) {
            contextContent.textContent = narrativeSummary;
        } else if (contextModal) {
            // Create context content if modal exists but content doesn't
            const content = contextModal.querySelector('.modal-body');
            if (content) {
                content.innerHTML = `<div id="contextContent">${narrativeSummary}</div>`;
            }
        }
    }

    /**
     * Update dataset modal with table information
     */
    updateDatasetModal(annotation) {
        const datasetModal = document.getElementById('datasetModal');
        const modalBody = datasetModal?.querySelector('.modal-body');
        
        if (modalBody) {
            const datasetInfo = annotation.dataset_info;
            const csvPath = `./csv_c_squared/${annotation.table}.csv`;
            
            modalBody.innerHTML = `
                <div class="dataset-info-detail">
                    <h5>${datasetInfo.dataset_name}</h5>
                    <div class="info-grid">
                        <div><strong>Table ID:</strong> ${annotation.table}</div>
                        <div><strong>Category:</strong> ${datasetInfo.category || 'Unknown'}</div>
                        <div><strong>License:</strong> ${datasetInfo.license || 'Not specified'}</div>
                        ${datasetInfo.url ? `<div><strong>Source:</strong> <a href="${datasetInfo.url}" target="_blank">View Original</a></div>` : ''}
                    </div>
                    <div class="csv-preview">
                        <h6>Dataset Preview</h6>
                        <div id="csvPreviewContainer">
                            <button onclick="annotationUI.loadCSVPreview('${annotation.table}')" class="btn btn-primary btn-sm">
                                Load Data Sample
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Load CSV preview data
     */
    async loadCSVPreview(tableId) {
        const container = document.getElementById('csvPreviewContainer');
        if (!container) return;

        try {
            container.innerHTML = '<div class="text-center">Loading...</div>';

            const response = await fetch(`./csv_c_squared/${tableId}.csv`);
            if (!response.ok) {
                throw new Error('Failed to load CSV data');
            }

            const csvText = await response.text();
            const lines = csvText.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) {
                container.innerHTML = '<div class="text-muted">No data available</div>';
                return;
            }

            // Parse CSV (simple implementation)
            const headers = this.parseCSVLine(lines[0]);
            const rows = lines.slice(1, Math.min(6, lines.length)) // Show first 5 data rows
                .map(line => this.parseCSVLine(line));

            // Create table
            let tableHTML = `
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                ${headers.map(header => `<th>${this.escapeHtml(header)}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
            `;

            rows.forEach(row => {
                tableHTML += '<tr>';
                headers.forEach((header, index) => {
                    const value = row[index] || '';
                    tableHTML += `<td>${this.escapeHtml(value)}</td>`;
                });
                tableHTML += '</tr>';
            });

            tableHTML += `
                        </tbody>
                    </table>
                </div>
                <div class="text-muted text-center mt-2">
                    Showing first 5 rows of ${lines.length - 1} total rows
                </div>
            `;

            container.innerHTML = tableHTML;

        } catch (error) {
            console.error('Error loading CSV preview:', error);
            container.innerHTML = '<div class="text-danger">Failed to load data preview</div>';
        }
    }

    /**
     * Simple CSV line parser
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            let char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * Escape HTML characters
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update additional information display
     */
    updateAdditionalInfo(annotation) {
        // Update any additional info elements
        const additionalInfo = {
            summaryIndex: annotation.summary_idx,
            questionIndex: annotation.question_idx,
            tableId: annotation.table,
            variants: annotation.variants?.length || 0
        };

        // Log for debugging
        console.log('Additional annotation info:', additionalInfo);
    }

    /**
     * Update navigation UI elements
     */
    updateNavigationUI() {
        // Update slider
        const slider = document.getElementById('pairSlider');
        if (slider) {
            slider.value = this.loader.getCurrentIndex();
        }

        // Update current position display
        const currentSpan = document.querySelector('.compact-slider-current');
        if (currentSpan) {
            const current = this.loader.getCurrentIndex() + 1;
            const total = this.loader.getTotalAnnotations();
            currentSpan.textContent = `${current} of ${total}`;
        }

        // Update button states
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = !this.loader.hasPrevious();
        }
        
        if (nextBtn) {
            nextBtn.disabled = !this.loader.hasNext();
        }
    }

    /**
     * Update slider label
     */
    updateSliderLabel() {
        const label = document.querySelector('.compact-slider-label');
        if (label) {
            label.textContent = 'Question:';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        alert('Error: ' + message);
    }

    /**
     * Get current annotation data (for external access)
     */
    getCurrentAnnotation() {
        return this.loader.getCurrentAnnotationWithDatasetInfo();
    }

    /**
     * Get summary statistics (for debugging/info)
     */
    getSummaryStats() {
        return this.loader.getSummaryStats();
    }
}

// Global instance
window.annotationUI = new AnnotationUIController();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing annotation UI...');
    await window.annotationUI.initialize();
});