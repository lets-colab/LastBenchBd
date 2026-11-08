import React, { useState } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { CityJourney } from "./city-journey";
import { createCampusJourney } from "@/lib/campus-journey";
import type { CampusViewProps } from "./campus-view";

/**
 * Web uses a legacy external map preview when available. The supported,
 * no-key Google Maps URL is always provided as a fallback action.
 * A university virtual tour is linked only when the university publishes one.
 */
export function CampusView({
  streetView, query, title, shortName = "", location = "", onClose,
}: CampusViewProps) {
  const [mode, setMode] = useState<"campus" | "city">("campus");
  const [linkError, setLinkError] = useState(false);
  const journey = createCampusJourney({ name: title, shortName, location });
  const src = streetView
    ? "https://maps.google.com/maps?layer=c&cbll=" + streetView.lat + "," + streetView.lng + "&cbp=12," + (streetView.heading ?? 0) + ",,0,0&output=svembed"
    : "https://maps.google.com/maps?q=" + encodeURIComponent(query + ", Malaysia") + "&t=k&z=15&output=embed";
  const mapUrl = streetView
    ? "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + streetView.lat + "," + streetView.lng
    : journey.campusMapUrl;
  const open = (url: string) => {
    setLinkError(false);
    void Linking.openURL(url).catch(() => setLinkError(true));
  };

  return (
    <View style={{ borderWidth: 1, borderColor: "rgba(0,200,83,.4)", borderRadius: 16, padding: 12, gap: 13, backgroundColor: "rgba(5,16,10,.85)" }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>{title}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["campus", "city"] as const).map((key) => {
          const selected = mode === key;
          return (
            <TouchableOpacity key={key} accessibilityRole="button" accessibilityState={{ selected }}
              onPress={() => setMode(key)}
              style={{ flex: 1, minHeight: 44, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: selected ? "#00E676" : "rgba(255,255,255,.28)", backgroundColor: selected ? "rgba(0,200,83,.14)" : "transparent", borderRadius: 999 }}>
              <Text style={{ color: selected ? "#00E676" : "#fff", fontWeight: "700", fontSize: 12 }}>
                {key === "campus" ? "Campus" : "City journey"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {mode === "city" ? <CityJourney journey={journey} /> : (
        <View style={{ gap: 12 }}>
          {React.createElement("iframe", {
            src,
            title: title + " external map preview",
            loading: "lazy",
            allow: "accelerometer; gyroscope",
            style: { width: "100%", height: 320, border: 0, borderRadius: 12, display: "block" },
          })}
          <Text style={{ color: "rgba(234,244,236,.75)", fontSize: 12, lineHeight: 19 }}>
            This external map may not show campus interiors or 3D buildings. Imagery and availability vary.
          </Text>
          <TouchableOpacity accessibilityRole="link" onPress={() => open(mapUrl)}
            style={{ backgroundColor: "#00C853", borderRadius: 999, minHeight: 48, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#04140b", fontSize: 13, fontWeight: "800" }}>
              {streetView ? "Open Street View in Maps" : "Open campus in Google Maps"}
            </Text>
          </TouchableOpacity>
          {journey.officialTourUrl && (
            <TouchableOpacity accessibilityRole="link" onPress={() => open(journey.officialTourUrl!)}
              style={{ minHeight: 44, borderWidth: 1, borderColor: "rgba(0,200,83,.5)", borderRadius: 999, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#00E676", fontWeight: "700", fontSize: 12 }}>University-provided virtual campus tour</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {linkError && <Text style={{ color: "#FFCD75", fontSize: 12 }}>The map or tour link could not open. Check your connection.</Text>}
      <TouchableOpacity accessibilityRole="button" onPress={onClose}
        style={{ minHeight: 44, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "rgba(234,244,236,.75)", fontSize: 12, fontWeight: "700" }}>Close explorer</Text>
      </TouchableOpacity>
    </View>
  );
}
