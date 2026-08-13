/**
 * Annotation Data Loader (Slider)
 * Handles loading and parsing of question annotation data (path set via
 * window.ANNOTATION_DATA_FILE, default annotate_slider.json)
 * and obtaining a quota-aware per-user assignment from the backend.
 */

class AnnotationDataLoader {
    constructor() {
        this.annotationData = null;
        this.currentAnnotationIndex = 0;
        this.annotations = [];
        this.allEntries = [];
        this.datasetInfoCache = {}; // Cache for YAML dataset info
        this.isInitialized = false;
        this.sampleSize = 25;
        this.targetUsersPerEntry = 5;
        this.assignmentApiUrl = null;
    }

    getDatasetCacheKey(artefact, tableId) {
        return `${artefact || 'unknown'}::${tableId || ''}`;
    }

    buildIntegratedCsvPath(artefact, tableId) {
        const a = String(artefact || '').trim();
        const t = String(tableId || '').trim();
        if (!a || !t) return '';
        return `integrated/datasets/${a}/${t}.csv`;
    }

    parseSimpleYaml(text) {
        const out = {};
        String(text || '').split(/\r?\n/).forEach(line => {
            const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
            if (!m) return;
            out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
        });
        return out;
    }

    // Legacy entries carry only a table id; their metadata/CSV live in csv_c_squared/.
    async enrichLegacyDatasetInfo(entries) {
        const legacy = entries.filter(e => !e.artefact && e.table);
        const tableIds = [...new Set(legacy.map(e => String(e.table)))];

        await Promise.all(tableIds.map(async tableId => {
            const cacheKey = this.getDatasetCacheKey('', tableId);
            if (this.datasetInfoCache[cacheKey]) return;

            const csvPath = `csv_c_squared/${tableId}.csv`;
            let meta = {};
            try {
                const res = await fetch(`csv_c_squared/${tableId}_info.yaml`);
                if (res.ok) meta = this.parseSimpleYaml(await res.text());
            } catch (_) {
                // Fall back to the bare table id below.
            }

            const name = meta.dataset_name || `Dataset ${tableId}`;
            this.datasetInfoCache[cacheKey] = {
                dataset_name: name,
                table_name: name,
                category: meta.category || 'unknown',
                index: tableId,
                integrated_csv_path: csvPath,
                file_path: csvPath,
                source_url: meta.url || '',
                source_ref: meta.ref || '',
                license: meta.license || ''
            };
        }));

        legacy.forEach(entry => {
            const info = this.datasetInfoCache[this.getDatasetCacheKey('', entry.table)];
            if (info) entry.dataset_info = info;
        });
    }

