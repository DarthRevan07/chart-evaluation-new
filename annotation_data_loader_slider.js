/**
 * Annotation Data Loader (Slider)
 * Handles loading and parsing of question annotation data from annotate_slider.json
 * and associated dataset information from YAML files
 */

class AnnotationDataLoader {
    constructor() {
        this.annotationData = null;
        this.currentAnnotationIndex = 0;
        this.annotations = [];
        this.datasetInfoCache = {}; // Cache for YAML dataset info
        this.isInitialized = false;
    }

    /**
     * Initialize the loader by fetching and parsing the annotation data
     */
    async initialize() {
        console.log('Initializing Annotation Data Loader...');
        try {
            await this.loadAnnotationData();
            await this.loadDatasetInfo();
            this.isInitialized = true;
            console.log(`Loaded ${this.annotations.length} annotations`);
            return true;
        } catch (error) {
            console.error('Failed to initialize annotation data loader:', error);
            return false;
        }
    }

    /**
     * Load the main annotation data from JSON file
     */
    async loadAnnotationData() {
        try {
            const response = await fetch('./annotate_slider.json');
            if (!response.ok) {
                throw new Error(`Failed to load annotation data: ${response.status}`);
            }

            this.annotationData = await response.json();
            this.annotations = this.annotationData.annotations || [];

            console.log('Annotation data loaded successfully:', {
                totalEntries: this.annotationData.metadata?.total_entries,
                annotationsCount: this.annotations.length
            });
        } catch (error) {
            console.error('Error loading annotation data:', error);
            throw error;
        }
    }

    /**
     * Load dataset information from YAML files for all unique tables
     */
    async loadDatasetInfo() {
        // Get unique table IDs from annotations
        const uniqueTableIds = [...new Set(this.annotations.map(ann => ann.table))];

        console.log('Loading dataset info for tables:', uniqueTableIds);

        // Load YAML info for each unique table
        for (const tableId of uniqueTableIds) {
            try {
                const yamlContent = await this.fetchYamlContent(tableId);
                this.datasetInfoCache[tableId] = yamlContent;
                console.log(`Loaded dataset info for table ${tableId}:`, yamlContent.dataset_name);
            } catch (error) {
                console.warn(`Failed to load dataset info for table ${tableId}:`, error);
                // Provide fallback info
                this.datasetInfoCache[tableId] = {
                    dataset_name: `Dataset ${tableId}`,
                    category: 'unknown',
                    index: tableId
                };
            }
        }
    }

    /**
     * Fetch and parse YAML content for a given table ID
     */
    async fetchYamlContent(tableId) {
        const yamlPath = `./csv_c_squared/${tableId}_info.yaml`;

        try {
            const response = await fetch(yamlPath);
            if (!response.ok) {
                throw new Error(`YAML file not found: ${yamlPath}`);
            }

            const yamlText = await response.text();
            return this.parseYaml(yamlText);
        } catch (error) {
            console.error(`Error fetching YAML for table ${tableId}:`, error);
            throw error;
        }
    }

    /**
     * Simple YAML parser for dataset info files
     */
    parseYaml(yamlText) {
        const result = {};
        const lines = yamlText.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const colonIndex = trimmedLine.indexOf(':');
                if (colonIndex !== -1) {
                    const key = trimmedLine.substring(0, colonIndex).trim();
                    let value = trimmedLine.substring(colonIndex + 1).trim();

                    // Remove quotes if present
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }

                    result[key] = value;
                }
            }
        }

        return result;
    }

    /**
     * Get the current annotation
     */
    getCurrentAnnotation() {
        if (!this.isInitialized || this.currentAnnotationIndex >= this.annotations.length) {
            return null;
        }
        return this.annotations[this.currentAnnotationIndex];
    }

    /**
     * Get dataset information for a table ID
     */
    getDatasetInfo(tableId) {
        return this.datasetInfoCache[tableId] || {
            dataset_name: `Dataset ${tableId}`,
            category: 'unknown',
            index: tableId
        };
    }

    /**
     * Get current annotation with enriched dataset information
     */
    getCurrentAnnotationWithDatasetInfo() {
        const annotation = this.getCurrentAnnotation();
        if (!annotation) return null;

        const datasetInfo = this.getDatasetInfo(annotation.table);

        return {
            ...annotation,
            dataset_info: datasetInfo,
            annotation_index: this.currentAnnotationIndex,
            total_annotations: this.annotations.length
        };
    }

    /**
     * Navigate to a specific annotation by index
     */
    navigateToAnnotation(index) {
        if (index >= 0 && index < this.annotations.length) {
            this.currentAnnotationIndex = index;
            return this.getCurrentAnnotationWithDatasetInfo();
        }
        return null;
    }

    /**
     * Navigate to next annotation
     */
    nextAnnotation() {
        if (this.currentAnnotationIndex < this.annotations.length - 1) {
            this.currentAnnotationIndex++;
            return this.getCurrentAnnotationWithDatasetInfo();
        }
        return null;
    }

    /**
     * Navigate to previous annotation
     */
    previousAnnotation() {
        if (this.currentAnnotationIndex > 0) {
            this.currentAnnotationIndex--;
            return this.getCurrentAnnotationWithDatasetInfo();
        }
        return null;
    }

    /**
     * Get total number of annotations
     */
    getTotalAnnotations() {
        return this.annotations.length;
    }

    /**
     * Get current annotation index (0-based)
     */
    getCurrentIndex() {
        return this.currentAnnotationIndex;
    }

    /**
     * Check if there are more annotations
     */
    hasNext() {
        return this.currentAnnotationIndex < this.annotations.length - 1;
    }

    /**
     * Check if there are previous annotations
     */
    hasPrevious() {
        return this.currentAnnotationIndex > 0;
    }

    /**
     * Get summary statistics
     */
    getSummaryStats() {
        if (!this.isInitialized) return null;

        const uniqueTables = [...new Set(this.annotations.map(ann => ann.table))];
        const summaryStats = {};

        // Count annotations per table
        for (const table of uniqueTables) {
            summaryStats[table] = {
                count: this.annotations.filter(ann => ann.table === table).length,
                dataset_name: this.getDatasetInfo(table).dataset_name
            };
        }

        return {
            total_annotations: this.annotations.length,
            unique_tables: uniqueTables.length,
            tables: summaryStats,
            metadata: this.annotationData.metadata
        };
    }

    /**
     * Search annotations by criteria
     */
    searchAnnotations(criteria) {
        if (!this.isInitialized) return [];

        return this.annotations.filter((annotation, index) => {
            // Search by table
            if (criteria.table && annotation.table !== criteria.table) {
                return false;
            }

            // Search by question string (case insensitive)
            if (criteria.question && !annotation.question_string.toLowerCase().includes(criteria.question.toLowerCase())) {
                return false;
            }

            // Search by summary index
            if (criteria.summaryIdx && annotation.summary_idx !== criteria.summaryIdx) {
                return false;
            }

            return true;
        }).map((annotation, origIndex) => ({
            ...annotation,
            search_index: this.annotations.indexOf(annotation)
        }));
    }
}

// Global instance
window.annotationLoader = new AnnotationDataLoader();
