# Working configuration file for Table Summarizer
# Modify these settings according to your LLM setup

# LLM Configuration - UPDATE THESE VALUES
MODEL_CONFIG = {
    "endpoint": "azure",  # Change to your provider: "openai", "azure", "ollama", etc.
    "model": "gpt-4.1",    # Change to your model/deployment name
    "api_key": "",        # Add your API key if needed (leave empty for Azure DefaultCredential)
    "api_base": "https://astiwar-resource-prose-dev-east-us.openai.azure.com/",  # UPDATE: Your Azure endpoint
    "api_version": "2024-10-21"  # API version
}

# Processing Configuration
SAMPLE_SIZE = 5  # Number of rows to sample from each data file
SUMMARIES_PER_GENERATION = 4  # Number of summaries to generate per LLM call
NUM_GENERATIONS = 1  # Number of generations to perform per file
CSV_DIRECTORY = "csv"  # Directory containing your CSV/Excel files
OUTPUT_DIRECTORY = "output"  # Directory where results will be saved

# Stage 2 Configuration
NUMBER_OF_QUESTIONS = 6  # Number of questions to generate per summary in Stage 2
QUESTIONS_OUTPUT_DIRECTORY = "questions_output"  # Directory where Stage 2 results will be saved

# Stage 3 Configuration
NUMBER_OF_CHART_SUGGESTIONS = 1  # Number of chart suggestions to generate per question in Stage 3
NUM_CHART_GENERATIONS = 2  # Number of generations to perform per question in Stage 3
CHARTS_OUTPUT_DIRECTORY = "charts_output"  # Directory where Stage 3 results will be saved

# Stage 3 Output Files
STAGE3_COT_OUTPUT_FILE = "output/stage3_chart_suggestions_cot"  # CoT mode output with target audience & curator intention
STAGE3_SIMPLE_OUTPUT_FILE = "output/stage3_chart_suggestions_simple"  # Simple mode output with question only
STAGE3_COT_RANKINGS_FILE = "output/stage3_chart_rankings_cot"  # CoT mode rankings
STAGE3_SIMPLE_RANKINGS_FILE = "output/stage3_chart_rankings_simple"  # Simple mode rankings

# Logging Configuration
VERBOSE_LOGGING = True  # Set to False to reduce log output
LOG_FILE = None  # Set to a filename to specify log file, None for auto-generated