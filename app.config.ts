import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Copango",
  slug: "copango",
  scheme: "copango",
  version: "1.1.0",
  owner: "anthonyo197",
  orientation: "portrait",
  userInterfaceStyle: "light",
  description: "Healthcare Staff Portal - Communication and task management for healthcare teams",
  icon: "./assets/icon2.png",
  splash: {
    image: "./assets/splash2.png",
    resizeMode: "contain",
    backgroundColor: "#0A4D2C",
    hideExpoLoadingScreen: true
  },
  assetBundlePatterns: [
    "assets/**"
  ],
  platforms: [
    "ios",
    "android", 
    "web"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.copango.app",
    buildNumber: "10",
    icon: "./assets/icon2.png",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCalendarsUsageDescription: "This app may access calendar data to help schedule healthcare tasks and appointments for staff coordination.",
      NSContactsUsageDescription: "This app may access contacts to help healthcare staff communicate and coordinate with team members.",
      NSCameraUsageDescription: "This app may access the camera to capture photos for healthcare documentation and requests.",
      NSPhotoLibraryUsageDescription: "This app may access photos to attach images to healthcare requests and documentation.",
      NSMicrophoneUsageDescription: "This app may access the microphone for voice recordings related to healthcare documentation.",
      NSLocationWhenInUseUsageDescription: "This app may access location to help track staff locations for emergency coordination and task assignment.",
      NSNotificationsUsageDescription: "This app sends notifications to keep healthcare staff informed about urgent requests and updates."
    }
  },
  android: {
    package: "com.copango.app",
    versionCode: 2
  },
  web: {
    bundler: "metro"
  },
  jsEngine: "hermes",
  plugins: [
    [
      "expo-asset",
      {
        include: [
          "assets/**"
        ]
      }
    ],
    "expo-splash-screen",
    "expo-video",
    "expo-web-browser"
  ],
  extra: {
    eas: {
      projectId: "32734474-88ac-4f72-a12a-19bbd471a7a1"
    }
  }
});