import {
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  type ImageSourcePropType,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { BenchLoader } from "@/components/bench-loader";

type GuideKey = "sayem" | "fahim" | "erfan";

type FounderProfile = {
  name: string;
  title: string;
  alias?: string;
  duty: string;
  placeholder: string;
  portrait: ImageSourcePropType;
};

// Real Last Bench founders. Dr. X powers the interaction layer; these are not AI identities.
// Server-side prompts enforce the same non-impersonation and evidence boundary.
const GUIDES: Record<GuideKey, FounderProfile> = {
  sayem: {
    name: "Sayem Ahmed",
    title: "Co-founder & CEO",
    duty: "Vision, academic partnerships, public trust, and the overall Last Bench promise.",
    placeholder: "Ask about Sayem Ahmed’s Last Bench role or your journey…",
    portrait: require("../../assets/founders/sayem-ahmed.jpg"),
  },
  fahim: {
    name: "Fahim Shahbaz Mahmud",
    title: "Co-founder & COO",
    duty: "Operations, delivery, quality, compliance, sales execution, and repeatability.",
    placeholder: "Ask about Fahim’s operating role or what to research next…",
    portrait: require("../../assets/founders/fahim-shahbaz-mahmud.jpg"),
  },
  erfan: {
    name: "Erfan Uddin",
    title: "Co-founder & CBIO",
    alias: "Also known as Dr. X",
    duty: "Business, brand, innovation, growth, product ecosystem, and systems design.",
    placeholder: "Ask about Erfan Uddin, Dr. X, systems, or your next step…",
    portrait: require("../../assets/founders/erfan-uddin.jpg"),
  },
};

const CINE = {
  bg: "#04140B",
  panel: "rgba(5,16,10,.7)",
  border: "rgba(0,200,83,.25)",
  borderActive: "#00E676",
  green: "#00C853",
  brightGreen: "#00E676",
  amber: "#FFB300",
  text: "#EAF4EC",
  dim: "rgba(234,244,236,.6)",
};

export default function FounderProfilesScreen() {
  const { user } = useAuth();
  // Deep-link handoff remains backward-compatible with the existing guide key.
  const params = useLocalSearchParams<{ guide?: string; q?: string }>();
  const [activeGuide, setActiveGuide] = useState<GuideKey>("sayem");
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (params.guide === "sayem" || params.guide === "fahim" || params.guide === "erfan") {
      setActiveGuide(params.guide);
    }
    if (params.q) setDraft(String(params.q));
  }, [params.guide, params.q]);

  const historyQuery = trpc.aiGuidance.getChatHistory.useQuery(
    { guide: activeGuide },
    { enabled: !!user },
  );
  const chatMutation = trpc.aiGuidance.chat.useMutation();

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [historyQuery.data, chatMutation.isPending]);

  if (!user) {
    return (
      <ScreenContainer className="p-6 justify-center items-center">
        <Text className="text-xl font-bold text-foreground">Please sign in to continue</Text>
      </ScreenContainer>
    );
  }

  const guide = GUIDES[activeGuide];
  const messages = historyQuery.data || [];

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || chatMutation.isPending) return;
    setSendError(null);
    setDraft("");
    try {
      await chatMutation.mutateAsync({ message: text, guide: activeGuide });
      await historyQuery.refetch();
    } catch {
      setDraft(text);
      setSendError("Dr. X could not respond. Check your connection and try again.");
    }
  };

  return (
    <ScreenContainer className="p-0" style={{ backgroundColor: CINE.bg }}>
      <View className="px-6 pt-8 pb-4 gap-1">
        <Text
          style={{ fontFamily: "Anton_400Regular", letterSpacing: 1 }}
          className="text-3xl text-white"
        >
          MEET THE FOUNDERS.
        </Text>
        <Text style={{ color: CINE.dim }} className="text-sm leading-relaxed">
          Real Last Bench founder profiles with interactive guidance powered by Dr. X.
          Generated replies are not direct statements from a founder unless explicitly verified.
        </Text>
      </View>

      {/* Human-first founder selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
      >
        {(Object.keys(GUIDES) as GuideKey[]).map((key) => {
          const g = GUIDES[key];
          const active = key === activeGuide;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveGuide(key)}
              className="rounded-2xl p-3 gap-2"
              style={{
                width: 184,
                backgroundColor: active ? "rgba(0,200,83,.12)" : CINE.panel,
                borderWidth: 1,
                borderColor: active ? CINE.borderActive : CINE.border,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Open ${g.name} profile`}
              accessibilityState={{ selected: active }}
            >
              <View className="flex-row items-center gap-3">
                <Image
                  source={g.portrait}
                  accessibilityLabel={`${g.name} approved founder portrait`}
                  style={{ width: 44, height: 44, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <View className="flex-1 gap-0.5">
                  <Text className="text-white font-bold text-xs" numberOfLines={2}>
                    {g.name}
                  </Text>
                  <Text style={{ color: CINE.dim }} className="text-[9px]" numberOfLines={1}>
                    {g.title}
                  </Text>
                </View>
              </View>
              {g.alias ? (
                <Text
                  style={{ color: CINE.text, letterSpacing: 0.7 }}
                  className="text-[9px] font-semibold"
                >
                  {g.alias}
                </Text>
              ) : null}
              <Text
                style={{ color: CINE.brightGreen, letterSpacing: 1 }}
                className="text-[8px] font-bold"
              >
                POWERED BY DR. X
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected real-person profile */}
      <View className="px-6 pb-4">
        <View
          className="rounded-2xl p-4 flex-row gap-4 items-center"
          style={{ backgroundColor: CINE.panel, borderWidth: 1, borderColor: CINE.border }}
        >
          <Image
            source={guide.portrait}
            accessibilityLabel={`${guide.name} approved founder portrait`}
            style={{ width: 68, height: 68, borderRadius: 16 }}
            resizeMode="cover"
          />
          <View className="flex-1 gap-1">
            <Text style={{ color: CINE.text }} className="text-base font-bold">
              {guide.name}
            </Text>
            <Text style={{ color: CINE.brightGreen }} className="text-xs font-semibold">
              {guide.title}
            </Text>
            {guide.alias ? (
              <Text style={{ color: CINE.text }} className="text-xs font-semibold">
                {guide.alias}
              </Text>
            ) : null}
            <Text style={{ color: CINE.dim }} className="text-xs leading-relaxed">
              {guide.duty}
            </Text>
            <Text
              style={{ color: "rgba(0,230,118,.76)", letterSpacing: 1 }}
              className="text-[9px] font-bold"
            >
              INTERACTIVE PROFILE · POWERED BY DR. X
            </Text>
          </View>
        </View>
      </View>

      {/* Dr. X conversation scoped to the selected founder profile */}
      <View
        className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden"
        style={{ borderWidth: 1, borderColor: CINE.border, backgroundColor: CINE.panel }}
      >
        {historyQuery.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <BenchLoader />
          </View>
        ) : historyQuery.isError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text style={{ color: CINE.text }} className="text-base font-bold text-center">
              Dr. X is unavailable
            </Text>
            <Text style={{ color: CINE.dim }} className="text-sm text-center">
              We could not load this conversation. Check your connection and try again.
            </Text>
            <TouchableOpacity
              onPress={() => void historyQuery.refetch()}
              className="rounded-full px-5 py-3"
              style={{ backgroundColor: CINE.green }}
            >
              <Text style={{ color: "#04140b" }} className="font-bold text-sm">
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerStyle={{ padding: 16, gap: 12 }}
          >
            {messages.length === 0 && (
              <Text style={{ color: CINE.dim }} className="text-sm text-center py-8">
                Ask about {guide.name}&apos;s approved Last Bench role or the guidance available
                in this profile. Verify high-stakes details with official sources or a human.
              </Text>
            )}
            {messages.map((m) => {
              const isYou = m.role === "user";
              return (
                <View
                  key={m.id}
                  style={{ alignSelf: isYou ? "flex-end" : "flex-start", maxWidth: "82%", gap: 4 }}
                >
                  <Text
                    style={{
                      color: "rgba(234,244,236,.4)",
                      letterSpacing: 1.5,
                      alignSelf: isYou ? "flex-end" : "flex-start",
                    }}
                    className="text-[8px] font-bold"
                  >
                    {isYou ? "YOU" : `DR. X · ${guide.name.toUpperCase()} PROFILE`}
                  </Text>
                  <View
                    className="rounded-2xl px-4 py-3"
                    style={{
                      backgroundColor: isYou ? CINE.green : "rgba(255,255,255,.05)",
                      borderWidth: 1,
                      borderColor: isYou ? CINE.green : CINE.border,
                    }}
                  >
                    <Text
                      style={{ color: isYou ? "#04140b" : "rgba(234,244,236,.9)" }}
                      className="text-sm leading-relaxed"
                    >
                      {m.content}
                    </Text>
                  </View>
                </View>
              );
            })}
            {chatMutation.isPending && (
              <View style={{ alignSelf: "flex-start" }}>
                <View
                  className="rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,.05)",
                    borderWidth: 1,
                    borderColor: CINE.border,
                  }}
                >
                  <Text
                    style={{ color: CINE.brightGreen, letterSpacing: 4 }}
                    className="text-sm"
                  >
                    •••
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {sendError && (
          <View className="px-4 pt-3">
            <Text style={{ color: "#FFB74D" }} className="text-xs">
              {sendError}
            </Text>
          </View>
        )}
        <View
          className="flex-row items-center gap-2 px-4 py-3"
          style={{ borderTopWidth: 1, borderTopColor: CINE.border }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={guide.placeholder}
            placeholderTextColor="rgba(234,244,236,.38)"
            editable={!chatMutation.isPending}
            onSubmitEditing={handleSend}
            className="flex-1 rounded-full px-4 py-3 text-white text-sm"
            style={{
              backgroundColor: "rgba(255,255,255,.06)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,.16)",
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!draft.trim() || chatMutation.isPending}
            className="rounded-full px-5 py-3"
            style={{
              backgroundColor:
                draft.trim() && !chatMutation.isPending
                  ? CINE.green
                  : "rgba(255,255,255,.1)",
            }}
          >
            <Text
              style={{
                color: draft.trim() && !chatMutation.isPending ? "#04140b" : CINE.dim,
              }}
              className="font-bold text-sm"
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
