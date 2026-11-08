import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useState } from "react";
import { CityJourney } from "./city-journey";
import { createCampusJourney } from "@/lib/campus-journey";

export interface CampusViewProps {
  // Present only for campuses with verified Street View coordinates.
  streetView?: { lat: number; lng: number; heading?: number };
  // Fallback place query (name + location) for a satellite map.
  query: string;
  title: string;
  shortName?: string;
  location?: string;
  onClose: () => void;
}


/** Native: open provider maps externally; keep city overview offline-safe. */
export function CampusView({
  streetView, query, title, shortName = "", location = "", onClose,
}: CampusViewProps) {
  const [mode, setMode] = useState<"campus" | "city">("campus");
  const [linkError, setLinkError] = useState(false);
  const journey = createCampusJourney({ name: title, shortName, location });
  const mapUrl = streetView
    ? "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + streetView.lat + "," + streetView.lng
    : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query + ", Malaysia");
  const open = (url: string) => {
    setLinkError(false);
    void Linking.openURL(url).catch(() => setLinkError(true));
  };

  return (
    <View style={{ borderWidth: 1, borderColor: "rgba(0,200,83,.4)", borderRadius: 16, padding: 16, gap: 14, backgroundColor: "rgba(5,16,10,.85)" }}>
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{title}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["campus", "city"] as const).map((key) => {
          const selected = mode === key;
          return (
            <TouchableOpacity key={key} accessibilityRole="button" accessibilityState={{ selected }}
              onPress={() => setMode(key)}
              style={{ flex: 1, minHeight: 44, justifyContent: "center", alignItems: "center", borderRadius: 999, borderWidth: 1, borderColor: selected ? "#00E676" : "rgba(255,255,255,.28)", backgroundColor: selected ? "rgba(0,200,83,.14)" : "transparent" }}>
              <Text style={{ color: selected ? "#00E676" : "#fff", fontWeight: "700", fontSize: 12 }}>
                {key === "campus" ? "Campus" : "City journey"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {mode === "city" ? <CityJourney journey={journey} /> : (
        <View style={{ gap: 12 }}>
          <Text style={{ color: "rgba(234,244,236,.75)", fontSize: 12, lineHeight: 18 }}>
            {streetView
              ? "Open an available 360° street panorama. Interior campus coverage is not guaranteed."
              : "See the campus location and surrounding area. Map imagery and coverage can vary."}
          </Text>
          <TouchableOpacity accessibilityRole="link" onPress={() => open(mapUrl)}
            style={{ backgroundColor: "#00C853", borderRadius: 999, minHeight: 48, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#04140b", fontWeight: "800", fontSize: 13 }}>
              {streetView ? "Open Street View in Maps" : "Open campus in Google Maps"}
            </Text>
          </TouchableOpacity>
          {journey.officialTourUrl && (
            <TouchableOpacity accessibilityRole="link" onPress={() => open(journey.officialTourUrl!)}
              style={{ borderWidth: 1, borderColor: "rgba(0,200,83,.5)", borderRadius: 999, minHeight: 44, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#00E676", fontWeight: "700", fontSize: 12 }}>University-provided virtual campus tour</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {linkError && <Text style={{ color: "#FFCD75", fontSize: 12 }}>The map or tour link could not open. Check your connection.</Text>}
      <TouchableOpacity accessibilityRole="button" onPress={onClose} style={{ alignItems: "center", justifyContent: "center", minHeight: 44 }}>
        <Text style={{ color: "rgba(234,244,236,.75)", fontWeight: "700", fontSize: 12 }}>Close explorer</Text>
      </TouchableOpacity>
    </View>
  );
}
