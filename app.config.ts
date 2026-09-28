// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Preserve installed application identity until both store records are verified.
const bundleId = "com.app.lastbenchmobile";
const easProjectId = process.env.EAS_PROJECT_ID?.trim();
const expoOwner = process.env.EXPO_ACCOUNT_OWNER?.trim();

const config: ExpoConfig = {
  name: "Last Bench",
  slug: "last-bench-mobile",
  version: "1.0.0",
  ...(expoOwner ? { owner: expoOwner } : {}),
  ...(easProjectId ? { extra: { eas: { projectId: easProjectId } } } : {}),
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: ["lastbench", "manuslastbenchmobile"],
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleId,
    "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#D9EFE6",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: bundleId,
    permissions: ["POST_NOTIFICATIONS"],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: false,
        data: [
          {
            scheme: "lastbench",
            host: "*",
          },
          {
            scheme: "manuslastbenchmobile",
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 320,
        resizeMode: "contain",
        backgroundColor: "#D9EFE6",
        dark: {
          backgroundColor: "#0F2A1E",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
        },
      },
    ],
  ],
  experiments: {
    baseUrl: process.env.EXPO_BASE_URL ?? "",
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
