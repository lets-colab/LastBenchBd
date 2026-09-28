// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Permanent mobile identity. These identifiers must remain stable after first store release.
const bundleId = "com.lastbenchbd.app";

const env = {
  appName: "Last Bench",
  appSlug: "last-bench-mobile",
  scheme: "lastbench",
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./landing/assets/logo-icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#FAFAF8",
      foregroundImage: "./landing/assets/logo-icon.png",
      monochromeImage: "./landing/assets/logo-icon.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: ["POST_NOTIFICATIONS"],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
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
        image: "./landing/assets/logo-icon.png",
        imageWidth: 320,
        resizeMode: "contain",
        backgroundColor: "#FAFAF8",
        dark: {
          backgroundColor: "#111111",
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
  extra: {
    eas: {
      projectId: "abffbcd3-7fbc-4b73-b519-1fcf5dad4e36",
    },
  },
  experiments: {
    baseUrl: process.env.EXPO_BASE_URL ?? "",
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
