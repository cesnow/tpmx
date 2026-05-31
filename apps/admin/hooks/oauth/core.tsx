/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { KeyRound } from "lucide-react";
// types
import type {
  TCoreInstanceAuthenticationModeKeys,
  TGetBaseAuthenticationModeProps,
  TInstanceAuthenticationModes,
} from "@plane/types";
// assets
import keycloakLogo from "@/app/assets/logos/keycloak-logo.svg?url";
// components
import { KeycloakConfiguration } from "@/components/authentication/keycloak-config";
import { PasswordLoginConfiguration } from "@/components/authentication/password-config-switch";

// Authentication methods
export const getCoreAuthenticationModesMap: (
  props: TGetBaseAuthenticationModeProps
) => Record<TCoreInstanceAuthenticationModeKeys, TInstanceAuthenticationModes> = ({ disabled, updateConfig }) => ({
  "passwords-login": {
    key: "passwords-login",
    name: "Passwords",
    description: "Allow members to create accounts with passwords and use it with their email addresses to sign in.",
    icon: <KeyRound className="h-6 w-6 p-0.5 text-tertiary" />,
    config: <PasswordLoginConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "ENABLE_EMAIL_PASSWORD",
  },
  keycloak: {
    key: "keycloak",
    name: "Keycloak",
    description: "Allow members to log in or sign up to plane with their Keycloak accounts.",
    icon: <img src={keycloakLogo} height={20} width={20} alt="Keycloak Logo" />,
    config: <KeycloakConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "IS_KEYCLOAK_ENABLED",
  },
});
