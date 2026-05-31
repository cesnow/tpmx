# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python imports
import os

# Django imports
from django.core.management.base import BaseCommand, CommandError

# Module imports
from plane.license.models import InstanceConfiguration
from plane.utils.instance_config_variables import instance_config_variables


class Command(BaseCommand):
    help = "Configure instance variables"

    def handle(self, *args, **options):
        from plane.license.utils.encryption import encrypt_data
        from plane.license.utils.instance_value import get_configuration_value

        mandatory_keys = ["SECRET_KEY"]

        for item in mandatory_keys:
            if not os.environ.get(item):
                raise CommandError(f"{item} env variable is required.")

        for item in instance_config_variables:
            obj, created = InstanceConfiguration.objects.get_or_create(key=item.get("key"))
            if created:
                obj.category = item.get("category")
                obj.is_encrypted = item.get("is_encrypted", False)
                if item.get("is_encrypted", False):
                    obj.value = encrypt_data(item.get("value"))
                else:
                    obj.value = item.get("value")
                obj.save()
                self.stdout.write(self.style.SUCCESS(f"{obj.key} loaded with value from environment variable."))
            else:
                self.stdout.write(self.style.WARNING(f"{obj.key} configuration already exists"))

        keys = ["IS_KEYCLOAK_ENABLED"]
        if not InstanceConfiguration.objects.filter(key__in=keys).exists():
            for key in keys:
                if key == "IS_KEYCLOAK_ENABLED":
                    (
                        KEYCLOAK_HOST,
                        KEYCLOAK_REALM,
                        KEYCLOAK_CLIENT_ID,
                        KEYCLOAK_CLIENT_SECRET,
                    ) = get_configuration_value(
                        [
                            {
                                "key": "KEYCLOAK_HOST",
                                "default": os.environ.get("KEYCLOAK_HOST", ""),
                            },
                            {
                                "key": "KEYCLOAK_REALM",
                                "default": os.environ.get("KEYCLOAK_REALM", ""),
                            },
                            {
                                "key": "KEYCLOAK_CLIENT_ID",
                                "default": os.environ.get("KEYCLOAK_CLIENT_ID", ""),
                            },
                            {
                                "key": "KEYCLOAK_CLIENT_SECRET",
                                "default": os.environ.get("KEYCLOAK_CLIENT_SECRET", ""),
                            },
                        ]
                    )
                    if (
                        bool(KEYCLOAK_HOST)
                        and bool(KEYCLOAK_REALM)
                        and bool(KEYCLOAK_CLIENT_ID)
                        and bool(KEYCLOAK_CLIENT_SECRET)
                    ):
                        value = "1"
                    else:
                        value = "0"
                    InstanceConfiguration.objects.create(
                        key="IS_KEYCLOAK_ENABLED",
                        value=value,
                        category="AUTHENTICATION",
                        is_encrypted=False,
                    )
                    self.stdout.write(self.style.SUCCESS(f"{key} loaded with value from environment variable."))
        else:
            for key in keys:
                self.stdout.write(self.style.WARNING(f"{key} configuration already exists"))
