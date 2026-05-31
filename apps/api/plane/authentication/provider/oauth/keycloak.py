# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python imports
import os
from datetime import datetime, timedelta
from urllib.parse import urlparse

import pytz
from keycloak import KeycloakOpenID
from keycloak.exceptions import KeycloakError

# Module imports
from plane.authentication.adapter.oauth import OauthAdapter
from plane.license.utils.instance_value import get_configuration_value
from plane.authentication.adapter.error import (
    AUTHENTICATION_ERROR_CODES,
    AuthenticationException,
)


def _decode_kc_error_body(exc):
    body = getattr(exc, "response_body", b"") or b""
    if isinstance(body, bytes):
        try:
            return body.decode(errors="replace")
        except Exception:
            return repr(body)
    return str(body)


class KeycloakOAuthProvider(OauthAdapter):
    provider = "keycloak"
    scope = "openid email profile"

    def __init__(self, request, code=None, state=None, callback=None):
        (
            KEYCLOAK_CLIENT_ID,
            KEYCLOAK_CLIENT_SECRET,
            KEYCLOAK_HOST,
            KEYCLOAK_REALM,
        ) = get_configuration_value(
            [
                {
                    "key": "KEYCLOAK_CLIENT_ID",
                    "default": os.environ.get("KEYCLOAK_CLIENT_ID"),
                },
                {
                    "key": "KEYCLOAK_CLIENT_SECRET",
                    "default": os.environ.get("KEYCLOAK_CLIENT_SECRET"),
                },
                {
                    "key": "KEYCLOAK_HOST",
                    "default": os.environ.get("KEYCLOAK_HOST"),
                },
                {
                    "key": "KEYCLOAK_REALM",
                    "default": os.environ.get("KEYCLOAK_REALM"),
                },
            ]
        )

        if not (
            KEYCLOAK_CLIENT_ID
            and KEYCLOAK_CLIENT_SECRET
            and KEYCLOAK_HOST
            and KEYCLOAK_REALM
        ):
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["KEYCLOAK_NOT_CONFIGURED"],
                error_message="KEYCLOAK_NOT_CONFIGURED",
            )

        parsed = urlparse(KEYCLOAK_HOST)
        if not parsed.scheme or parsed.scheme not in ("https", "http"):
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["KEYCLOAK_NOT_CONFIGURED"],
                error_message="KEYCLOAK_NOT_CONFIGURED",
            )
        KEYCLOAK_HOST = KEYCLOAK_HOST.rstrip("/")

        realm_base = f"{KEYCLOAK_HOST}/realms/{KEYCLOAK_REALM}/protocol/openid-connect"

        self.keycloak = KeycloakOpenID(
            server_url=KEYCLOAK_HOST,
            client_id=KEYCLOAK_CLIENT_ID,
            realm_name=KEYCLOAK_REALM,
            client_secret_key=KEYCLOAK_CLIENT_SECRET,
            verify=True,
        )

        config_well_known = self.keycloak.well_known()

        self.token_url = f"{realm_base}/token"
        self.userinfo_url = f"{realm_base}/userinfo"
        redirect_uri = f"{'https' if request.is_secure() else 'http'}://{request.get_host()}/auth/keycloak/callback/"

        auth_url = self.keycloak.auth_url(
            redirect_uri=redirect_uri,
            scope=self.scope,
            state=state or "",
        )

        super().__init__(
            request,
            self.provider,
            KEYCLOAK_CLIENT_ID,
            self.scope,
            redirect_uri,
            auth_url,
            self.token_url,
            self.userinfo_url,
            KEYCLOAK_CLIENT_SECRET,
            code,
            callback=callback,
        )

    def set_token_data(self):
        try:
            token_response = self.keycloak.token(
                grant_type="authorization_code",
                code=self.code,
                redirect_uri=self.redirect_uri,
            )
        except KeycloakError as e:
            self.logger.warning(
                "Keycloak token exchange failed: status=%s body=%s redirect_uri=%s",
                getattr(e, "response_code", "?"),
                _decode_kc_error_body(e),
                self.redirect_uri,
            )
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["KEYCLOAK_OAUTH_PROVIDER_ERROR"],
                error_message="KEYCLOAK_OAUTH_PROVIDER_ERROR",
            )

        super().set_token_data(
            {
                "access_token": token_response.get("access_token"),
                "refresh_token": token_response.get("refresh_token"),
                "access_token_expired_at": (
                    datetime.now(tz=pytz.utc) + timedelta(seconds=token_response["expires_in"])
                    if token_response.get("expires_in")
                    else None
                ),
                "refresh_token_expired_at": (
                    datetime.now(tz=pytz.utc) + timedelta(seconds=token_response["refresh_expires_in"])
                    if token_response.get("refresh_expires_in")
                    else None
                ),
                "id_token": token_response.get("id_token", ""),
            }
        )

    def set_user_data(self):
        try:
            user_info = self.keycloak.userinfo(self.token_data.get("access_token"))
        except KeycloakError as e:
            self.logger.warning(
                "Keycloak userinfo failed: status=%s body=%s",
                getattr(e, "response_code", "?"),
                _decode_kc_error_body(e),
            )
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["KEYCLOAK_OAUTH_PROVIDER_ERROR"],
                error_message="KEYCLOAK_OAUTH_PROVIDER_ERROR",
            )

        email = user_info.get("email")
        if not email:
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["KEYCLOAK_OAUTH_PROVIDER_ERROR"],
                error_message="KEYCLOAK_OAUTH_PROVIDER_ERROR",
            )
        super().set_user_data(
            {
                "email": email,
                "user": {
                    "provider_id": str(user_info.get("sub")),
                    "email": email,
                    "avatar": user_info.get("picture", ""),
                    "first_name": (
                        user_info.get("given_name")
                        or user_info.get("preferred_username")
                        or user_info.get("name", "")
                    ),
                    "last_name": user_info.get("family_name", ""),
                    "is_password_autoset": True,
                },
            }
        )
