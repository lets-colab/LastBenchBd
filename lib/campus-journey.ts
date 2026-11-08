/**
 * Student Mobility explorer links. Google Maps URLs are supported without an
 * API key. These are search/directions requests, not evidence of a live route,
 * travel time, campus entrance or local service availability.
 *
 * University tour links are drawn only from university-owned public pages.
 * Do not add partner labels or inferred virtual tours here.
 */
export interface CampusJourneyInput {
  name: string;
  shortName: string;
  location: string;
}

export interface CampusJourneyLinks {
  campusQuery: string;
  cityQuery: string;
  airportExample: string | null;
  officialTourUrl: string | null;
  campusMapUrl: string;
  cityMapUrl: string;
  directionsUrl: string | null;
  housingSearchUrl: string;
  transitSearchUrl: string;
  foodSearchUrl: string;
}

const OFFICIAL_TOURS: Readonly<Record<string, string>> = {
  Sunway: "https://sunwayuniversity.edu.my/admissions/orientation/campus-tour",
  "Taylor's": "https://university.taylors.edu.my/en/student-life/campus-facilities/virtual-campus-tour.html",
};

const MAPS_ORIGIN = "https://www.google.com/maps";
const mapsSearch = (query: string) =>
  MAPS_ORIGIN + "/search/?api=1&query=" + encodeURIComponent(query);

function airportExampleFor(location: string): string | null {
  if (/Johor Bahru|Johor/i.test(location)) {
    return "Senai International Airport, Johor, Malaysia";
  }
  if (/Kuala Lumpur|Selangor|Bangi|Serdang|Cyberjaya|Subang Jaya|Petaling Jaya|Shah Alam|Cheras/i.test(location)) {
    return "Kuala Lumpur International Airport, Sepang, Malaysia";
  }
  return null;
}

export function createCampusJourney({
  name,
  shortName,
  location,
}: CampusJourneyInput): CampusJourneyLinks {
  const campusQuery = [name, location, "Malaysia"].filter(Boolean).join(", ");
  const cityQuery = [location, "Malaysia"].filter(Boolean).join(", ");
  const airportExample = airportExampleFor(location);
  const directionsUrl = airportExample
    ? MAPS_ORIGIN + "/dir/?api=1&origin=" +
      encodeURIComponent(airportExample) +
      "&destination=" + encodeURIComponent(campusQuery)
    : null;

  return {
    campusQuery,
    cityQuery,
    airportExample,
    officialTourUrl: OFFICIAL_TOURS[shortName] ?? null,
    campusMapUrl: mapsSearch(campusQuery),
    cityMapUrl: mapsSearch(cityQuery),
    directionsUrl,
    housingSearchUrl: mapsSearch("student housing near " + campusQuery),
    transitSearchUrl: mapsSearch("public transport near " + campusQuery),
    foodSearchUrl: mapsSearch("food near " + campusQuery),
  };
}
