# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import redis
from redis.cluster import RedisCluster
from django.conf import settings
from urllib.parse import urlparse


def redis_instance():
    # connect to redis
    if getattr(settings, "REDIS_CLUSTER", False):
        url = urlparse(settings.REDIS_URL)
        if settings.REDIS_SSL:
            ri = RedisCluster(
                host=url.hostname,
                port=url.port or 6379,
                password=url.password,
                ssl=True,
                ssl_cert_reqs=None,
            )
        else:
            ri = RedisCluster(
                host=url.hostname,
                port=url.port or 6379,
                password=url.password,
            )
    elif settings.REDIS_SSL:
        url = urlparse(settings.REDIS_URL)
        ri = redis.Redis(
            host=url.hostname,
            port=url.port or 6379,
            password=url.password,
            ssl=True,
            ssl_cert_reqs=None,
        )
    else:
        ri = redis.Redis.from_url(settings.REDIS_URL, db=0)

    return ri
