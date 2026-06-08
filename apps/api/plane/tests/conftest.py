# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import pytest
from rest_framework.test import APIClient
from pytest_django.fixtures import django_db_setup

from plane.db.models import User, Workspace, WorkspaceMember
from plane.db.models.api import APIToken

# Make the external-service mock fixtures available to every test. pytest 9 no
# longer allows `pytest_plugins` in a non-top-level conftest, so importing the
# fixtures here registers them instead.
from plane.tests.conftest_external import (  # noqa: E402, F401
    mock_celery,
    mock_elasticsearch,
    mock_mongodb,
    mock_redis,
)


def pytest_collection_modifyitems(config, items):
    """Skip DB-backed tests when no real database is available.

    Plane's models use Postgres-specific SQL, so the schema cannot be built on
    SQLite. When the configured DB is SQLite (the no-Postgres mode), skip every
    test that touches the ORM instead of letting it error. Point the test DB at a
    real Postgres (e.g. unset the SQLite override / set DATABASE_URL) and these
    same tests run normally.
    """
    from django.conf import settings

    engine = settings.DATABASES.get("default", {}).get("ENGINE", "")
    if "sqlite" not in engine:
        return

    skip_db = pytest.mark.skip(reason="No Postgres available: SQLite cannot build Plane's schema")
    # `live_server`/`plane_server` request `transactional_db` dynamically at runtime,
    # so match the live-server fixtures directly too.
    db_fixtures = {
        "db",
        "transactional_db",
        "django_db_reset_sequences",
        "live_server",
        "plane_server",
    }
    for item in items:
        if item.get_closest_marker("django_db") or db_fixtures & set(getattr(item, "fixturenames", ())):
            item.add_marker(skip_db)


@pytest.fixture(autouse=True)
def _auto_mock_redis(mock_redis):  # noqa: F811
    """Patch Redis for every test so a real Redis server is never required."""
    return mock_redis


@pytest.fixture(autouse=True)
def _auto_mock_celery(mock_celery):  # noqa: F811
    """Patch Celery for every test so a real Celery server is never required."""
    return mock_celery


@pytest.fixture(scope="session")
def django_db_setup(django_db_setup):  # noqa: F811
    """Set up the Django database for the test session"""
    pass


@pytest.fixture
def api_client():
    """Return an unauthenticated API client"""
    return APIClient()


@pytest.fixture
def user_data():
    """Return standard user data for tests"""
    return {
        "email": "test@plane.so",
        "password": "test-password",
        "first_name": "Test",
        "last_name": "User",
    }


@pytest.fixture
def create_user(db, user_data):
    """Create and return a user instance"""
    user = User.objects.create(
        email=user_data["email"],
        first_name=user_data["first_name"],
        last_name=user_data["last_name"],
    )
    user.set_password(user_data["password"])
    user.save()
    return user


@pytest.fixture
def api_token(db, create_user):
    """Create and return an API token for testing the external API"""
    token = APIToken.objects.create(
        user=create_user,
        label="Test API Token",
        token="test-api-token-12345",
    )
    return token


@pytest.fixture
def api_key_client(api_client, api_token):
    """Return an API key authenticated client for external API testing"""
    api_client.credentials(HTTP_X_API_KEY=api_token.token)
    return api_client


@pytest.fixture
def session_client(api_client, create_user):
    """Return a session authenticated API client for app API testing, which is what plane.app uses"""
    api_client.force_authenticate(user=create_user)
    return api_client


@pytest.fixture
def create_bot_user(db):
    """Create and return a bot user instance"""
    from uuid import uuid4

    unique_id = uuid4().hex[:8]
    user = User.objects.create(
        email=f"bot-{unique_id}@plane.so",
        username=f"bot_user_{unique_id}",
        first_name="Bot",
        last_name="User",
        is_bot=True,
    )
    user.set_password("bot@123")
    user.save()
    return user


@pytest.fixture
def api_token_data():
    """Return sample API token data for testing"""
    from django.utils import timezone
    from datetime import timedelta

    return {
        "label": "Test API Token",
        "description": "Test description for API token",
        "expired_at": (timezone.now() + timedelta(days=30)).isoformat(),
    }


@pytest.fixture
def create_api_token_for_user(db, create_user):
    """Create and return an API token for a specific user"""
    return APIToken.objects.create(
        label="Test Token",
        description="Test token description",
        user=create_user,
        user_type=0,
    )


@pytest.fixture
def plane_server(live_server):
    """
    Renamed version of live_server fixture to avoid name clashes.
    Returns a live Django server for testing HTTP requests.
    """
    return live_server


@pytest.fixture
def workspace(create_user):
    """
    Create a new workspace and return the
    corresponding Workspace model instance.
    """
    # Create the workspace using the model
    created_workspace = Workspace.objects.create(
        name="Test Workspace",
        owner=create_user,
        slug="test-workspace",
    )

    WorkspaceMember.objects.create(workspace=created_workspace, member=create_user, role=20)

    return created_workspace
