import pytest
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.db import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
