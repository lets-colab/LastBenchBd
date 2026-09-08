import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";

function toCachedUser(user: NonNullable<Awaited<ReturnType<typeof Api.getMe>>>): Auth.User {
  return {
    id: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    role: user.role,
    lastSignedIn: new Date(user.lastSignedIn),
  };
}

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "sign-in") {
        const user = await Api.signIn(email.trim(), password);
        await Auth.setUserInfo(toCachedUser(user));
        router.replace("/(tabs)");
        return;
      }

      const result = await Api.signUp(email.trim(), password, name.trim());
      if (result.requiresEmailConfirmation) {
        setMessage("Check your email to confirm your account, then return here and sign in.");
        setMode("sign-in");
        return;
      }

      if (result.user) {
        await Auth.setUserInfo(toCachedUser(result.user));
        router.replace("/onboarding");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 justify-center px-6 py-10">
          <View className="mx-auto w-full max-w-md">
            <Text className="text-sm font-semibold uppercase tracking-[3px] text-primary">
              LAST BENCH
            </Text>
            <Text className="mt-3 text-4xl font-bold leading-tight text-foreground">
              {mode === "sign-in" ? "Welcome back." : "Start your journey."}
            </Text>
            <Text className="mt-3 text-base leading-6 text-muted-foreground">
              {mode === "sign-in"
                ? "Sign in to your student accelerator workspace."
                : "Create your Last Bench account. Your identity is secured by Supabase Auth."}
            </Text>

            <View className="mt-8 gap-4">
              {mode === "create" && (
                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Full name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    autoComplete="name"
                    placeholder="Your name"
                    placeholderTextColor="#6B6F76"
                    className="h-14 rounded-2xl border border-border bg-card px-4 text-base text-foreground"
                  />
                </View>
              )}

              <View>
                <Text className="mb-2 text-sm font-medium text-foreground">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  placeholder="you@example.com"
                  placeholderTextColor="#6B6F76"
                  className="h-14 rounded-2xl border border-border bg-card px-4 text-base text-foreground"
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-foreground">Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#6B6F76"
                  className="h-14 rounded-2xl border border-border bg-card px-4 text-base text-foreground"
                />
              </View>
            </View>

            {error && (
              <View className="mt-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3">
                <Text className="text-sm leading-5 text-error">{error}</Text>
              </View>
            )}

            {message && (
              <View className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
                <Text className="text-sm leading-5 text-foreground">{message}</Text>
              </View>
            )}

            <Pressable
              onPress={submit}
              disabled={busy}
              className={`mt-6 h-14 items-center justify-center rounded-2xl bg-primary ${busy ? "opacity-60" : ""}`}
            >
              <Text className="text-base font-bold text-primary-foreground">
                {busy ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMode(mode === "sign-in" ? "create" : "sign-in");
                setError(null);
                setMessage(null);
              }}
              disabled={busy}
              className="mt-4 items-center py-3"
            >
              <Text className="text-sm font-medium text-muted-foreground">
                {mode === "sign-in"
                  ? "New to Last Bench? Create an account"
                  : "Already have an account? Sign in"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
