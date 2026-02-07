import { Platform } from 'react-native';

// ── API Base URL Configuration ──
// Priority:
// 1. EXPO_PUBLIC_API_URL env var (set at build time or in .env)
// 2. Platform-specific defaults for local development

const getBaseUrl = () => {
  // Use env var if set (for production builds pointing to Render)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // Local development defaults
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();
