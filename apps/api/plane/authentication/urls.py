# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.urls import path

from .views import (
    CSRFTokenEndpoint,
    ForgotPasswordEndpoint,
    SetUserPasswordEndpoint,
    ResetPasswordEndpoint,
    ChangePasswordEndpoint,
    # App
    EmailCheckEndpoint,
    SignInAuthEndpoint,
    SignOutAuthEndpoint,
    SignUpAuthEndpoint,
    ForgotPasswordSpaceEndpoint,
    ResetPasswordSpaceEndpoint,
    # Space
    EmailCheckSpaceEndpoint,
    SignInAuthSpaceEndpoint,
    SignUpAuthSpaceEndpoint,
    SignOutAuthSpaceEndpoint,
    KeycloakCallbackEndpoint,
    KeycloakOauthInitiateEndpoint,
    KeycloakCallbackSpaceEndpoint,
    KeycloakOauthInitiateSpaceEndpoint,
)

urlpatterns = [
    # credentials
    path("sign-in/", SignInAuthEndpoint.as_view(), name="sign-in"),
    path("sign-up/", SignUpAuthEndpoint.as_view(), name="sign-up"),
    path("spaces/sign-in/", SignInAuthSpaceEndpoint.as_view(), name="space-sign-in"),
    path("spaces/sign-up/", SignUpAuthSpaceEndpoint.as_view(), name="space-sign-up"),
    # signout
    path("sign-out/", SignOutAuthEndpoint.as_view(), name="sign-out"),
    path("spaces/sign-out/", SignOutAuthSpaceEndpoint.as_view(), name="space-sign-out"),
    # csrf token
    path("get-csrf-token/", CSRFTokenEndpoint.as_view(), name="get_csrf_token"),
    # Email Check
    path("email-check/", EmailCheckEndpoint.as_view(), name="email-check"),
    path("spaces/email-check/", EmailCheckSpaceEndpoint.as_view(), name="email-check"),
    # Password
    path("forgot-password/", ForgotPasswordEndpoint.as_view(), name="forgot-password"),
    path(
        "reset-password/<uidb64>/<token>/",
        ResetPasswordEndpoint.as_view(),
        name="forgot-password",
    ),
    path(
        "spaces/forgot-password/",
        ForgotPasswordSpaceEndpoint.as_view(),
        name="space-forgot-password",
    ),
    path(
        "spaces/reset-password/<uidb64>/<token>/",
        ResetPasswordSpaceEndpoint.as_view(),
        name="space-forgot-password",
    ),
    path("change-password/", ChangePasswordEndpoint.as_view(), name="forgot-password"),
    path("set-password/", SetUserPasswordEndpoint.as_view(), name="set-password"),
    ## Keycloak Oauth
    path("keycloak/", KeycloakOauthInitiateEndpoint.as_view(), name="keycloak-initiate"),
    path("keycloak/callback/", KeycloakCallbackEndpoint.as_view(), name="keycloak-callback"),
    path(
        "spaces/keycloak/",
        KeycloakOauthInitiateSpaceEndpoint.as_view(),
        name="space-keycloak-initiate",
    ),
    path(
        "spaces/keycloak/callback/",
        KeycloakCallbackSpaceEndpoint.as_view(),
        name="space-keycloak-callback",
    ),
]
