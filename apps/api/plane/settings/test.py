# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Test Settings"""

import os


# `plane/__init__.py` builds a Redis client at import time (via Celery), which
# reads settings.REDIS_URL. Provide a dummy URL so importing the settings never
# crashes when no Redis is running — redis-py connects lazily, so nothing is
# actually contacted. Runtime Redis access is mocked by the autouse `mock_redis`
# fixture (see plane/tests/conftest.py + conftest_external.py); a fixture cannot
# intercept this import-time call, hence the dummy URL is still required.
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

# Several endpoints build absolute URLs from these; provide test defaults so the
# suite does not depend on a populated .env (see plane/utils/host.py).
os.environ.setdefault("WEB_URL", "http://localhost:3000")
os.environ.setdefault("APP_BASE_URL", "http://localhost:3000")

from .common import *  # noqa

DEBUG = True

# Send it in a dummy outbox
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Run Celery tasks inline so no message broker (RabbitMQ) is needed.
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

INSTALLED_APPS.append(  # noqa
    "plane.tests"
)


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}
