/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// plane imports
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@plane/constants";
import type { TOAuthConfigs, TOAuthOption } from "@plane/types";
// assets
import keycloakLogo from "@/app/assets/logos/keycloak-logo.svg?url";
// hooks
import { useInstance } from "@/hooks/store/use-instance";

export const useCoreOAuthConfig = (oauthActionText: string): TOAuthConfigs => {
  //router
  const searchParams = useSearchParams();
  // query params
  const next_path = searchParams.get("next_path");
  // store hooks
  const { config } = useInstance();
  // derived values
  const isOAuthEnabled = (config && config?.is_keycloak_enabled) || false;
  const oAuthOptions: TOAuthOption[] = [
    {
      id: "keycloak",
      text: `${oauthActionText} with Keycloak`,
      icon: <img src={keycloakLogo} height={18} width={18} alt="Keycloak Logo" />,
      onClick: () => {
        window.location.assign(`${API_BASE_URL}/auth/keycloak/${next_path ? `?next_path=${next_path}` : ``}`);
      },
      enabled: config?.is_keycloak_enabled,
    },
  ];

  return {
    isOAuthEnabled,
    oAuthOptions,
  };
};
