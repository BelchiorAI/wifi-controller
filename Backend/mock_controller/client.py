"""
client.py

Simulates a third-party Wi-Fi controller API by reading from a local JSON file.
In a real integration this would be an HTTP client calling an external API.
"""

import json
from pathlib import Path

MOCK_DATA_PATH = Path(__file__).parent / "data.json"


class MockControllerError(Exception):
    """Raised when the mock controller simulates an API failure."""
    pass


def fetch_controller_data(simulate_failure: bool = False) -> dict:
    """
    Simulates calling a third-party Wi-Fi controller API.
    Reads from a static JSON file to mimic an external data source.
    Raises MockControllerError to simulate an upstream API failure.
    """
    if simulate_failure:
        raise MockControllerError(
            "Mock controller: upstream API returned 503 Service Unavailable"
        )

    try:
        with open(MOCK_DATA_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        raise MockControllerError(
            f"Mock controller: data file not found at {MOCK_DATA_PATH}"
        )
    except json.JSONDecodeError as e:
        raise MockControllerError(
            f"Mock controller: failed to parse data file — {e}"
        )