import type { Dictionary } from "./types";

const ur: Dictionary = {
  common: {
    allMasjids: "تمام مساجد",
    getDirections: "راستہ دیکھیں",
    noMasjidsMatch: "آپ کی تلاش سے کوئی مسجد میل نہیں کھاتی۔",
  },
  nav: {
    home: "ہوم",
    masjids: "مساجد",
    bookmarks: "بک مارکس",
  },
  prayerLabels: {
    fajr: "فجر",
    zohar: "ظہر",
    asr: "عصر",
    maghrib: "مغرب",
    isha: "عشاء",
  },
  prayerFilterLabels: {
    fajr: "فجر",
    zohar: "ظہر",
    asr: "عصر",
    maghrib: "مغرب",
    isha: "عشاء",
    jummah: "جمعہ",
  },
  timingFieldLabels: {
    fajr: "فجر",
    zohar: "ظہر",
    asr: "عصر",
    maghrib: "مغرب",
    isha: "عشاء",
    jummah: "جمعہ",
  },
  home: {
    greetingLine1: "السلام",
    greetingLine2: "علیکم",
    tagline: "قریبی مساجد تلاش کریں اور کبھی نماز نہ چھوٹنے دیں۔",
    locationBadge: "لکھنؤ، بھارت",
    locationDenied:
      "لوکیشن تک رسائی نہیں دی گئی — مساجد بغیر ترتیب کے دکھائی جا رہی ہیں۔ فاصلہ دیکھنے کے لیے لوکیشن فعال کریں۔",
    locationGranted: (place: string) => `آپ کی لوکیشن استعمال کی جا رہی ہے: ${place}`,
    findingArea: "آپ کا علاقہ تلاش کیا جا رہا ہے…",
    nearbyMasjids: "قریبی مساجد",
    viewAll: "سب دیکھیں",
    nearestPrefix: "قریب ترین",
  },
  masjidsList: {
    title: "تمام مساجد",
    sortedByDistance: "آپ سے فاصلے کے حساب سے ترتیب دی گئی",
    enableLocationToSort: "فاصلے کے حساب سے ترتیب دیکھنے کے لیے لوکیشن فعال کریں",
    sortedByNextJamaat: "آئندہ جماعت کے حساب سے ترتیب دی گئی",
  },
  sortToggle: {
    sortBy: "ترتیب",
    distance: "فاصلہ",
    nextJamaat: "اگلی جماعت",
  },
  search: {
    placeholder: "اپنے قریب مسجد تلاش کریں...",
    toggleAreaFilter: "علاقہ فلٹر تبدیل کریں",
    allAreas: "تمام علاقے",
  },
  staleBanner: {
    message: (label: string | null) =>
      `سرور سے ابھی رابطہ نہیں ہو سکا — پہلے سے لوڈ شدہ ڈیٹا دکھایا جا رہا ہے${
        label ? ` (${label} تک کا)` : ""
      }۔ تھوڑی دیر میں دوبارہ ریفریش کریں۔`,
  },
  errorPage: {
    connectionHiccup: "کنکشن میں رکاوٹ",
    somethingWrong: "کچھ غلط ہو گیا",
    networkDescription:
      "ڈیٹا بیس سے رابطہ نہیں ہو سکا — یہ عام طور پر تھوڑی دیر میں خود بخود ٹھیک ہو جاتا ہے (اکثر انٹرنیٹ دوبارہ جڑنے کے بعد ہوتا ہے)۔",
    genericDescription: "یہ صفحہ لوڈ کرتے وقت ایک غیر متوقع خرابی پیش آئی۔",
    tryAgain: "دوبارہ کوشش کریں",
  },
  nextPrayerBanner: {
    nextPrayer: (sourceLabel?: string) => `اگلی نماز${sourceLabel ? ` · ${sourceLabel}` : ""}`,
    remaining: (countdown: string) => `${countdown} باقی`,
    qiblaFinder: "قبلہ فائنڈر",
  },
  masjidCard: {
    next: (label: string, time: string) => `اگلی: ${label} ${time}`,
    addBookmark: "بک مارک شامل کریں",
    removeBookmark: "بک مارک ہٹائیں",
    getDirections: "راستہ دیکھیں",
  },
  masjidDetail: {
    getDirections: "راستہ دیکھیں",
    approximateLocation:
      "دکھائی گئی لوکیشن تخمینی ہے (علاقے کی سطح پر)، درست تصدیق باقی ہے۔",
    lastUpdated: (date: string) =>
      `اوقات آخری بار ${date} کو اپڈیٹ ہوئے۔ غلطی نظر آئے تو اطلاع دیں۔`,
  },
  bookmarks: {
    title: "بک مارکس",
    subtitle: "آپ کی محفوظ کردہ مساجد",
    empty: "ابھی تک کوئی بک مارک نہیں ہے۔ یہاں محفوظ کرنے کے لیے مسجد کارڈ پر دل کے نشان کو دبائیں۔",
  },
  profile: {
    title: "پروفائل",
    placeholder:
      "اکاؤنٹس ابھی MVP کا حصہ نہیں ہیں — یہ مستقبل کے مرحلے (محفوظ ترجیحات، نوٹیفیکیشن سیٹنگز وغیرہ) کے لیے ایک جگہ ساز ہے۔",
  },
  masjidAdmin: {
    loginTitle: "مسجد ایڈمن",
    loginSubtitle: "اپنی مسجد کے نماز کے اوقات اپڈیٹ کرنے کے لیے سائن ان کریں۔",
    username: "یوزر نیم",
    password: "پاس ورڈ",
    incorrectCredentials: "یوزر نیم یا پاس ورڈ غلط ہے۔",
    signIn: "سائن ان کریں",
    signedInAs: "بطور سائن ان:",
    logOut: "لاگ آؤٹ",
    timingsUpdated: "اوقات اپڈیٹ ہو گئے۔",
    recentChanges: "حالیہ تبدیلیاں",
    saveTimings: "اوقات محفوظ کریں",
  },
  languageSwitcher: {
    label: "زبان تبدیل کریں",
  },
  footer: {
    credit: "ڈیزائن اور تیار کردہ از",
  },
  pwaInstall: {
    title: "Qareeb انسٹال کریں",
    description: "نماز کے اوقات فوری دیکھنے کے لیے Qareeb کو اپنی ہوم اسکرین پر شامل کریں — ایپ اسٹور کی ضرورت نہیں۔",
    installButton: "ایپ انسٹال کریں",
    notNowButton: "ابھی نہیں",
    iosTitle: "اپنے iPhone پر Qareeb انسٹال کریں",
    iosStep1: "Safari کے ٹول بار میں Share آئیکن پر ٹیپ کریں۔",
    iosStep2: "پھر \"Add to Home Screen\" منتخب کریں۔",
  },
};

export default ur;
