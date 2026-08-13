export type SourceType = "OEM" | "Community consensus" | "Individual experience";

export type CatalogSource = {
  type: SourceType;
  title: string;
  publisher: string;
  url: string;
  note: string;
};

export type CatalogPart = {
  name: string;
  partNumber: string | null;
  note: string;
  purchaseUrl?: string;
};

export type MaintenanceCatalogItem = {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  severity: "critical" | "important" | "routine";
  oem: {
    mileage: number | null;
    months: number | null;
    label: string;
    summary: string;
  };
  community: {
    mileage: number | null;
    months: number | null;
    label: string;
    summary: string;
  };
  parts: CatalogPart[];
  sources: CatalogSource[];
  diy: string[];
};

export const PLATFORM = {
  slug: "bmw-e90-335i-n54",
  yearStart: 2007,
  yearEnd: 2010,
  make: "BMW",
  model: "3 Series",
  trim: "335i",
  engine: "N54 3.0L twin-turbo I6",
  transmission: "6-speed automatic / 6-speed manual",
};

export const MAINTENANCE_CATALOG: MaintenanceCatalogItem[] = [
  {
    slug: "engine-oil-filter",
    name: "Engine oil & filter",
    shortName: "Oil & filter",
    category: "Engine",
    description:
      "The N54 runs hot and places substantial demand on its oil. Track both elapsed mileage and time, and verify that the oil carries the approval appropriate to your market and model year.",
    severity: "critical",
    oem: {
      mileage: 16200,
      months: 24,
      label: "CBS · approx. 16,200 mi",
      summary:
        "BMW's 2008 service schedule uses Condition Based Service. The model-year service bulletin illustrates the first engine-oil service at approximately 16,200 miles; the car's CBS display remains the controlling source.",
    },
    community: {
      mileage: 5000,
      months: 6,
      label: "5,000 mi / 6 mo",
      summary:
        "A conservative enthusiast baseline for an older, turbocharged N54 is 5,000 miles or six months, especially with short trips, spirited use, or tuning.",
    },
    parts: [
      {
        name: "Oil filter element set",
        partNumber: "11 42 7 953 129",
        note: "Current BMW supersession; verify by VIN before ordering.",
        purchaseUrl:
          "https://www.realoem.com/bmw/enUS/partxref?q=11427953129",
      },
      {
        name: "BMW-approved full-synthetic oil",
        partNumber: null,
        note: "Select viscosity and approval for climate, market, and current BMW guidance.",
      },
      {
        name: "Drain plug sealing ring",
        partNumber: null,
        note: "Replace at each service; verify pan and plug type by VIN.",
      },
    ],
    sources: [
      {
        type: "OEM",
        title: "2008 Model Year New Vehicle Preparation and Maintenance Requirements",
        publisher: "BMW of North America · SIB 00 01 07",
        url: "https://bmwrepairguide.com/sib/000107.pdf",
        note: "Model-year bulletin showing CBS-linked service operations and approximate mileage counters.",
      },
      {
        type: "OEM",
        title: "Where to find recommended BMW maintenance information",
        publisher: "BMW USA",
        url: "https://faq.bmwusa.com/s/article/FAQ-Maintenance-Booklet-BMW-USA-OVdVg",
        note: "BMW directs owners to the Maintenance Service Display and vehicle maintenance booklet.",
      },
      {
        type: "Community consensus",
        title: "Engine Maintenance Hub",
        publisher: "FCP Euro",
        url: "https://info.fcpeuro.com/enginehub",
        note: "Independent European-car specialist guidance; used as a community layer, not OEM policy.",
      },
    ],
    diy: [
      "Warm the engine, then allow enough time for the exhaust and oil to cool to a safe working temperature.",
      "Confirm the filter-cap and drain-plug torque specifications against current BMW service information.",
      "After filling, run the engine, check for leaks, and confirm the electronic oil-level reading on level ground.",
    ],
  },
  {
    slug: "spark-plugs",
    name: "Spark plugs",
    shortName: "Spark plugs",
    category: "Ignition",
    description:
      "Worn plugs can produce misfires under boost and increase stress on the ignition system. Tuned cars commonly need shorter intervals than stock cars.",
    severity: "important",
    oem: {
      mileage: 45000,
      months: null,
      label: "45,000 mi",
      summary:
        "BMW reduced the N54 spark-plug replacement interval to 45,000 miles. The operation is linked to the model-year service schedule rather than a standalone dashboard counter.",
    },
    community: {
      mileage: 25000,
      months: 24,
      label: "20–30k mi / 24 mo",
      summary:
        "Owners and BMW specialists often shorten the interval to roughly 20,000–30,000 miles on tuned or frequently boosted cars. Stock cars may remain closer to the OEM interval.",
    },
    parts: [
      {
        name: "High-power spark plug (set of 6)",
        partNumber: "12 12 0 037 582",
        note: "Listed for later E90 N54 applications; verify production date and supersession by VIN.",
        purchaseUrl:
          "https://www.realoem.com/bmw/enUS/showparts?diagId=02_0092&id=PM51-EUR-09_2009_E90N_BMW_335i",
      },
      {
        name: "Thin-wall 14 mm spark-plug socket",
        partNumber: null,
        note: "Required for the narrow N54 plug wells.",
      },
    ],
    sources: [
      {
        type: "OEM",
        title: "2008 Model Year Maintenance Requirements",
        publisher: "BMW of North America · SIB 00 01 07",
        url: "https://bmwrepairguide.com/sib/000107.pdf",
        note: "Lists a 45,000-mile N54 spark-plug interval.",
      },
      {
        type: "Community consensus",
        title: "Engine Maintenance Hub",
        publisher: "FCP Euro",
        url: "https://info.fcpeuro.com/enginehub",
        note: "Independent interval guidance used for the enthusiast baseline.",
      },
    ],
    diy: [
      "Work on a cold engine and clear debris from the plug wells before removal.",
      "Inspect each removed plug and keep its cylinder position identifiable; uneven wear can reveal a separate fuel or ignition issue.",
      "Use the current plug specification and torque value for the exact plug and cylinder head.",
    ],
  },
  {
    slug: "brake-fluid",
    name: "Brake fluid",
    shortName: "Brake fluid",
    category: "Brakes",
    description:
      "Brake fluid absorbs moisture over time. The schedule is primarily time-based, regardless of mileage.",
    severity: "critical",
    oem: {
      mileage: null,
      months: 24,
      label: "CBS · 24 mo",
      summary:
        "BMW tracks brake-fluid service through the vehicle's time-based CBS reminder. Use the date shown by the car and the applicable service booklet.",
    },
    community: {
      mileage: null,
      months: 24,
      label: "Every 24 mo",
      summary:
        "Community guidance generally agrees with BMW's two-year cadence; track use or repeated high-temperature braking can justify testing or replacing it sooner.",
    },
    parts: [
      {
        name: "DOT 4 low-viscosity brake fluid",
        partNumber: null,
        note: "Use unopened fluid meeting the specification required by the car's braking and stability-control systems.",
      },
    ],
    sources: [
      {
        type: "OEM",
        title: "2008 3 Series Service and Warranty Information",
        publisher: "BMW service booklet archive",
        url: "https://www.carmanualsonline.info/bmw-3-series-2008-e90-service-and-warranty-information",
        note: "Model-specific booklet describing CBS maintenance categories.",
      },
      {
        type: "OEM",
        title: "BMW maintenance information FAQ",
        publisher: "BMW USA",
        url: "https://faq.bmwusa.com/s/article/FAQ-Maintenance-Booklet-BMW-USA-OVdVg",
        note: "Directs owners to their service display and maintenance booklet.",
      },
    ],
    diy: [
      "Prevent the reservoir from running dry during bleeding.",
      "Use a pressure and sequence appropriate to the E9x braking system; scan-tool procedures may be required if air enters the ABS hydraulic unit.",
      "Brake work is safety-critical. If the pedal is not firm after service, do not drive the vehicle.",
    ],
  },
  {
    slug: "engine-air-filter",
    name: "Engine air filter",
    shortName: "Air filter",
    category: "Engine",
    description:
      "A loaded filter can restrict airflow and collect debris inside the airbox. Inspect more often in dusty environments.",
    severity: "routine",
    oem: {
      mileage: 46200,
      months: null,
      label: "Every 3rd oil service",
      summary:
        "The model-year bulletin links the engine air filter to every third scheduled engine-oil service, shown at approximately 46,200 miles in the example sequence.",
    },
    community: {
      mileage: 20000,
      months: 24,
      label: "20,000 mi / 24 mo",
      summary:
        "A 20,000-mile inspection or replacement baseline is common for older enthusiast cars, shortened for dust, construction zones, or reusable filter media requiring cleaning.",
    },
    parts: [
      {
        name: "Engine air-filter element",
        partNumber: "13 71 7 599 285",
        note: "Later E90 N54 listing; confirm chassis and production date by VIN.",
        purchaseUrl:
          "https://www.realoem.com/bmw/enUS/showparts?diagId=02_0092&id=PM51-EUR-09_2009_E90N_BMW_335i",
      },
    ],
    sources: [
      {
        type: "OEM",
        title: "2008 Model Year Maintenance Requirements",
        publisher: "BMW of North America · SIB 00 01 07",
        url: "https://bmwrepairguide.com/sib/000107.pdf",
        note: "Connects engine-air-filter service to the oil-service counter.",
      },
      {
        type: "Community consensus",
        title: "Engine Maintenance Hub",
        publisher: "FCP Euro",
        url: "https://info.fcpeuro.com/enginehub",
        note: "Independent 20,000–30,000-mile engine-air-filter guidance.",
      },
    ],
    diy: [
      "Vacuum loose debris from the airbox without allowing it into the intake tract.",
      "Seat the filter evenly and confirm every airbox clip or fastener is secure.",
    ],
  },
  {
    slug: "automatic-transmission-fluid",
    name: "Automatic transmission fluid & pan",
    shortName: "Transmission fluid",
    category: "Driveline",
    description:
      "The ZF 6HP transmission uses an integrated filter pan. Fluid level is temperature-sensitive and requires a defined fill procedure.",
    severity: "important",
    oem: {
      mileage: null,
      months: null,
      label: "Long-term fluid",
      summary:
        "BMW literature for this era describes the automatic-transmission fluid as long-term rated and does not provide a routine CBS replacement interval.",
    },
    community: {
      mileage: 60000,
      months: 60,
      label: "60,000 mi / 5 yr",
      summary:
        "Independent BMW and ZF specialists commonly treat 50,000–60,000 miles as a prudent service window for aging 6HP units, including the filter pan and correct approved fluid.",
    },
    parts: [
      {
        name: "ZF 6HP transmission pan / filter",
        partNumber: "24 15 2 333 907",
        note: "Common GA6HP19Z service part; verify transmission identification and VIN.",
        purchaseUrl:
          "https://www.fcpeuro.com/BMW-parts/335i/Automatic-Transmission",
      },
      {
        name: "ZF-approved 6HP automatic-transmission fluid",
        partNumber: null,
        note: "Do not substitute by viscosity alone; confirm the exact approval.",
      },
      {
        name: "Fill and drain plugs / seals",
        partNumber: null,
        note: "Replace according to the current service procedure.",
      },
    ],
    sources: [
      {
        type: "OEM",
        title: "2008 3 Series Service and Warranty Information",
        publisher: "BMW service booklet archive",
        url: "https://www.carmanualsonline.info/bmw-3-series-2008-e90-service-and-warranty-information",
        note: "Era-specific BMW maintenance booklet; use VIN-specific information as controlling guidance.",
      },
      {
        type: "Community consensus",
        title: "BMW 335i automatic-transmission service parts",
        publisher: "FCP Euro",
        url: "https://www.fcpeuro.com/BMW-parts/335i/Automatic-Transmission",
        note: "Independent catalog and service-kit reference for the GA6HP19Z.",
      },
    ],
    diy: [
      "Identify the transmission before ordering parts; production date and drivetrain configuration matter.",
      "Keep the car level and follow the specified fluid-temperature window and shift-through procedure.",
      "A drain-and-fill is not the same as a machine flush. Choose the procedure based on condition and specialist advice.",
    ],
  },
  {
    slug: "coolant",
    name: "Engine coolant",
    shortName: "Coolant",
    category: "Cooling",
    description:
      "Coolant condition, hose integrity, and proper electric bleeding matter on the N54's heat-sensitive cooling system.",
    severity: "critical",
    oem: {
      mileage: null,
      months: null,
      label: "Long-term fluid",
      summary:
        "The 2008 service booklet describes engine coolant as lifetime-rated except when cooling-system repairs require replacement.",
    },
    community: {
      mileage: 36000,
      months: 36,
      label: "36,000 mi / 3 yr",
      summary:
        "Many owners adopt a three-year refresh on older cooling systems, particularly when replacing the water pump, thermostat, hoses, radiator, or expansion tank.",
    },
    parts: [
      {
        name: "BMW-compatible coolant concentrate",
        partNumber: null,
        note: "Use the current BMW-approved coolant and dilution for the vehicle and climate.",
      },
      {
        name: "Distilled water",
        partNumber: null,
        note: "Use only when mixing concentrate to the required ratio.",
      },
    ],
    sources: [
      {
        type: "OEM",
        title: "2008 3 Series Service and Warranty Information",
        publisher: "BMW service booklet archive",
        url: "https://www.carmanualsonline.info/bmw-3-series-2008-e90-service-and-warranty-information",
        note: "States the era-specific long-term coolant position.",
      },
      {
        type: "Community consensus",
        title: "The Definitive Guide To The BMW N54 Engine",
        publisher: "FCP Euro",
        url: "https://www.fcpeuro.com/blog/the-definitive-guide-to-the-bmw-n54-engine",
        note: "Independent N54 cooling-system and water-pump guidance.",
      },
    ],
    diy: [
      "Never open a hot cooling system.",
      "Use the N54 electric bleed procedure and maintain battery voltage during the cycle.",
      "After heat cycling, check level and inspect every disturbed connection for seepage.",
    ],
  },
  {
    slug: "differential-fluid",
    name: "Rear differential fluid",
    shortName: "Differential fluid",
    category: "Driveline",
    description:
      "The differential has no dashboard service reminder. A recorded baseline is especially valuable when prior history is unknown.",
    severity: "important",
    oem: {
      mileage: null,
      months: null,
      label: "No routine CBS interval",
      summary:
        "BMW does not provide a routine CBS counter for the standard rear differential on this platform. Confirm the exact final-drive unit and market-specific literature.",
    },
    community: {
      mileage: 60000,
      months: 60,
      label: "60,000 mi / 5 yr",
      summary:
        "A 50,000–60,000-mile change is a common enthusiast baseline, shortened after track use or when establishing history on a newly purchased car.",
    },
    parts: [
      {
        name: "Approved final-drive gear oil",
        partNumber: null,
        note: "Verify differential type, required approval, and fill quantity by VIN.",
      },
      {
        name: "Fill / drain sealing hardware",
        partNumber: null,
        note: "Confirm whether the installed final drive has separate drain and fill plugs.",
      },
    ],
    sources: [
      {
        type: "OEM",
        title: "2008 Model Year Maintenance Requirements",
        publisher: "BMW of North America · SIB 00 01 07",
        url: "https://bmwrepairguide.com/sib/000107.pdf",
        note: "Model-year maintenance schedule context; no standalone rear-differential CBS counter is presented.",
      },
      {
        type: "Community consensus",
        title: "BMW 335i (N54) Maintenance Schedule",
        publisher: "E90Post community attachment",
        url: "https://www.e90post.com/forums/attachment.php?attachmentid=749990&d=1347482384",
        note: "Community-created schedule; retained as non-OEM guidance.",
      },
    ],
    diy: [
      "Loosen the fill plug before draining so the differential cannot be left empty and unfillable.",
      "Keep the car level and fill to the current service-procedure specification.",
    ],
  },
  {
    slug: "intake-valve-cleaning",
    name: "Intake valve cleaning",
    shortName: "Intake valves",
    category: "Fuel & air",
    description:
      "Direct injection does not wash the backs of the intake valves with fuel. Deposits can contribute to rough cold starts, misfires, and reduced response.",
    severity: "important",
    oem: {
      mileage: null,
      months: null,
      label: "Condition-based",
      summary:
        "BMW does not list intake-valve cleaning as a fixed routine interval. Diagnosis should be based on symptoms, fault data, and physical inspection.",
    },
    community: {
      mileage: 50000,
      months: 48,
      label: "Inspect at 40–60k mi",
      summary:
        "Walnut-shell blasting around 40,000–60,000 miles is a common N54 owner baseline, adjusted for symptoms and prior cleaning history.",
    },
    parts: [
      {
        name: "Intake manifold gasket set",
        partNumber: null,
        note: "Replace disturbed seals and verify by VIN.",
      },
      {
        name: "Walnut-shell blasting media",
        partNumber: null,
        note: "Requires the correct blasting adapter and vacuum equipment.",
      },
    ],
    sources: [
      {
        type: "Community consensus",
        title: "The Definitive Guide To The BMW N54 Engine",
        publisher: "FCP Euro",
        url: "https://www.fcpeuro.com/blog/the-definitive-guide-to-the-bmw-n54-engine",
        note: "Independent N54 guide identifying intake-valve carbon buildup as a recurring issue.",
      },
      {
        type: "Individual experience",
        title: "N54 owner maintenance discussion",
        publisher: "r/335i",
        url: "https://www.reddit.com/r/335i/comments/z454ed/",
        note: "Owner discussion used only as an individual-experience layer.",
      },
    ],
    diy: [
      "Close and verify the valves for the port being cleaned before introducing blasting media.",
      "Use a purpose-made port adapter with continuous vacuum extraction.",
      "Inspect vacuum lines and manifold seals while access is available.",
    ],
  },
  {
    slug: "cabin-microfilter",
    name: "Cabin microfilter",
    shortName: "Cabin filter",
    category: "Cabin",
    description:
      "A fresh microfilter improves airflow and reduces load on the climate-control blower.",
    severity: "routine",
    oem: {
      mileage: 31200,
      months: null,
      label: "Every 2nd oil service",
      summary:
        "The model-year service sequence links the ventilation microfilter to every second engine-oil service, shown at approximately 31,200 miles.",
    },
    community: {
      mileage: 15000,
      months: 12,
      label: "15,000 mi / 12 mo",
      summary:
        "Annual inspection or replacement is a practical baseline where pollen, wildfire smoke, dust, or urban pollution is significant.",
    },
    parts: [
      {
        name: "Activated-carbon cabin microfilter",
        partNumber: null,
        note: "Confirm cowl housing and production date by VIN.",
      },
    ],
    sources: [
      {
        type: "OEM",
        title: "2008 Model Year Maintenance Requirements",
        publisher: "BMW of North America · SIB 00 01 07",
        url: "https://bmwrepairguide.com/sib/000107.pdf",
        note: "Links the ventilation microfilter to the oil-service counter.",
      },
      {
        type: "Community consensus",
        title: "BMW service-parts catalog guidance",
        publisher: "FCP Euro",
        url: "https://www.fcpeuro.com/BMW-parts/335i/",
        note: "Independent parts and service reference.",
      },
    ],
    diy: [
      "Clean leaves and debris from the cowl before opening the filter housing.",
      "Install the filter in the marked airflow direction and reseat the cowl seals.",
    ],
  },
];

