import type { IUser, UserRole } from "@/models/user.model"
import { murmurHash } from "@/utils/murmurHash"

type UserWithID = Pick<IUser, "roles"> & { id: string };

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;

type FeatureFlagRule = {
    percentageOfUsers?: number
    userRoles?: UserRole[]
} & (
  | { percentageOfUsers: number }
  | { userRoles: UserRole[] }
);

export const FEATURE_FLAGS = {
    IS_USER_ALLOWED: [{ userRoles: ["user"] }],
    GEN_AI: [{ userRoles: ["admin", "tester_genAI"] }],
} as const satisfies Record<string, FeatureFlagRule[] | boolean>;

export const UserAccessibleRoles = [
    "tester_genAI"
] as const satisfies UserRole[];

export function canUseFeature(featureName: FeatureFlagName, user: UserWithID) {
    const rules = FEATURE_FLAGS[featureName];
    if (typeof rules === "boolean") return rules;
    return rules.some(rule => checkRule(rule, featureName, user));
}

function checkRule(
    { userRoles, percentageOfUsers }: FeatureFlagRule,
    featureName: FeatureFlagName,
    user: UserWithID
) {
    return (
        userHasValidRole(userRoles, user.roles) &&
        userIsWithinPercentage(featureName, percentageOfUsers, user.id)
    );
}

function userHasValidRole(
    allowedRoles: UserRole[] | undefined,
    userRoles: UserRole[]
) {
    return allowedRoles == null || userRoles.some(v => allowedRoles.includes(v));
}

const MAX_UINT_32 = 4294967295;
function userIsWithinPercentage(
    featureName: FeatureFlagName,
    allowedPercent: number | undefined,
    flagId: string
) {
    if (allowedPercent == null)
        return true;
    return murmurHash(`${featureName}-${flagId}`) / MAX_UINT_32 < allowedPercent;
}
