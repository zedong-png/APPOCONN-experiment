import watch01 from '../../image/Watch/split/watch_01.jpg';
import watch02 from '../../image/Watch/split/watch_02.jpg';
import watch03 from '../../image/Watch/split/watch_03.jpg';
import watch04 from '../../image/Watch/split/watch_04.jpg';
import watch05 from '../../image/Watch/split/watch_05.jpg';
import watch06 from '../../image/Watch/split/watch_06.jpg';
import watch07 from '../../image/Watch/split/watch_07.jpg';
import watch08 from '../../image/Watch/split/watch_08.jpg';
import watch09 from '../../image/Watch/split/watch_09.jpg';
import bp3001 from '../../image/BloodPressureMonitor_BP30/split/bp30_01.jpg';
import bp3002 from '../../image/BloodPressureMonitor_BP30/split/bp30_02.jpg';
import bp3003 from '../../image/BloodPressureMonitor_BP30/split/bp30_03.jpg';
import bp3004 from '../../image/BloodPressureMonitor_BP30/split/bp30_04.jpg';
import bp3005 from '../../image/BloodPressureMonitor_BP30/split/bp30_05.jpg';
import bp3006 from '../../image/BloodPressureMonitor_BP30/split/bp30_06.jpg';
import k601 from '../../image/KidsWatch_K6/split/k6_01.jpg';
import k602 from '../../image/KidsWatch_K6/split/k6_02.jpg';
import k603 from '../../image/KidsWatch_K6/split/k6_03.jpg';
import k604 from '../../image/KidsWatch_K6/split/k6_04.jpg';
import k605 from '../../image/KidsWatch_K6/split/k6_05.jpg';
import k606 from '../../image/KidsWatch_K6/split/k6_06.jpg';
import bs1001 from '../../image/BodyScale_BS10/split/bs10_01.jpg';
import bs1002 from '../../image/BodyScale_BS10/split/bs10_02.jpg';
import bs1003 from '../../image/BodyScale_BS10/split/bs10_03.jpg';
import bs1004 from '../../image/BodyScale_BS10/split/bs10_04.jpg';
import bs1005 from '../../image/BodyScale_BS10/split/bs10_05.jpg';
import bs1006 from '../../image/BodyScale_BS10/split/bs10_06.jpg';
import se20001 from '../../image/EnvSensor_SE200/split/se200_01.jpg';
import se20002 from '../../image/EnvSensor_SE200/split/se200_02.jpg';
import se20003 from '../../image/EnvSensor_SE200/split/se200_03.jpg';
import se20004 from '../../image/EnvSensor_SE200/split/se200_04.jpg';
import se20005 from '../../image/EnvSensor_SE200/split/se200_05.jpg';
import se20006 from '../../image/EnvSensor_SE200/split/se200_06.jpg';
import dl01 from '../../image/SmartDoorLock_DL/split/dl_01.jpg';
import dl02 from '../../image/SmartDoorLock_DL/split/dl_02.jpg';
import dl03 from '../../image/SmartDoorLock_DL/split/dl_03.jpg';
import dl04 from '../../image/SmartDoorLock_DL/split/dl_04.jpg';
import dl05 from '../../image/SmartDoorLock_DL/split/dl_05.jpg';
import dl06 from '../../image/SmartDoorLock_DL/split/dl_06.jpg';
import db01 from '../../image/VideoDoorbell_DB/split/db_01.jpg';
import db02 from '../../image/VideoDoorbell_DB/split/db_02.jpg';
import db03 from '../../image/VideoDoorbell_DB/split/db_03.jpg';
import db04 from '../../image/VideoDoorbell_DB/split/db_04.jpg';
import db05 from '../../image/VideoDoorbell_DB/split/db_05.jpg';
import db06 from '../../image/VideoDoorbell_DB/split/db_06.jpg';
import rv01 from '../../image/RobotVacuum_RV/split/rv_01.jpg';
import rv02 from '../../image/RobotVacuum_RV/split/rv_02.jpg';
import rv03 from '../../image/RobotVacuum_RV/split/rv_03.jpg';
import rv04 from '../../image/RobotVacuum_RV/split/rv_04.jpg';
import rv05 from '../../image/RobotVacuum_RV/split/rv_05.jpg';
import rv06 from '../../image/RobotVacuum_RV/split/rv_06.jpg';

