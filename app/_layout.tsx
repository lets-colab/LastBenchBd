import "@/global.css";
import "@/lib/_core/nativewind-pressable";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, View } from "react-native";
import { ThemeProvider } from "@/lib/theme-provider";
import { useFonts } from "expo-font";
import { Anton_400Regular } from "@expo-google-fonts/anton";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import * as SplashScreen from "expo-splash-screen";
import { BenchLoader } from "@/components/bench-loader";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { trpc, createTRPCClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Anton_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const canRender = Platform.OS === "web" || fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (canRender) SplashScreen.hideAsync().catch(() => {});
  }, [canRender]);

  useEffect(() => {
    if (fontError) {
      console.warn("[fonts] Brand fonts unavailable; using system fallbacks.", fontError.message);
    }
  }, [fontError]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  if (!canRender) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0F2A1E", alignItems: "center", justifyContent: "center" }}>
        <BenchLoader />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="tutor/index" />
                <Stack.Screen name="tutor/onboard" />
                <Stack.Screen name="tutor/students" />
                <Stack.Screen name="tutor/commission" />
                <Stack.Screen name="admin/index" />
                <Stack.Screen name="admin/applications" />
                <Stack.Screen name="admin/students" />
                <Stack.Screen name="admin/tutors" />
                <Stack.Screen name="admin/skills" />
                <Stack.Screen name="notifications" />
              </Stack>
              <StatusBar style="auto" />
            </QueryClientProvider>
          </trpc.Provider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
