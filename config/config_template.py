# Configuration file for LLM settings
# Copy this file to config.py and modify the settings according to your setup

# LLM Configuration
MODEL_CONFIG = {
    "endpoint": "azure",  # Options: "openai", "azure", "ollama", "anthropic", "gemini"
    "model": "gpt-4o",    # Your model name (for Azure: your deployment name)
    "api_key": "",        # Leave empty for Azure to use DefaultAzureCredential
    "api_base": "https://astiwar-resource-prose-dev-east-us.openai.azure.com/",  # Your Azure OpenAI endpoint
    "api_version": "2024-10-21"  # API version
}

# Processing Configuration
SAMPLE_SIZE = 10  # Number of rows to sample from each data file
SUMMARIES_PER_GENERATION = 3  # Number of summaries to generate per LLM call
NUM_GENERATIONS = 2  # Number of generations to perform per file
CSV_DIRECTORY = "csv"  # Directory containing your CSV/Excel files
OUTPUT_DIRECTORY = "output"  # Directory where results will be saved

# Logging Configuration
VERBOSE_LOGGING = True  # Set to False to reduce log output
LOG_FILE = None  # Set to a filename to specify log file, None for auto-generated


# Example configurations for different providers:

# OpenAI Configuration:
# MODEL_CONFIG = {
#     "endpoint": "openai",
#     "model": "gpt-4o",
#     "api_key": "your-openai-api-key",
#     "api_base": "",
#     "api_version": ""
# }

# Ollama Configuration (local):
# MODEL_CONFIG = {
#     "endpoint": "ollama",
#     "model": "llama3.1",
#     "api_key": "",
#     "api_base": "http://localhost:11434",
#     "api_version": ""
# }

# Anthropic Configuration:
# MODEL_CONFIG = {
#     "endpoint": "anthropic",
#     "model": "claude-3-sonnet-20240229",
#     "api_key": "your-anthropic-api-key",
#     "api_base": "",
#     "api_version": ""
# }