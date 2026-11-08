import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createCampusJourney } from "../lib/campus-journey";

describe("Malaysia campus and city exploration", () => {
  it("uses the official university tour only when a source has been verified", () => {
    const sunway = createCampusJourney({
      name: "Sunway University",
      shortName: "Sunway",
      location: "Subang Jaya, Selangor",
    });
    expect(sunway.officialTourUrl).toBe(
      "https://sunwayuniversity.edu.my/admissions/orientation/campus-tour",
    );

    const unverified = createCampusJourney({
      name: "UCSI University",
      shortName: "UCSI",
      location: "Cheras, Kuala Lumpur",
    });
    expect(unverified.officialTourUrl).toBeNull();
    expect(unverified.campusMapUrl).toContain("api=1");
  });

  it("provides an example Kuala Lumpur airport route without a paid map API", () => {
    const journey = createCampusJourney({
      name: "Taylor's University",
      shortName: "Taylor's",
      location: "Subang Jaya, Selangor",
    });
    expect(journey.officialTourUrl).toBe(
      "https://university.taylors.edu.my/en/student-life/campus-facilities/virtual-campus-tour.html",
    );
    const route = new URL(journey.directionsUrl!);
    expect(route.origin).toBe("https://www.google.com");
    expect(route.searchParams.get("api")).toBe("1");
    expect(route.searchParams.get("origin")).toContain("Kuala Lumpur International Airport");
    expect(route.searchParams.get("destination")).toContain("Taylor's University");
  });

  it("does not route Johor students from a Kuala Lumpur airport", () => {
    const journey = createCampusJourney({
      name: "Universiti Teknologi Malaysia",
      shortName: "UTM",
      location: "Johor Bahru, Johor",
    });
    expect(journey.airportExample).toContain("Senai International Airport");
    expect(new URL(journey.directionsUrl!).searchParams.get("destination")).toContain("Johor Bahru");
  });

  it("does not invent an airport when the source location is outside the supported areas", () => {
    const journey = createCampusJourney({
      name: "Example University",
      shortName: "Example",
      location: "Unknown District",
    });
    expect(journey.airportExample).toBeNull();
    expect(journey.directionsUrl).toBeNull();
    expect(journey.cityMapUrl).toContain("api=1");
  });

  it("constructs searches instead of asserting actual housing or transit availability", () => {
    const journey = createCampusJourney({
      name: "Universiti Malaya",
      shortName: "UM",
      location: "Kuala Lumpur",
    });
    expect(new URL(journey.housingSearchUrl).searchParams.get("query")).toContain("student housing near");
    expect(new URL(journey.transitSearchUrl).searchParams.get("query")).toContain("public transport near");
    expect(new URL(journey.foodSearchUrl).searchParams.get("query")).toContain("food near");
  });

  it("wires campus and city exploration into the existing university route on web and native", () => {
    const screen = readFileSync(resolve("app/(tabs)/universities.tsx"), "utf8");
    const webView = readFileSync(resolve("components/campus-view.web.tsx"), "utf8");
    const nativeView = readFileSync(resolve("components/campus-view.tsx"), "utf8");
    const illustration = readFileSync(resolve("components/city-journey.tsx"), "utf8");

    expect(screen).toContain("Explore campus + city");
    expect(screen).toContain("shortName={uni.shortName}");
    expect(screen).toContain("location={uni.location}");
    expect(webView).toContain("<CityJourney journey={journey} />");
    expect(nativeView).toContain("<CityJourney journey={journey} />");
    expect(illustration).toContain("NOT A LIVE 3D MAP");
    expect(illustration).toContain("not verified housing, safety or transport recommendations");
  });
});
