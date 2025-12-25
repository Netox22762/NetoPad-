
import type { Profile } from '../types';

const PROFILE_PREFIX = 'gamepad_profile_';

export const saveProfile = (profile: Profile): void => {
  try {
    localStorage.setItem(PROFILE_PREFIX + profile.name, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save profile:", error);
  }
};

export const loadProfile = (name: string): Profile | null => {
  try {
    const profileJson = localStorage.getItem(PROFILE_PREFIX + name);
    return profileJson ? JSON.parse(profileJson) : null;
  } catch (error) {
    console.error("Failed to load profile:", error);
    return null;
  }
};

export const getProfiles = (): string[] => {
  const profiles: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PROFILE_PREFIX)) {
      profiles.push(key.replace(PROFILE_PREFIX, ''));
    }
  }
  return profiles;
};

export const deleteProfile = (name: string): void => {
  localStorage.removeItem(PROFILE_PREFIX + name);
};
