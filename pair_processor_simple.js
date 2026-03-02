/**
 * Simplified Pair Directory Processor
 * Only processes actual pair directories (pair1, pair2, etc.) from the pairs folder
 */

class PairProcessor {
    constructor() {
        // Simple path construction based on environment
        const isGitHubPages = window.location.hostname.includes('github.io');
        this.basePath = isGitHubPages ? 'run1_variants' : './run1_variants';
        
        console.log('Environment:', { isGitHubPages, basePath: this.basePath });
        
        this.currentPairIndex = 0;
        this.allPairs = [];
        this.isInitialized = false;
    }

    /**
     * Initialize the processor by scanning all pair directories
     */
    async initialize() {
        console.log('Initializing Simplified Pair Processor...');
        await this.scanAllPairDirectories();
        this.isInitialized = true;
        console.log(`Found ${this.allPairs.length} total pairs`);
    }

    /**
     * Scan all pair directories from all datasets
     */
    async scanAllPairDirectories() {
        console.log('Scanning all pair directories...');
        
        const datasets = ['3', '2', '1']; // All datasets: Inc500Charts, fifa18_rendered_charts, ATP_rendered_charts
        
        for (const dataset of datasets) {
            await this.processDataset(dataset);
        }
        
        console.log(`Found ${this.allPairs.length} total pairs from all datasets`);
    }

    /**
     * Process a single dataset
     */
    async processDataset(dataset) {
        const summaryDirs = ['sum_1_ques_3', 'sum_1_ques_4', 'sum_2_ques_3', 'sum_2_ques_4'];
        
        for (const summaryDir of summaryDirs) {
            // Load images directly from the summary directory
            const pairData = await this.processSummaryDirectory(dataset, summaryDir);
            
            if (pairData && pairData.images.length >= 2) {
                this.allPairs.push(pairData);
            }
        }
    }

    /**
     * Process a summary directory and load its images directly
     */
    async processSummaryDirectory(dataset, summaryDir) {
        const summaryPath = `${this.basePath}/${dataset}/${summaryDir}`;
        
        try {
            const images = await this.loadImagesFromDirectory(summaryPath);
            
            if (images.length < 2) {
                return null;
            }
            
            return {
                id: `${dataset}_${summaryDir}`,
                dataset: dataset,
                summaryDir: summaryDir,
                pairDir: '', // No pair subdirectory in new structure
                pairPath: summaryPath,
                images: images,
                metadata: {
                    dataset: this.getDatasetName(dataset),
                    summary: summaryDir,
                    question: this.extractQuestion(summaryDir),
                    pairNumber: 1 // Single pair per summary directory
                }
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Process a pair directory and load its images
     */
    async processPairDirectory(dataset, summaryDir, pairDir) {
        const pairPath = `${this.basePath}/${dataset}/${summaryDir}/${pairDir}`;
        
        try {
            const images = await this.loadImagesFromDirectory(pairPath);
            
            if (images.length < 2) {
                return null;
            }
            
            return {
                id: `${dataset}_${summaryDir}_${pairDir}`,
                dataset: dataset,
                summaryDir: summaryDir,
                pairDir: pairDir,
                pairPath: pairPath,
                images: images,
                metadata: {
                    dataset: this.getDatasetName(dataset),
                    summary: summaryDir,
                    question: this.extractQuestion(summaryDir),
                    pairNumber: parseInt(pairDir.replace('pair', ''))
                }
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Load images from a directory
     */
    async loadImagesFromDirectory(dirPath) {
        const images = [];
        
        // Test for variant image names (var1.png, var2.png, etc.)
        const testFiles = [];
        for (let i = 1; i <= 10; i++) {
            testFiles.push(`var${i}.png`);
        }
        
        for (const filename of testFiles) {
            const imagePath = `${dirPath}/${filename}`;
            
            if (await this.checkImageExists(imagePath)) {
                images.push({
                    name: filename,
                    path: imagePath,
                    fullUrl: imagePath
                });
                
                // Stop after finding enough images
                if (images.length >= 10) break;
            }
        }
        
        // Sort by numeric order
        images.sort((a, b) => {
            const aNum = parseInt(a.name.match(/\d+/)?.[0] || 0);
            const bNum = parseInt(b.name.match(/\d+/)?.[0] || 0);
            return aNum - bNum;
        });
        
        return images;
    }



    /**
     * Check if image file exists
     */
    async checkImageExists(imagePath) {
        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Get human-readable dataset name
     */
    getDatasetName(dataset) {
        const datasetMap = {
            '1': 'ATP Number 1 Rankings',
            '2': 'FIFA 18 Dataset',
            '3': 'Inc5000 Company List 2014'
        };
        return datasetMap[dataset] || dataset;
    }

    /**
     * Extract question number from summary directory name
     */
    extractQuestion(summaryDir) {
        const match = summaryDir.match(/ques_(\d+)/);
        return match ? match[1] : '1';
    }

    /**
     * Get comprehensive statistics about loaded pairs
     */
    getStatistics() {
        const stats = {
            totalPairs: this.allPairs.length,
            datasetBreakdown: {},
            summaryBreakdown: {},
            questionBreakdown: {}
        };

        this.allPairs.forEach(pair => {
            // Dataset breakdown
            const dataset = pair.metadata.dataset;
            stats.datasetBreakdown[dataset] = (stats.datasetBreakdown[dataset] || 0) + 1;

            // Summary breakdown
            stats.summaryBreakdown[pair.summaryDir] = (stats.summaryBreakdown[pair.summaryDir] || 0) + 1;

            // Question breakdown
            const question = pair.metadata.question;
            stats.questionBreakdown[question] = (stats.questionBreakdown[question] || 0) + 1;
        });

        return stats;
    }

    /**
     * Filter pairs based on criteria
     */
    filterPairs(criteria) {
        return this.allPairs.filter(pair => {
            if (criteria.dataset && !pair.dataset.toLowerCase().includes(criteria.dataset.toLowerCase())) {
                return false;
            }
            if (criteria.summary && pair.summaryDir !== criteria.summary) {
                return false;
            }
            if (criteria.question && pair.metadata.question !== criteria.question) {
                return false;
            }
            return true;
        });
    }
}