/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext, useState, useEffect, useMemo } from "react";
import { getPossibleUserRoles, getUserRoles, updateUserRoles } from "@/api/user";
import { useAuth } from "./authProvider";

export const FEATURE_FLAGS = [
  "GEN_AI"
] as const;
export type FeatureFlagName = typeof FEATURE_FLAGS[number];
export type FeatureFlagsRecord = Record<FeatureFlagName, boolean>;

const FEATURES_2_ROLES = {
    GEN_AI: "tester_genAI"
} as const satisfies Record<FeatureFlagName, string>;
const defaultFeatures: FeatureFlagsRecord = {
  GEN_AI: false
};

export interface FeatureProviderState {
  /** Features enabled for the User */
  features: FeatureFlagsRecord;
  /** Function to Edit Features for a User */
  setFeatures: (data: Partial<FeatureFlagsRecord>) => Promise<void> | void;
}

const initialState: FeatureProviderState = {
  features: defaultFeatures,
  setFeatures: () => console.error("setFeatures not implemented"),
};

const FeaturesProviderContext = createContext<FeatureProviderState>(initialState);

/**
 * A Context Provider to handle the Feature Flags for the User
 * @param children Children components to the FeaturesProvider
 * @param props Additional props to the FeaturesProvider
 */
export function FeaturesProvider({
  children,
  ...props
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth();
  const [possibleRoles, setPossibleRoles] = useState<string[]>([]);
  const [currentRoles, setCurrentRoles] = useState<string[]>([]);
  const features = useMemo(
    () => roles2features(currentRoles),
    [currentRoles]
  );

  const handleFeaturesEdit = async (data: Partial<FeatureFlagsRecord>) => {
    const roleChanges = features2roleChanges(data, possibleRoles);
    await updateUserRoles(roleChanges);
    setCurrentRoles(await getUserRoles());
    // NOTE: Possible Roles rarely change, when they do, just restart
  };

  const initiateStates = async () => {
    const [possible, current] = await Promise.all([
      getPossibleUserRoles(), getUserRoles()
    ]);
    setPossibleRoles(possible);
    setCurrentRoles(current);
  };
  useEffect(() => {
    if (!user)
      return;

    void initiateStates();
  }, [user]);

  const value: FeatureProviderState = {
    features: features,
    setFeatures: handleFeaturesEdit,
  };

  return (
    <FeaturesProviderContext.Provider {...props} value={value}>
      {children}
    </FeaturesProviderContext.Provider>
  );
}

export const useFeatures = () => {
  const context = useContext(FeaturesProviderContext);
  if (context === undefined)
    throw new Error("useFeatures must be used within an FeatureProvider");
  return context;
};

function roles2features(roles: string[]): FeatureFlagsRecord {
  const result = defaultFeatures;
  for (const [feature, role] of Object.entries(FEATURES_2_ROLES)) {
    result[feature as keyof FeatureFlagsRecord] = roles.includes(role);
  }
  return result;
}

function features2roleChanges(features: Partial<FeatureFlagsRecord>, possibleRoles?: string[]): Record<string, boolean> {
  const roles: Record<string, boolean> = {};
  for (const [feature, role] of Object.entries(FEATURES_2_ROLES)) {
    if ((feature in features) && (!possibleRoles || possibleRoles.includes(role)))
      roles[role] = features[feature as keyof FeatureFlagsRecord]!;
  }
  return roles;
}
