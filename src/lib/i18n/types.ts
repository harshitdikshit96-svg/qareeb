export type Locale = "en" | "hi" | "ur";

export type PrayerKey = "fajr" | "zohar" | "asr" | "maghrib" | "isha";
export type PrayerFilterKey = PrayerKey | "jummah";

export interface Dictionary {
  common: {
    allMasjids: string;
    getDirections: string;
    noMasjidsMatch: string;
  };
  nav: {
    home: string;
    masjids: string;
    bookmarks: string;
  };
  prayerLabels: Record<PrayerKey, string>;
  prayerFilterLabels: Record<PrayerFilterKey, string>;
  timingFieldLabels: Record<PrayerFilterKey, string>;
  home: {
    greetingLine1: string;
    greetingLine2: string;
    tagline: string;
    locationBadge: string;
    locationDenied: string;
    locationGranted: (place: string) => string;
    findingArea: string;
    nearbyMasjids: string;
    viewAll: string;
    nearestPrefix: string;
  };
  masjidsList: {
    title: string;
    sortedByDistance: string;
    enableLocationToSort: string;
    sortedByNextJamaat: string;
  };
  sortToggle: {
    sortBy: string;
    distance: string;
    nextJamaat: string;
  };
  search: {
    placeholder: string;
    toggleAreaFilter: string;
    allAreas: string;
  };
  staleBanner: {
    message: (label: string | null) => string;
  };
  errorPage: {
    connectionHiccup: string;
    somethingWrong: string;
    networkDescription: string;
    genericDescription: string;
    tryAgain: string;
  };
  nextPrayerBanner: {
    nextPrayer: (sourceLabel?: string) => string;
    remaining: (countdown: string) => string;
    qiblaFinder: string;
  };
  masjidCard: {
    next: (label: string, time: string) => string;
    addBookmark: string;
    removeBookmark: string;
    getDirections: string;
  };
  masjidDetail: {
    getDirections: string;
    approximateLocation: string;
    lastUpdated: (date: string) => string;
  };
  bookmarks: {
    title: string;
    subtitle: string;
    empty: string;
  };
  profile: {
    title: string;
    placeholder: string;
  };
  masjidAdmin: {
    loginTitle: string;
    loginSubtitle: string;
    username: string;
    password: string;
    incorrectCredentials: string;
    signIn: string;
    signedInAs: string;
    logOut: string;
    timingsUpdated: string;
    recentChanges: string;
    saveTimings: string;
  };
  languageSwitcher: {
    label: string;
  };
  footer: {
    credit: string;
  };
  pwaInstall: {
    title: string;
    description: string;
    installButton: string;
    notNowButton: string;
    iosTitle: string;
    iosStep1: string;
    iosStep2: string;
  };
}
