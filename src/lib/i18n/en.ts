import type { Dictionary } from "./types";

const en: Dictionary = {
  common: {
    allMasjids: "All Masjids",
    getDirections: "Get Directions",
    noMasjidsMatch: "No masjids match your search.",
  },
  nav: {
    home: "Home",
    masjids: "Masjids",
    bookmarks: "Bookmarks",
  },
  prayerLabels: {
    fajr: "Fajr",
    zohar: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  },
  prayerFilterLabels: {
    fajr: "Fajr",
    zohar: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    jummah: "Jumu'ah",
  },
  timingFieldLabels: {
    fajr: "Fajr",
    zohar: "Zohar",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    jummah: "Jumu'ah",
  },
  home: {
    greetingLine1: "Assalamu",
    greetingLine2: "Alaikum",
    tagline: "Find nearby masjids and never miss a Salah.",
    locationBadge: "Lucknow, India",
    locationDenied:
      "Location access was denied — showing masjids unsorted. Enable location to see distances.",
    locationGranted: (place: string) => `Using your location: ${place}`,
    findingArea: "Finding your area…",
    nearbyMasjids: "Nearby Masjids",
    viewAll: "View all",
    nearestPrefix: "Nearest",
  },
  masjidsList: {
    title: "All Masjids",
    sortedByDistance: "Sorted by distance from you",
    enableLocationToSort: "Enable location to sort by distance",
    sortedByNextJamaat: "Sorted by nearest upcoming jamaat",
  },
  sortToggle: {
    sortBy: "Sort by",
    distance: "Distance",
    nextJamaat: "Next Jamaat",
  },
  search: {
    placeholder: "Search masjid near you...",
    toggleAreaFilter: "Toggle area filter",
    allAreas: "All areas",
  },
  staleBanner: {
    message: (label: string | null) =>
      `Couldn't reach the server just now — showing the last data we loaded${
        label ? ` (as of ${label})` : ""
      }. Pull to refresh in a bit.`,
  },
  errorPage: {
    connectionHiccup: "Connection hiccup",
    somethingWrong: "Something went wrong",
    networkDescription:
      "Couldn't reach the database — this usually clears up on its own after a moment (common right after your device reconnects to the internet).",
    genericDescription: "An unexpected error occurred while loading this page.",
    tryAgain: "Try again",
  },
  nextPrayerBanner: {
    nextPrayer: (sourceLabel?: string) => `Next Prayer${sourceLabel ? ` · ${sourceLabel}` : ""}`,
    remaining: (countdown: string) => `${countdown} remaining`,
    qiblaFinder: "Qibla Finder",
  },
  masjidCard: {
    next: (label: string, time: string) => `Next: ${label} ${time}`,
    addBookmark: "Add bookmark",
    removeBookmark: "Remove bookmark",
    getDirections: "Get directions",
  },
  masjidDetail: {
    getDirections: "Get Directions",
    approximateLocation:
      "Location shown is approximate (locality-level), pending exact verification.",
    lastUpdated: (date: string) =>
      `Timings last updated ${date}. Report a correction if you notice an error.`,
  },
  bookmarks: {
    title: "Bookmarks",
    subtitle: "Masjids you've saved",
    empty: "No bookmarks yet. Tap the heart on a masjid card to save it here.",
  },
  profile: {
    title: "Profile",
    placeholder:
      "Accounts aren't part of the MVP yet — this is a placeholder for a future phase (saved preferences, notification settings, etc.).",
  },
  masjidAdmin: {
    loginTitle: "Masjid Admin",
    loginSubtitle: "Sign in to update your masjid's prayer timings.",
    username: "Username",
    password: "Password",
    incorrectCredentials: "Incorrect username or password.",
    signIn: "Sign in",
    signedInAs: "Signed in as",
    logOut: "Log out",
    timingsUpdated: "Timings updated.",
    recentChanges: "Recent changes",
    saveTimings: "Save timings",
  },
  languageSwitcher: {
    label: "Change language",
  },
  footer: {
    credit: "Designed & Developed by",
  },
  pwaInstall: {
    title: "Install Qareeb",
    description: "Add Qareeb to your home screen for quick, one-tap access to prayer timings — no app store needed.",
    installButton: "Install app",
    notNowButton: "Not now",
    iosTitle: "Install Qareeb on your iPhone",
    iosStep1: "Tap the Share icon in Safari's toolbar.",
    iosStep2: "Then choose \"Add to Home Screen\".",
  },
};

export default en;