export const KNOWN_ISSUES = [
  {
    slug: "electric-water-pump",
    issue: "Electric water pump & thermostat",
    description:
      "The electric pump can lose output or stop, creating an immediate overheating risk. Prior replacement history materially changes the risk assessment.",
    symptoms: "Loud cooling fan, yellow/red temperature warning, reduced power, coolant-pump faults",
    typicalMileage: "Often discussed around 60k–100k mi; highly variable",
    severity: "critical",
    preventativeAction:
      "Confirm replacement history, scan for stored pump faults, and treat any overheat warning as a stop-driving event.",
    sourceUrl: "https://www.fcpeuro.com/blog/the-definitive-guide-to-the-bmw-n54-engine",
  },
  {
    slug: "oil-filter-housing-gasket",
    issue: "Oil-filter-housing gasket leak",
    description:
      "Oil can leak onto the belt drive. A contaminated belt can slip, shred, and create a much larger engine-risk event.",
    symptoms: "Oil around the filter housing, wet belt area, burning-oil odor",
    typicalMileage: "Age-related; common on higher-mileage N54s",
    severity: "critical",
    preventativeAction:
      "Inspect at every oil service and repair promptly if oil is migrating toward the belt.",
    sourceUrl: "https://www.fcpeuro.com/blog/the-definitive-guide-to-the-bmw-n54-engine",
  },
  {
    slug: "valve-cover",
    issue: "Valve cover / gasket leaks",
    description:
      "The plastic cover can crack and the gasket can harden, causing external leaks or crankcase-ventilation symptoms.",
    symptoms: "Oil smell, smoke near the exhaust side, oil in plug wells, rough idle or mixture faults",
    typicalMileage: "Common as heat cycles and age accumulate",
    severity: "important",
    preventativeAction:
      "Inspect the cover and gasket together; determine whether the cover itself is warped or cracked before replacing only the seal.",
    sourceUrl: "https://www.fcpeuro.com/blog/the-definitive-guide-to-the-bmw-n54-engine",
  },
  {
    slug: "hpfp-injectors",
    issue: "High-pressure fuel pump & injectors",
    description:
      "Early N54 fuel-system components developed a well-documented reputation for failures and revisions.",
    symptoms: "Long cranking, rough cold start, misfires, reduced-power warning, fuel-pressure faults",
    typicalMileage: "No reliable fixed mileage; revision and history matter",
    severity: "important",
    preventativeAction:
      "Keep pump and injector part/index history with the car, and diagnose pressure or mixture faults before replacing parts by pattern alone.",
    sourceUrl: "https://www.fcpeuro.com/blog/the-definitive-guide-to-the-bmw-n54-engine",
  },
  {
    slug: "charge-pipe",
    issue: "Plastic charge pipe",
    description:
      "The molded charge pipe can crack or separate, particularly after years of heat cycling or increased boost.",
    symptoms: "Sudden loss of boost, underboost code, loud air leak, reduced power",
    typicalMileage: "Age, heat, and boost dependent",
    severity: "important",
    preventativeAction:
      "Inspect the throttle-body connection and molded seams; document whether the original part is still installed.",
    sourceUrl: "https://blog.ecstuning.com/how-reliable-is-the-bmw-135i-n54/",
  },
] as const;

export function getCatalogItem(slug: string) {
  return MAINTENANCE_CATALOG.find((item) => item.slug === slug) ?? null;
}
