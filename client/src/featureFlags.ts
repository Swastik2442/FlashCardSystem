import type { TFeaturesEditFormSchema } from "@/types/forms";

const ROLES_2_FEATURES = {
    "genAI": "tester_genAI"
} as const;

export function roles2features(roles: string[], possibleRoles?: string[]): TFeaturesEditFormSchema {
  const result: TFeaturesEditFormSchema = {};
  for (const [feature, role] of Object.entries(ROLES_2_FEATURES)) {
    if (!possibleRoles || possibleRoles.includes(role))
      result[feature as keyof TFeaturesEditFormSchema] = roles.includes(role);
  }
  return result;
}

export function features2roleChanges(features: TFeaturesEditFormSchema, possibleRoles?: string[]): Record<string, boolean> {
  const roles: Record<string, boolean> = {};
  for (const [feature, role] of Object.entries(ROLES_2_FEATURES)) {
    if ((feature in features) && (!possibleRoles || possibleRoles.includes(role)))
      roles[role] = features[feature as keyof TFeaturesEditFormSchema]!;
  }
  return roles;
}
