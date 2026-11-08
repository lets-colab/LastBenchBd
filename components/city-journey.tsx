import { useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path, Polygon } from "react-native-svg";
import type { CampusJourneyLinks } from "@/lib/campus-journey";

const COLOR = {
  green: "#00C853",
  bright: "#00E676",
  white: "#F2F7F3",
  muted: "rgba(234,244,236,.75)",
  border: "rgba(0,200,83,.32)",
};

export function CityJourney({ journey }: { journey: CampusJourneyLinks }) {
  const [linkError, setLinkError] = useState(false);
  const open = (url: string) => {
    setLinkError(false);
    void Linking.openURL(url).catch(() => setLinkError(true));
  };

  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 6 }}>
        <Text style={{ color: COLOR.white, fontSize: 19, fontWeight: "800" }}>
          From arrival to campus
        </Text>
        <Text style={{ color: COLOR.muted, fontSize: 12, lineHeight: 19 }}>
          Explore the city before making a decision. The perspective scene is an illustration,
          not a geographic model or live traffic route.
        </Text>
      </View>

      <View
        importantForAccessibility="no-hide-descendants"
        style={{
          backgroundColor: "#071B11",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: COLOR.border,
          overflow: "hidden",
        }}
      >
        <Svg width="100%" height={184} viewBox="0 0 340 184">
          <Polygon
            points="16,114 151,38 327,117 189,183"
            fill="#123321"
            stroke="#276B46"
            strokeWidth={2}
          />
          <Path
            d="M 35 117 L 170 43 M 84 145 L 222 70 M 143 168 L 279 99"
            fill="none"
            stroke="#1E4E35"
            strokeWidth={1.5}
          />
          <Path
            d="M 98 77 L 265 158 M 68 100 L 235 179"
            fill="none"
            stroke="#1E4E35"
            strokeWidth={1.5}
          />
          <Polygon points="86,95 111,81 135,93 111,108" fill="#4A9168" />
          <Polygon points="86,95 111,108 111,132 86,120" fill="#25553D" />
          <Polygon points="111,108 135,93 135,117 111,132" fill="#2E6A49" />
          <Polygon points="177,70 211,51 244,68 209,87" fill="#62AA7C" />
          <Polygon points="177,70 209,87 209,132 177,114" fill="#2C6145" />
          <Polygon points="209,87 244,68 244,112 209,132" fill="#397B53" />
          <Polygon points="249,111 272,98 299,113 275,127" fill="#64A880" />
          <Polygon points="249,111 275,127 275,154 249,139" fill="#2B6247" />
          <Polygon points="275,127 299,113 299,140 275,154" fill="#3B7F57" />
          <Path
            d="M 54 119 Q 139 169 170 124 T 280 125"
            fill="none"
            stroke="#00E676"
            strokeWidth={4}
            strokeDasharray="7 7"
          />
          <Circle cx={54} cy={119} r={7} fill="#F2F7F3" stroke="#00C853" strokeWidth={3} />
          <Circle cx={169} cy={124} r={7} fill="#F2F7F3" stroke="#00C853" strokeWidth={3} />
          <Circle cx={280} cy={125} r={7} fill="#F2F7F3" stroke="#00C853" strokeWidth={3} />
        </Svg>
      </View>
      <Text style={{ color: COLOR.muted, fontSize: 10, letterSpacing: 1.1, fontWeight: "700" }}>
        ILLUSTRATIVE CITY JOURNEY · NOT A LIVE 3D MAP
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[
          ["START", journey.airportExample ?? "Airport to confirm"],
          ["EXPLORE", journey.cityQuery],
          ["ARRIVE", journey.campusQuery],
        ].map(([label, value]) => (
          <View
            key={label}
            style={{
              flexGrow: 1,
              flexBasis: 100,
              minWidth: 90,
              padding: 10,
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,.04)",
            }}
          >
            <Text style={{ color: COLOR.bright, fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>
              {label}
            </Text>
            <Text style={{ color: COLOR.white, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
              {value}
            </Text>
          </View>
        ))}
      </View>

      <Text style={{ color: COLOR.muted, fontSize: 12, lineHeight: 18 }}>
        {journey.airportExample
          ? "The airport is a sample starting point. Check your actual flight, campus entrance and transport options."
          : "Choose your actual arrival airport before checking directions."}
      </Text>

      {journey.directionsUrl ? (
        <TouchableOpacity
          accessibilityRole="link"
          onPress={() => open(journey.directionsUrl!)}
          style={{ backgroundColor: COLOR.green, borderRadius: 999, minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 }}
        >
          <Text style={{ color: "#04140B", fontSize: 13, fontWeight: "800" }}>
            Check real route in Google Maps
          </Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        accessibilityRole="link"
        onPress={() => open(journey.cityMapUrl)}
        style={{ minHeight: 44, borderRadius: 999, borderWidth: 1, borderColor: COLOR.border, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: COLOR.bright, fontSize: 13, fontWeight: "700" }}>Explore the city map</Text>
      </TouchableOpacity>

      <View style={{ gap: 8 }}>
        <Text style={{ color: COLOR.white, fontSize: 14, fontWeight: "700" }}>
          Research the surroundings
        </Text>
        <Text style={{ color: COLOR.muted, fontSize: 11, lineHeight: 17 }}>
          These searches are starting points, not verified housing, safety or transport recommendations.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[
            ["Student housing", journey.housingSearchUrl],
            ["Public transport", journey.transitSearchUrl],
            ["Food nearby", journey.foodSearchUrl],
          ].map(([label, url]) => (
            <TouchableOpacity
              key={label}
              accessibilityRole="link"
              onPress={() => open(url)}
              style={{
                borderWidth: 1,
                borderColor: "rgba(255,255,255,.28)",
                borderRadius: 999,
                paddingHorizontal: 13,
                minHeight: 44,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: COLOR.white, fontSize: 12, fontWeight: "600" }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {linkError && (
        <Text accessibilityRole="alert" style={{ color: "#FFCD75", fontSize: 12 }}>
          The map link could not open. Check browser permissions or your connection.
        </Text>
      )}
    </View>
  );
}