const buildPlaceholderImage = (title: string, accent: string, subtitle: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F8FAFC" />
          <stop offset="100%" stop-color="#E5E7EB" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="48" fill="url(#bg)" />
      <circle cx="980" cy="170" r="180" fill="${accent}" fill-opacity="0.10" />
      <circle cx="180" cy="760" r="220" fill="${accent}" fill-opacity="0.08" />
      <rect x="96" y="96" width="1008" height="708" rx="36" fill="white" stroke="#D7DEE7" stroke-width="3" stroke-dasharray="16 16" />
      <rect x="156" y="156" width="240" height="34" rx="17" fill="${accent}" fill-opacity="0.12" />
      <text x="156" y="278" fill="#0F172A" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700">${title}</text>
      <text x="156" y="338" fill="#475569" font-family="Arial, Helvetica, sans-serif" font-size="30">${subtitle}</text>
      <text x="156" y="716" fill="#94A3B8" font-family="Arial, Helvetica, sans-serif" font-size="28">Image placeholder for upcoming AI-generated product visuals</text>
      <rect x="156" y="560" width="320" height="96" rx="24" fill="${accent}" fill-opacity="0.10" />
      <text x="186" y="618" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700">Pending Render</text>
      <path d="M840 300h120c44.2 0 80 35.8 80 80v140c0 44.2-35.8 80-80 80H840c-44.2 0-80-35.8-80-80V380c0-44.2 35.8-80 80-80Z" stroke="${accent}" stroke-width="16" fill="none"/>
      <path d="M816 436h168" stroke="${accent}" stroke-width="16" stroke-linecap="round"/>
      <path d="M900 352v168" stroke="${accent}" stroke-width="16" stroke-linecap="round"/>
    </svg>
  `)}`;


export interface ProductVariant {
  id: string;
  name: string;
  options: {
    [key: string]: string[];
  };
}

export interface Product {
  id: string;
  name: string;
  seriesCode?: string;
  tagline: string;
  description: string;
  longDescription: string;
  image: string;
  gallery?: string[];
  selectionImageMap?: Record<string, string>;
  category: string;
  sampleModels?: string[];
  customizationOptions?: string[];
  variants: {
    label: string;
    options: {
      id: string;
      label: string;
      value: string;
      image?: string;
      color?: string;
    }[];
  }[];
  specs: {
    label: string;
    value: string;
  }[];
}

export const products: Product[] = [
  {
    id: "smart-watch-s1",
    name: "Smart Watch OEM Series",
    seriesCode: "SW Series",
    tagline: "Daily-use smartwatch platforms for private label consumer electronics programs",
    description: "A smartwatch series for retail and channel customers who need a stable wearable platform with flexible case, strap, UI, and packaging customization.",
    longDescription: "The Smart Watch OEM Series is built around reusable wearable platforms for mass-market consumer channels. Instead of presenting a single retail SKU, this series page focuses on the common hardware architecture, configurable cosmetic options, and branding scope available for OEM and ODM projects.",
    image: watch01,
    gallery: [watch01, watch02, watch03, watch04, watch05, watch06, watch07, watch08, watch09],
    selectionImageMap: {
      "Case Color=Black|Strap=Silicone": watch01,
      "Case Color=Black|Strap=Nylon": watch02,
      "Case Color=Black|Strap=Magnetic": watch06,
      "Case Color=Silver|Strap=Silicone": watch03,
      "Case Color=Silver|Strap=Nylon": watch04,
      "Case Color=Silver|Strap=Magnetic": watch03,
      "Case Color=Rose Gold|Strap=Silicone": watch05,
      "Case Color=Rose Gold|Strap=Nylon": watch08,
      "Case Color=Rose Gold|Strap=Magnetic": watch07
    },
    category: "Smart Wearables",
    sampleModels: ["S1 Bluetooth Calling", "S1 Lite Fitness", "S1 Rose Gold Edition"],
    customizationOptions: ["Case and strap matching", "Watch face and UI branding", "Gift box, manual, and carton artwork"],
    variants: [
      {
        label: "Case Color",
        options: [
          { id: "black", label: "Matte Black", value: "Black", color: "#1A1A1A", image: watch01 },
          { id: "silver", label: "Silver", value: "Silver", color: "#C0C0C0", image: watch03 },
          { id: "rose", label: "Rose Gold", value: "Rose Gold", color: "#D8A39D", image: watch05 }
        ]
      },
      {
        label: "Strap",
        options: [
          { id: "silicone", label: "Silicone Strap", value: "Silicone", image: watch01 },
          { id: "nylon", label: "Nylon Strap", value: "Nylon", image: watch02 },
          { id: "magnetic", label: "Magnetic Strap", value: "Magnetic", image: watch06 }
        ]
      }
    ],
    specs: [
      { label: "Display Range", value: "1.75 to 1.91-inch mainstream TFT or AMOLED options" },
      { label: "Core Functions", value: "Heart rate, sleep, activity tracking, Bluetooth calling" },
      { label: "Connectivity", value: "Bluetooth 5.x platform options" },
      { label: "Cosmetic Options", value: "Case finish, strap material, charging accessories" },
      { label: "OEM Scope", value: "Logo, packaging, watch faces, app language and manuals" }
    ]
  },
  {
    id: "bp-monitor-bp30",
    name: "Blood Pressure Monitor OEM Series",
    seriesCode: "BP Series",
    tagline: "Upper-arm monitor platforms for pharmacy, retail, and home health programs",
    description: "A blood pressure monitor series covering standalone and Bluetooth-enabled configurations for practical private label healthcare projects.",
    longDescription: "The Blood Pressure Monitor OEM Series is positioned as a reusable home-health product family rather than a single medical device SKU. It emphasizes stable core architecture, cuff and power configuration choices, and retail-ready packaging options that are common in OEM healthcare projects.",
    image: bp3001,
    gallery: [bp3001, bp3002, bp3003, bp3004, bp3005, bp3006],
    selectionImageMap: {
      "Connectivity=Standalone|Power Option=Battery": bp3001,
      "Connectivity=Bluetooth|Power Option=Battery": bp3005,
      "Connectivity=Standalone|Power Option=USB-C + Battery": bp3003,
      "Connectivity=Bluetooth|Power Option=USB-C + Battery": bp3005
    },
    category: "Home Health",
    sampleModels: ["BP-30 Standalone", "BP-30 Bluetooth", "BP-30 USB-C Edition"],
    customizationOptions: ["Retail color box and inserts", "Button language and LCD label set", "App pairing and memory configuration"],
    variants: [
      {
        label: "Power Option",
        options: [
          { id: "battery", label: "Battery Only", value: "Battery", image: bp3001 },
          { id: "usb", label: "USB-C + Battery", value: "USB-C + Battery", image: bp3003 }
        ]
      },
      {
        label: "Connectivity",
        options: [
          { id: "standalone", label: "Standalone", value: "Standalone", image: bp3001 },
          { id: "bluetooth", label: "Bluetooth Sync", value: "Bluetooth", image: bp3005 }
        ]
      }
    ],
    specs: [
      { label: "Platform Type", value: "Upper-arm digital monitor platform" },
      { label: "Display", value: "Large LCD with configurable icons and language set" },
      { label: "Power Options", value: "AA battery or USB-C + battery hybrid solutions" },
      { label: "Connectivity", value: "Standalone or Bluetooth sync versions" },
      { label: "OEM Scope", value: "Packaging, manuals, labeling, and app sync workflow" }
    ]
  },
  {
    id: "kids-watch-k6",
    name: "Kids Smart Watch OEM Series",
    seriesCode: "K Series",
    tagline: "Connected kids wearable platforms for operator, retail, and school channels",
    description: "A kids smartwatch series with voice calling, positioning, class mode, and cosmetic customization for family safety product lines.",
    longDescription: "The Kids Smart Watch OEM Series packages common 4G and Wi-Fi wearable functions into a configurable product family. The focus is on adaptable housing colors, region-specific communication features, and the software localization work typically required by OEM customers.",
    image: k601,
    gallery: [k601, k602, k603, k604, k605, k606],
    selectionImageMap: {
      "Housing Color=Blue|Network=4G LTE": k601,
      "Housing Color=Green|Network=4G LTE": k602,
      "Housing Color=Pink|Network=4G LTE": k603,
      "Housing Color=Blue|Network=4G + Wi-Fi": k606,
      "Housing Color=Green|Network=4G + Wi-Fi": k605,
      "Housing Color=Pink|Network=4G + Wi-Fi": k604
    },
    category: "Smart Wearables",
    sampleModels: ["K6 4G Standard", "K6 4G + Wi-Fi", "K6 Regional School Edition"],
    customizationOptions: ["Housing color selection", "App language and geofence settings", "Packaging, manuals, and accessory kits"],
    variants: [
      {
        label: "Network",
        options: [
          { id: "4g", label: "4G LTE", value: "4G LTE", image: k601 },
          { id: "4g-wifi", label: "4G + Wi-Fi", value: "4G + Wi-Fi", image: k606 }
        ]
      },
      {
        label: "Housing Color",
        options: [
          { id: "blue", label: "Blue", value: "Blue", color: "#2563EB", image: k601 },
          { id: "pink", label: "Pink", value: "Pink", color: "#EC4899", image: k603 },
          { id: "green", label: "Green", value: "Green", color: "#10B981", image: k602 }
        ]
      }
    ],
    specs: [
      { label: "Connectivity", value: "4G, Wi-Fi, GPS and LBS platform options" },
      { label: "Core Functions", value: "Calling, SOS, geofence, class mode, voice messaging" },
      { label: "Battery Range", value: "Typical 680 to 800 mAh program options" },
      { label: "Channel Fit", value: "Family safety retail, school programs, regional telecom bundles" },
      { label: "OEM Scope", value: "UI language, app workflow, housing color and packaging" }
    ]
  },
  {
    id: "body-scale-bs10",
    name: "Smart Body Scale OEM Series",
    seriesCode: "BS Series",
    tagline: "Smart scale platforms for wellness, fitness, and pharmacy channels",
    description: "A body scale series with white and black glass variants, app connectivity options, and family-account support for private label programs.",
    longDescription: "The Smart Body Scale OEM Series is positioned as a flexible wellness hardware family for brands that need a dependable connected scale platform. This page presents the series as a configurable program, with cosmetic, app, and account-function choices instead of a single finished retail SKU.",
    image: bs1001,
    gallery: [bs1001, bs1002, bs1003, bs1004, bs1005, bs1006],
    selectionImageMap: {
      "App Support=OEM App|Glass Color=White": bs1001,
      "App Support=SDK|Glass Color=White": bs1003,
      "App Support=OEM App|Glass Color=Black": bs1004,
      "App Support=SDK|Glass Color=Black": bs1002
    },
    category: "Home Health",
    sampleModels: ["BS-10 White OEM App", "BS-10 Black SDK Access", "BS-10 Family Profile Bundle"],
    customizationOptions: ["Glass color and logo print", "OEM app or SDK integration", "Packaging and quick-start materials"],
    variants: [
      {
        label: "Glass Color",
        options: [
          { id: "white", label: "White", value: "White", color: "#F3F4F6", image: bs1001 },
          { id: "black", label: "Black", value: "Black", color: "#111827", image: bs1002 }
        ]
      },
      {
        label: "App Support",
        options: [
          { id: "oem-app", label: "OEM App", value: "OEM App", image: bs1001 },
          { id: "sdk", label: "SDK Access", value: "SDK", image: bs1002 }
        ]
      }
    ],
    specs: [
      { label: "Capacity", value: "Mainstream household scale platform up to 180 kg" },
      { label: "Display", value: "Hidden LED display and touch-ready glass options" },
      { label: "Connectivity", value: "Bluetooth-based mobile app integration" },
      { label: "Account Support", value: "Family profiles and shared device use cases" },
      { label: "OEM Scope", value: "App branding, logo print, insert card, and packaging" }
    ]
  },
  {
    id: "env-se-200",
    name: "Environmental Sensor OEM Series",
    seriesCode: "SE Series",
    tagline: "Indoor environment sensor platforms for smart home bundles and gateways",
    description: "A compact sensor series covering battery and USB-C power modes, plus Zigbee or Matter-based smart home integration options.",
    longDescription: "The Environmental Sensor OEM Series is framed as a modular smart home product family for white-label bundles and channel projects. The emphasis is on connectivity choice, enclosure consistency, and deployment scenarios rather than on a single standalone retail model.",
    image: se20001,
    gallery: [se20001, se20002, se20003, se20004, se20005, se20006],
    selectionImageMap: {
      "Connectivity=Zigbee|Power=Battery": se20005,
      "Connectivity=Matter|Power=Battery": se20002,
      "Connectivity=Zigbee|Power=USB-C": se20006,
      "Connectivity=Matter|Power=USB-C": se20006
    },
    category: "Smart Home",
    sampleModels: ["SE-200 Battery Basic", "SE-200 Matter Ready", "SE-200 USB-C Fixed Install"],
    customizationOptions: ["Protocol selection", "Labeling and enclosure branding", "Bundle packaging with gateway or accessories"],
    variants: [
      {
        label: "Connectivity",
        options: [
          { id: "zigbee", label: "Zigbee 3.0", value: "Zigbee", image: se20005 },
          { id: "matter", label: "Matter over Thread", value: "Matter", image: se20002 }
        ]
      },
      {
        label: "Power",
        options: [
          { id: "battery", label: "Battery Powered", value: "Battery", image: se20001 },
          { id: "usb", label: "USB-C Powered", value: "USB-C", image: se20006 }
        ]
      }
    ],
    specs: [
      { label: "Sensing Scope", value: "Air quality, humidity, light, and indoor environment monitoring" },
      { label: "Connectivity", value: "Zigbee or Matter-based program options" },
      { label: "Power", value: "Battery-powered deployment or USB-C fixed install" },
      { label: "Bundle Fit", value: "Smart home kits, gateway bundles, and installer channels" },
      { label: "OEM Scope", value: "Branding label, protocol mix, packaging and documentation" }
    ]
  },
  {
    id: "smart-door-lock-dl-series",
    name: "Smart Door Lock OEM Series",
    seriesCode: "DL Series",
    tagline: "Connected access platforms for apartment, rental, and smart home channels",
    description: "A door lock series for keypad, fingerprint, app-unlock, and gateway-connected access projects.",
    longDescription: "The Smart Door Lock OEM Series is structured as a reusable connected-access platform for residential and light commercial projects. It focuses on front-panel options, credential methods, and lock-body combinations that can be reused across OEM customer programs.",
    image: dl01,
    gallery: [dl01, dl02, dl03, dl04, dl05, dl06],
    selectionImageMap: {
      "Credential Method=Fingerprint + PIN|Finish=Matte Black": dl01,
      "Credential Method=PIN Only|Finish=Matte Black": dl04,
      "Credential Method=App + Gateway|Finish=Matte Black": dl03,
      "Credential Method=Fingerprint + PIN|Finish=Silver": dl02,
      "Credential Method=PIN Only|Finish=Silver": dl02,
      "Credential Method=App + Gateway|Finish=Silver": dl03
    },
    category: "Connected Access",
    sampleModels: ["DL-10 Rental Lock", "DL-20 Fingerprint Edition", "DL-30 Gateway Bundle"],
    customizationOptions: ["Front panel finish and keypad layout", "App onboarding and access workflow", "Carton, manual, and installation kit branding"],
    variants: [
      {
        label: "Credential Method",
        options: [
          { id: "lock-fingerprint", label: "Fingerprint + PIN", value: "Fingerprint + PIN", image: dl01 },
          { id: "lock-pin", label: "PIN Only", value: "PIN Only", image: dl04 },
          { id: "lock-app", label: "App + Gateway", value: "App + Gateway", image: dl03 }
        ]
      },
      {
        label: "Finish",
        options: [
          { id: "lock-black", label: "Matte Black", value: "Matte Black", color: "#1F2937", image: dl01 },
          { id: "lock-silver", label: "Silver", value: "Silver", color: "#CBD5E1", image: dl02 }
        ]
      }
    ],
    specs: [
      { label: "Application", value: "Apartment, rental, townhouse, and smart home access" },
      { label: "Access Options", value: "PIN, fingerprint, card, app, and gateway-ready combinations" },
      { label: "Lock Body", value: "Different latch and mortise program options" },
      { label: "Connectivity", value: "Standalone, Bluetooth, or gateway-connected versions" },
      { label: "OEM Scope", value: "Industrial finish, packaging, manuals, and access workflow branding" }
    ]
  },
  {
    id: "video-doorbell-db-series",
    name: "Video Doorbell OEM Series",
    seriesCode: "DB Series",
    tagline: "Entry monitoring platforms for smart home and security distribution channels",
    description: "A video doorbell series with battery or wired deployment options, app alerts, and two-way communication workflows.",
    longDescription: "The Video Doorbell OEM Series is designed for brands building entry-monitoring and home-security lines. It presents the platform as a configurable family covering power, chime integration, and app experience rather than as a single fixed retail doorbell SKU.",
    image: db01,
    gallery: [db01, db02, db03, db04, db05, db06],
    selectionImageMap: {
      "Power Mode=Battery|Chime Bundle=Standard Chime": db02,
      "Power Mode=Wired|Chime Bundle=Standard Chime": db03,
      "Power Mode=Battery|Chime Bundle=Wi-Fi Chime": db04,
      "Power Mode=Wired|Chime Bundle=Wi-Fi Chime": db04
    },
    category: "Smart Home",
    sampleModels: ["DB-01 Battery Doorbell", "DB-02 Wired Doorbell", "DB-03 Wi-Fi Chime Bundle"],
    customizationOptions: ["Faceplate color and logo placement", "App alert flow and pairing screen", "Retail box, quick guide, and chime bundle options"],
    variants: [
      {
        label: "Power Mode",
        options: [
          { id: "doorbell-battery", label: "Battery", value: "Battery", image: db02 },
          { id: "doorbell-wired", label: "Wired", value: "Wired", image: db03 }
        ]
      },
      {
        label: "Chime Bundle",
        options: [
          { id: "doorbell-standard", label: "Standard Chime", value: "Standard Chime", image: db01 },
          { id: "doorbell-wifi", label: "Wi-Fi Chime", value: "Wi-Fi Chime", image: db04 }
        ]
      }
    ],
    specs: [
      { label: "Platform Type", value: "Connected video doorbell platform" },
      { label: "Power Options", value: "Battery-powered or wired install versions" },
      { label: "Core Functions", value: "Live view, two-way talk, motion alerts, app notification" },
      { label: "Bundle Scope", value: "Doorbell only or chime bundle retail packaging" },
      { label: "OEM Scope", value: "Housing color, app screens, manual set, and packaging artwork" }
    ]
  },
  {
    id: "robot-vacuum-rv-series",
    name: "Robot Vacuum OEM Series",
    seriesCode: "RV Series",
    tagline: "Automated cleaning platforms for appliance and smart home retail programs",
    description: "A robot vacuum series for dry cleaning, dock charging, app scheduling, and mid-range home appliance OEM programs.",
    longDescription: "The Robot Vacuum OEM Series is aimed at brands that need a broadly reusable automated-cleaning platform. The series approach focuses on dock combinations, housing colors, and app-level workflow adaptations before any customer-specific cosmetic or package work begins.",
    image: rv01,
    gallery: [rv01, rv02, rv03, rv04, rv05, rv06],
    selectionImageMap: {
      "Dock Type=Charging Dock|Finish=White": rv03,
      "Dock Type=Charging Dock|Finish=Black": rv01,
      "Dock Type=Self-Empty Dock|Finish=White": rv04,
      "Dock Type=Self-Empty Dock|Finish=Black": rv04
    },
    category: "Home Appliances",
    sampleModels: ["RV-01 Dry Clean", "RV-02 App Schedule", "RV-03 Self-Empty Bundle"],
    customizationOptions: ["Top cover finish and logo badge", "App schedule and room naming workflow", "Master carton, accessory set, and dock bundle"],
    variants: [
      {
        label: "Dock Type",
        options: [
          { id: "vacuum-charge", label: "Charging Dock", value: "Charging Dock", image: rv03 },
          { id: "vacuum-empty", label: "Self-Empty Dock", value: "Self-Empty Dock", image: rv04 }
        ]
      },
      {
        label: "Finish",
        options: [
          { id: "vacuum-white", label: "White", value: "White", color: "#F8FAFC", image: rv03 },
          { id: "vacuum-black", label: "Black", value: "Black", color: "#1F2937", image: rv01 }
        ]
      }
    ],
    specs: [
      { label: "Product Type", value: "Robot vacuum platform for home cleaning" },
      { label: "Deployment", value: "Standalone dock or higher-value dock bundle versions" },
      { label: "Core Functions", value: "Auto clean, return to dock, app scheduling, map-ready variants" },
      { label: "Channel Fit", value: "Appliance retail, marketplace, and smart home bundles" },
      { label: "OEM Scope", value: "Housing finish, package set, accessory mix, and app workflow" }
    ]
  }
];
