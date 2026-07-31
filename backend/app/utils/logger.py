import os
import sys
import logging
import structlog

# Determine default log file path (backend/app.log)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOG_FILE_PATH = os.environ.get("LOG_FILE_PATH", os.path.join(BASE_DIR, "app.log"))

_initialized = False


def setup_logging(log_file: str = LOG_FILE_PATH, level: int = logging.INFO):
    global _initialized
    if _initialized:
        return structlog.get_logger()

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid duplicate handlers if re-initialized
    if not root_logger.handlers:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(logging.Formatter("%(message)s"))
        root_logger.addHandler(console_handler)

        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setFormatter(logging.Formatter("%(message)s"))
        root_logger.addHandler(file_handler)

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    _initialized = True
    return structlog.get_logger()


# Auto-setup on import
logger = setup_logging()


def get_logger(name: str = None):
    return structlog.get_logger(name)