    normalizePath(pathValue) {
        return String(pathValue || '').replace(/\\/g, '/').replace(/^\.\//, '');
    }

    buildChartBasePath(renderedPath) {
        const rp = this.normalizePath(renderedPath);
        if (!rp) return '';
        if (rp.startsWith('integrated/')) return rp;
        if (rp.startsWith('charts/')) return `integrated/${rp}`;
        return `integrated/charts/${rp}`;
    }

    extractVariants(rawVariants) {
        if (Array.isArray(rawVariants)) {
            return rawVariants
                .map(v => String(v || '').trim())
                .filter(Boolean);
        }

        if (rawVariants && typeof rawVariants === 'object') {
            const preferredOrder = [
                'a', 'b', 'chart_a', 'chart_b', 'variant_a', 'variant_b', 'left', 'right', 'first', 'second'
            ];
            const ordered = [];

            preferredOrder.forEach(key => {
                if (rawVariants[key]) {
                    ordered.push(String(rawVariants[key]).trim());
                }
            });

            if (ordered.length > 0) {
                return ordered.filter(Boolean);
            }

            return Object.values(rawVariants)
                .map(v => String(v || '').trim())
                .filter(Boolean);
        }

        return [];
    }

    /**
     * Initialize the loader by fetching and parsing the annotation data
     */
    async initialize() {
        console.log('Initializing Annotation Data Loader...');
        try {
            this.assignmentApiUrl = (typeof window !== 'undefined' && window.GOOGLE_SCRIPT_URL)
                ? window.GOOGLE_SCRIPT_URL
                : null;
            await this.loadAnnotationData();
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
            const dataFile = (typeof window !== 'undefined' && window.ANNOTATION_DATA_FILE)
                ? window.ANNOTATION_DATA_FILE
                : './annotate_slider.json';
            const response = await fetch(dataFile);
            if (!response.ok) {
                throw new Error(`Failed to load annotation data: ${response.status}`);
            }

            this.annotationData = await response.json();
            const rawEntries = this.annotationData.entries || this.annotationData.annotations || [];
            const normalizedEntries = rawEntries
                .map((entry, index) => this.normalizeEntry(entry, index))
                .filter(entry => Array.isArray(entry.variants) && entry.variants.length >= 2);

            this.allEntries = normalizedEntries;

            await this.enrichLegacyDatasetInfo(normalizedEntries);

            // Build artefact+table-level cache from normalized entries.
            normalizedEntries.forEach(entry => {
                const cacheKey = this.getDatasetCacheKey(entry.artefact, entry.table);
                if (entry.table && entry.dataset_info && !this.datasetInfoCache[cacheKey]) {
                    this.datasetInfoCache[cacheKey] = entry.dataset_info;
                }
            });

            const assignedEntryIds = await this.getAssignedEntryIds(normalizedEntries);
            const assignedIdSet = new Set(assignedEntryIds);
            this.annotations = normalizedEntries.filter(entry => assignedIdSet.has(entry.entry_id));

            if (this.annotations.length === 0) {
                console.warn('Assigned set produced no matching entries. Falling back to local random subset.');
                this.annotations = this.shuffleCopy(normalizedEntries).slice(0, Math.min(this.sampleSize, normalizedEntries.length));
            }

            // Keep a deterministic order from assignment response when available
            if (assignedEntryIds.length > 0) {
                const position = new Map(assignedEntryIds.map((id, idx) => [id, idx]));
                this.annotations.sort((a, b) => (position.get(a.entry_id) ?? 9999) - (position.get(b.entry_id) ?? 9999));
            }

            console.log('Annotation data loaded successfully:', {
                totalEntries: this.annotationData.metadata?.total_entries,
                annotationsCount: this.annotations.length
            });
        } catch (error) {
            console.error('Error loading annotation data:', error);
            throw error;
        }
    }

    normalizeEntry(entry, index) {
        const isIntegrated = Object.prototype.hasOwnProperty.call(entry, 'table_id')
            || Object.prototype.hasOwnProperty.call(entry, 'summary_text')
            || Object.prototype.hasOwnProperty.call(entry, 'question_text');

        if (!isIntegrated) {
            const stableId = entry.entry_id || `${entry.table || 't'}_${entry.summary_idx || 's'}_${entry.question_idx || 'q'}_${index}`;
            return {
                ...entry,
                entry_id: stableId,
                // Legacy variants are relative paths like "22/sum_1_ques_4/var1.png"
                chart_base_path: entry.chart_base_path || 'run2_variants_parallel_organized',
                dataset_info: entry.dataset_info || {
                    dataset_name: `Dataset ${entry.table}`,
                    category: 'unknown',
                    index: entry.table
                }
            };
        }

        const tableId = String(entry.table_id ?? '');
        const renderedPath = this.normalizePath(entry.rendered_path || '');
        const normalizedBasePath = this.buildChartBasePath(renderedPath);
        const normalizedVariants = this.extractVariants(entry.variants).slice(0, 2);

        const stableId = `${entry.artefact || 'src'}_${tableId}_s${entry.summary_idx || 0}_q${entry.question_idx || 0}_${normalizedVariants.join('__')}`;

        return {
            entry_id: stableId,
            dataset_key: this.getDatasetCacheKey(entry.artefact || 'src', tableId),
            table: tableId,
            summary_idx: entry.summary_idx,
            narrative_summary: entry.summary_text || '',
            question_idx: entry.question_idx,
            question_string: entry.question_text || '',
            variants: normalizedVariants,
            chart_base_path: normalizedBasePath,
            rendered_path: renderedPath,
            source_file: entry.source_file || '',
            artefact: entry.artefact || '',
            table_metadata: entry.table_metadata || {},
            summary_context: entry.summary_context || {},
            dataset_info: {
                dataset_name: entry.table_metadata?.table_name || `Dataset ${tableId}`,
                category: entry.table_metadata?.category || 'unknown',
                index: tableId,
                table_name: entry.table_metadata?.table_name || `Dataset ${tableId}`,
                file_path: entry.table_metadata?.file_path || '',
                integrated_csv_path: this.buildIntegratedCsvPath(entry.artefact, tableId),
                source_url: entry.table_metadata?.source_url || '',
                source_ref: entry.table_metadata?.source_ref || '',
                license: entry.table_metadata?.license || '',
                row_count: entry.table_metadata?.row_count ?? '',
                column_count: entry.table_metadata?.column_count ?? '',
                field_names: entry.table_metadata?.field_names || []
            }
        };
    }

// Get PlaybookUX session ID or create a new one if it doesn't exist
    getOrCreateSessionId() {
        let sessionId = localStorage.getItem('evaluationSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
            localStorage.setItem('evaluationSessionId', sessionId);
        }
        return sessionId;
    }

    shuffleCopy(list) {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    async getAssignedEntryIds(normalizedEntries) {
        const sessionId = this.getOrCreateSessionId();
        const cacheKey = `assignedEntryIds_${sessionId}`;
        const cached = localStorage.getItem(cacheKey);
        const allIdSet = new Set(normalizedEntries.map(entry => entry.entry_id));
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const valid = parsed.filter(id => allIdSet.has(id));
                    if (valid.length > 0) {
                        return valid;
                    }
                }
            } catch (_) {
                // ignore cache parse errors and re-request
            }
        }

