import type { Dictionary } from "./types";

const hi: Dictionary = {
  common: {
    allMasjids: "सभी मस्जिदें",
    getDirections: "रास्ता देखें",
    noMasjidsMatch: "आपकी खोज से कोई मस्जिद मेल नहीं खाती।",
  },
  nav: {
    home: "होम",
    masjids: "मस्जिदें",
    bookmarks: "बुकमार्क",
  },
  prayerLabels: {
    fajr: "फ़ज्र",
    zohar: "ज़ुहर",
    asr: "अस्र",
    maghrib: "मग़रिब",
    isha: "इशा",
  },
  prayerFilterLabels: {
    fajr: "फ़ज्र",
    zohar: "ज़ुहर",
    asr: "अस्र",
    maghrib: "मग़रिब",
    isha: "इशा",
    jummah: "जुमा",
  },
  timingFieldLabels: {
    fajr: "फ़ज्र",
    zohar: "ज़ोहर",
    asr: "अस्र",
    maghrib: "मग़रिब",
    isha: "इशा",
    jummah: "जुमा",
  },
  home: {
    greetingLine1: "अस्सलामु",
    greetingLine2: "अलैकुम",
    tagline: "आस-पास की मस्जिदें खोजें और कभी नमाज़ न छूटने दें।",
    locationBadge: "लखनऊ, भारत",
    locationDenied:
      "लोकेशन एक्सेस नहीं दिया गया — मस्जिदें बिना क्रम के दिखाई जा रही हैं। दूरी देखने के लिए लोकेशन चालू करें।",
    locationGranted: (place: string) => `आपकी लोकेशन का उपयोग: ${place}`,
    findingArea: "आपका इलाका ढूँढा जा रहा है…",
    nearbyMasjids: "आस-पास की मस्जिदें",
    viewAll: "सभी देखें",
    nearestPrefix: "निकटतम",
  },
  masjidsList: {
    title: "सभी मस्जिदें",
    sortedByDistance: "आपसे दूरी के अनुसार क्रमबद्ध",
    enableLocationToSort: "दूरी के अनुसार क्रम देखने के लिए लोकेशन चालू करें",
    sortedByNextJamaat: "आगामी जमात के अनुसार क्रमबद्ध",
  },
  sortToggle: {
    sortBy: "क्रम",
    distance: "दूरी",
    nextJamaat: "अगली जमात",
  },
  search: {
    placeholder: "अपने पास की मस्जिद खोजें...",
    toggleAreaFilter: "इलाका फ़िल्टर टॉगल करें",
    allAreas: "सभी इलाके",
  },
  staleBanner: {
    message: (label: string | null) =>
      `सर्वर से अभी संपर्क नहीं हो सका — पहले से लोड किया डेटा दिखाया जा रहा है${
        label ? ` (${label} तक का)` : ""
      }। कुछ देर में फिर से रीफ़्रेश करें।`,
  },
  errorPage: {
    connectionHiccup: "कनेक्शन में रुकावट",
    somethingWrong: "कुछ गड़बड़ हो गई",
    networkDescription:
      "डेटाबेस से संपर्क नहीं हो सका — यह आमतौर पर कुछ ही देर में अपने आप ठीक हो जाता है (आमतौर पर इंटरनेट दोबारा जुड़ने के बाद होता है)।",
    genericDescription: "यह पेज लोड करते समय एक अनपेक्षित त्रुटि हुई।",
    tryAgain: "फिर कोशिश करें",
  },
  nextPrayerBanner: {
    nextPrayer: (sourceLabel?: string) => `अगली नमाज़${sourceLabel ? ` · ${sourceLabel}` : ""}`,
    remaining: (countdown: string) => `${countdown} शेष`,
    qiblaFinder: "क़िबला फ़ाइंडर",
  },
  masjidCard: {
    next: (label: string, time: string) => `अगली: ${label} ${time}`,
    addBookmark: "बुकमार्क जोड़ें",
    removeBookmark: "बुकमार्क हटाएं",
    getDirections: "रास्ता देखें",
  },
  masjidDetail: {
    getDirections: "रास्ता देखें",
    approximateLocation:
      "दिखाई गई लोकेशन अनुमानित है (इलाका-स्तर), सटीक पुष्टि होना बाकी है।",
    lastUpdated: (date: string) =>
      `समय अंतिम बार ${date} को अपडेट किया गया। किसी त्रुटि की सूचना दें।`,
  },
  bookmarks: {
    title: "बुकमार्क",
    subtitle: "आपकी सहेजी गई मस्जिदें",
    empty: "अभी तक कोई बुकमार्क नहीं है। यहाँ सहेजने के लिए मस्जिद कार्ड पर दिल के निशान को दबाएं।",
  },
  profile: {
    title: "प्रोफ़ाइल",
    placeholder:
      "अकाउंट अभी MVP का हिस्सा नहीं हैं — यह भविष्य के चरण (सहेजी गई प्राथमिकताएं, नोटिफ़िकेशन सेटिंग्स आदि) के लिए एक प्लेसहोल्डर है।",
  },
  masjidAdmin: {
    loginTitle: "मस्जिद एडमिन",
    loginSubtitle: "अपनी मस्जिद की नमाज़ के समय अपडेट करने के लिए साइन इन करें।",
    username: "यूज़रनेम",
    password: "पासवर्ड",
    incorrectCredentials: "यूज़रनेम या पासवर्ड गलत है।",
    signIn: "साइन इन करें",
    signedInAs: "इस रूप में साइन इन:",
    logOut: "लॉग आउट",
    timingsUpdated: "समय अपडेट हो गए।",
    recentChanges: "हाल के बदलाव",
    saveTimings: "समय सहेजें",
  },
  languageSwitcher: {
    label: "भाषा बदलें",
  },
  footer: {
    credit: "डिज़ाइन और विकसित किया गया",
  },
  pwaInstall: {
    title: "Qareeb इंस्टॉल करें",
    description: "नमाज़ के समय तुरंत देखने के लिए Qareeb को अपनी होम स्क्रीन पर जोड़ें — ऐप स्टोर की ज़रूरत नहीं।",
    installButton: "ऐप इंस्टॉल करें",
    notNowButton: "अभी नहीं",
    iosTitle: "अपने iPhone पर Qareeb इंस्टॉल करें",
    iosStep1: "Safari के टूलबार में Share आइकन पर टैप करें।",
    iosStep2: "फिर \"Add to Home Screen\" चुनें।",
  },
};

export default hi;