        const allIds = normalizedEntries.map(entry => entry.entry_id);

        if (!this.assignmentApiUrl) {
            const fallbackIds = this.shuffleCopy(allIds).slice(0, Math.min(this.sampleSize, allIds.length));
            localStorage.setItem(cacheKey, JSON.stringify(fallbackIds));
            return fallbackIds;
        }

        try {
            const response = await fetch(this.assignmentApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'assign_entries',
                    sessionId,
                    entryIds: allIds,
                    sampleSize: this.sampleSize,
                    targetPerEntry: this.targetUsersPerEntry
                })
            });

            if (!response.ok) {
                throw new Error(`Assignment request failed: HTTP ${response.status}`);
            }

            const payload = await response.json();
            const assigned = Array.isArray(payload.assignedEntryIds) ? payload.assignedEntryIds : [];
            if (assigned.length === 0) {
                throw new Error('Assignment response missing assignedEntryIds');
            }

            localStorage.setItem(cacheKey, JSON.stringify(assigned));
            return assigned;
        } catch (error) {
            console.warn('Assignment API unavailable, falling back to local random sampling:', error);
            const fallbackIds = this.shuffleCopy(allIds).slice(0, Math.min(this.sampleSize, allIds.length));
            localStorage.setItem(cacheKey, JSON.stringify(fallbackIds));
            return fallbackIds;
        }
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
     * Get dataset information for an annotation or artefact/table pair.
     */
    getDatasetInfo(annotationOrTableId, artefact) {
        if (annotationOrTableId && typeof annotationOrTableId === 'object') {
            if (annotationOrTableId.dataset_info) {
                return annotationOrTableId.dataset_info;
            }

            const tableId = annotationOrTableId.table;
            const cacheKey = this.getDatasetCacheKey(annotationOrTableId.artefact, tableId);
            return this.datasetInfoCache[cacheKey] || {
                dataset_name: `Dataset ${tableId}`,
                category: 'unknown',
                index: tableId
            };
        }

        const tableId = annotationOrTableId;
        const cacheKey = this.getDatasetCacheKey(artefact, tableId);
        return this.datasetInfoCache[cacheKey] || {
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

        const datasetInfo = this.getDatasetInfo(annotation);

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
                dataset_name: this.getDatasetInfo(this.annotations.find(ann => ann.table === table) || table).dataset_name
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
