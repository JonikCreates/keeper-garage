export type SourceType = "OEM" | "Community consensus" | "Individual experience";

export type CatalogSource = {
  type: SourceType;
  title: string;
  publisher: string;
  url: string;
  note: string;
};

export type Applicability = {
  trims?: string[];
  engines?: string[];
  drivetrains?: string[];
  transmissions?: string[];
};

export type VehicleProfile = {
  trim: string;
  engineCode: string;
  drivetrain: string;
  transmission: string;
};

export type MaintenanceCatalogItem = {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  severity: "critical" | "important" | "routine";
  appliesTo: Applicability;
  oem: { mileage: number | null; months: number | null; label: string; summary: string };
  community: { mileage: number | null; months: number | null; label: string; summary: string };
  parts: Array<{ name: string; partNumber: string | null; note: string; purchaseUrl?: string }>;
  sources: CatalogSource[];
  diy: string[];
};

export type KnownIssue = {
  slug: string;
  system: string;
  issue: string;
  description: string;
  symptoms: string;
  typicalMileage: string;
  severity: "critical" | "important" | "routine";
  urgency: "urgent" | "watch";
  evidence: "BMW recall" | "BMW bulletin" | "Community consensus";
  preventativeAction: string;
  appliesTo: Applicability;
  sources: CatalogSource[];
};

export type ProjectIdea = {
  slug: string;
  title: string;
  description: string;
  payoff: string;
  appliesTo: Applicability;
};

export const PLATFORM = {
  slug: "bmw-f30-2016-us",
  yearStart: 2016,
  yearEnd: 2016,
  make: "BMW",
  model: "3 Series (F30)",
  trim: "320i–340i",
  engine: "N20 / N26 / N47T / B48 / B58",
  transmission: "8-speed automatic / 6-speed manual",
};

export const TRIM_OPTIONS = [
  { value: "320i", label: "320i", engines: ["N20"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
  { value: "328i", label: "328i", engines: ["N26", "N20"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
  { value: "328d", label: "328d diesel", engines: ["N47T"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic"] },
  { value: "330e", label: "330e plug-in hybrid", engines: ["B48-PHEV"], drivetrains: ["RWD"], transmissions: ["8-speed automatic"] },
  { value: "340i", label: "340i", engines: ["B58"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
] as const;

export function inferEngine(trim: string, transmission: string) {
  if (trim === "328i") return transmission === "6-speed manual" ? "N20" : "N26";
  return TRIM_OPTIONS.find((option) => option.value === trim)?.engines[0] ?? "Unknown";
}

export function matchesApplicability(profile: VehicleProfile, rule: Applicability) {
  return (!rule.trims || rule.trims.includes(profile.trim)) &&
    (!rule.engines || rule.engines.includes(profile.engineCode)) &&
    (!rule.drivetrains || rule.drivetrains.includes(profile.drivetrain)) &&
    (!rule.transmissions || rule.transmissions.includes(profile.transmission));
}

const BMW_2016: CatalogSource = {
  type: "OEM",
  title: "2016 Model Year Maintenance Requirements",
  publisher: "BMW of North America · SIB 00 01 15",
  url: "https://bmwrepairguide.com/sib/000115.pdf",
  note: "Factory model and engine mapping plus 2016 maintenance operations.",
};

const BMW_2014: CatalogSource = {
  type: "OEM",
  title: "2014 Model Year Maintenance Changes",
  publisher: "BMW of North America · SIB 00 01 13",
  url: "https://bmwrepairguide.com/sib/000113.pdf",
  note: "Introduced the 10,000-mile or 12-month basic interval and diesel service requirements.",
};

const FCP_ENGINE: CatalogSource = {
  type: "Community consensus",
  title: "Engine Maintenance Hub",
  publisher: "FCP Euro",
  url: "https://info.fcpeuro.com/enginehub",
  note: "Independent European-car service guidance used as a conservative planning layer.",
};

const F30_BUYER: CatalogSource = {
  type: "Community consensus",
  title: "F30 used buying guide and owner checks",
  publisher: "F30Post",
  url: "https://f30.bimmerpost.com/forums/showthread.php?t=1503426",
  note: "Long-running model-wide owner discussion used to identify recurring inspection points.",
};

const N20_VIDEO: CatalogSource = {
  type: "Community consensus",
  title: "BMW N20/N26 diagnostic and maintenance guide",
  publisher: "FCP Euro · YouTube",
  url: "https://www.youtube.com/watch?v=NV1LWDeMw38",
  note: "Independent specialist walkthrough covering the recurring N20/N26 leak, cooling, and timing areas.",
};

const STARTMYCAR_328: CatalogSource = {
  type: "Individual experience",
  title: "BMW 328 owner-reported problems",
  publisher: "StartMyCar",
  url: "https://www.startmycar.com/bmw/328/problems",
  note: "Unverified owner complaints used only as a symptom-discovery layer; model year and diagnosis must be checked individually.",
};

export const MAINTENANCE_CATALOG: MaintenanceCatalogItem[] = [
  {
    slug: "engine-oil-filter", name: "Engine oil & filter", shortName: "Oil & filter", category: "Engine", severity: "critical", appliesTo: {},
    description: "The single most useful service baseline for every turbocharged F30. Track mileage and time, not only the dashboard reminder.",
    oem: { mileage: 10000, months: 12, label: "10,000 mi / 12 mo", summary: "BMW's 2014-on maintenance schedule uses a 10,000-mile or 12-month basic engine-oil interval, with CBS as the controlling display." },
    community: { mileage: 7500, months: 12, label: "7,500 mi / 12 mo", summary: "A 5,000–7,500-mile interval is a common conservative baseline for older turbo engines, short trips, or hard use." },
    parts: [{ name: "VIN-matched oil service kit", partNumber: null, note: "Filter, seals, drain-plug hardware, oil approval, viscosity, and capacity vary by engine." }],
    sources: [BMW_2014, BMW_2016, FCP_ENGINE],
    diy: ["Verify the oil approval and capacity for the exact engine and emissions specification.", "Inspect the filter housing, drain plug, pan, and surrounding belt area for fresh leaks.", "Confirm the electronic oil level on level ground after the prescribed warm-up procedure."],
  },
  {
    slug: "brake-fluid", name: "Brake fluid", shortName: "Brake fluid", category: "Brakes", severity: "critical", appliesTo: {},
    description: "Brake fluid absorbs moisture with age, so its service clock matters even on a low-mileage car.",
    oem: { mileage: null, months: 24, label: "First at 3 yr, then 2 yr", summary: "BMW specifies the first brake-fluid service at three years and subsequent services every two years." },
    community: { mileage: null, months: 24, label: "Every 24 mo", summary: "The owner community generally follows the two-year cadence; track use can justify testing or replacement sooner." },
    parts: [{ name: "DOT 4 low-viscosity brake fluid", partNumber: null, note: "Use fresh sealed fluid meeting the vehicle specification." }],
    sources: [BMW_2014],
    diy: ["Brake work is safety-critical; do not drive with a soft or uncertain pedal.", "Keep the reservoir from running dry and use the correct bleed procedure.", "Inspect pads, rotors, hoses, and parking-brake operation at the same visit."],
  },
  {
    slug: "engine-air-filter", name: "Engine air filter", shortName: "Air filter", category: "Engine", severity: "routine", appliesTo: {},
    description: "A loaded air filter increases restriction and can hide leaves or debris in the airbox.",
    oem: { mileage: 40000, months: null, label: "About every 4th oil service", summary: "BMW's 2016 B58 schedule places the air filter at the fourth oil service, approximately 40,000 miles; verify CBS and the exact engine schedule." },
    community: { mileage: 30000, months: 36, label: "30,000 mi / 3 yr", summary: "Inspect sooner in dust, construction, or high-pollen conditions." },
    parts: [{ name: "Engine-specific filter element", partNumber: null, note: "The N20/N26, N47T, B48, and B58 use different parts." }],
    sources: [BMW_2016, FCP_ENGINE],
    diy: ["Clean loose debris from the airbox without dropping it into the intake.", "Check intake boots and clamps before closing the airbox."],
  },
  {
    slug: "cabin-filter", name: "Cabin microfilter", shortName: "Cabin filter", category: "Climate", severity: "routine", appliesTo: {},
    description: "A clean microfilter protects airflow through the climate system and helps reveal water or leaf buildup early.",
    oem: { mileage: 20000, months: 24, label: "CBS / service counter", summary: "BMW links the microfilter to scheduled vehicle checks; the vehicle's CBS and service history remain controlling." },
    community: { mileage: 15000, months: 12, label: "15,000 mi / 12 mo", summary: "Annual inspection is useful in humid, leafy, dusty, or high-pollen environments." },
    parts: [{ name: "Activated-carbon microfilter", partNumber: null, note: "Confirm the housing and production-date fitment." }],
    sources: [BMW_2016, F30_BUYER],
    diy: ["Inspect the old filter for dampness or water staining.", "Clear accessible cowl debris and verify the cover seals correctly."],
  },
  {
    slug: "spark-plugs-n20", name: "Spark plugs · N20/N26", shortName: "Spark plugs", category: "Ignition", severity: "important", appliesTo: { engines: ["N20", "N26"] },
    description: "Worn plugs commonly appear first as a misfire or hesitation under boost.",
    oem: { mileage: 60000, months: null, label: "Service-counter based", summary: "BMW links spark-plug replacement to scheduled oil services; confirm the exact counter and VIN-specific service data." },
    community: { mileage: 40000, months: 48, label: "40,000 mi / 4 yr", summary: "A shorter interval is common on tuned cars or cars with repeated high-load use." },
    parts: [{ name: "VIN-matched spark plug set", partNumber: null, note: "Verify plug revision, gap policy, and torque for N20 versus N26." }],
    sources: [BMW_2016, N20_VIDEO],
    diy: ["Work on a cold engine and keep every plug indexed by cylinder.", "Do not treat repeated misfires as a plug-only problem; scan faults and inspect coils and fueling."],
  },
  {
    slug: "spark-plugs-b-series", name: "Spark plugs · B48/B58", shortName: "Spark plugs", category: "Ignition", severity: "important", appliesTo: { engines: ["B48-PHEV", "B58"] },
    description: "The B-series turbo engines rely on healthy plugs and coils for clean combustion under load.",
    oem: { mileage: 60000, months: null, label: "About every 6th oil service", summary: "BMW's 2016 B58 schedule specifies spark plugs at the sixth oil service, approximately 60,000 miles." },
    community: { mileage: 45000, months: 48, label: "45,000 mi / 4 yr", summary: "Independent specialists often shorten the interval when the engine is tuned or driven hard." },
    parts: [{ name: "VIN-matched spark plug set", partNumber: null, note: "B48 and B58 plug quantities and revisions differ." }],
    sources: [BMW_2016, FCP_ENGINE],
    diy: ["Verify plug revision and torque against current BMW information.", "Scan and diagnose recurring cylinder-specific misfires rather than repeatedly replacing parts."],
  },
  {
    slug: "automatic-transmission-fluid", name: "ZF 8HP fluid & filter pan", shortName: "Transmission fluid", category: "Driveline", severity: "important", appliesTo: { transmissions: ["8-speed automatic"] },
    description: "The 8HP fill level is temperature-sensitive and its filter is integrated into the service pan.",
    oem: { mileage: null, months: null, label: "Long-term rated", summary: "BMW's 2016 maintenance bulletin describes the automatic-transmission fluid as long-term rated without a routine CBS replacement interval." },
    community: { mileage: 60000, months: 72, label: "60,000 mi / 6 yr", summary: "ZF recommends an oil change by 150,000 km under normal conditions and sooner under high loads or uncertain history; many BMW specialists use a more conservative 60,000-mile baseline." },
    parts: [{ name: "ZF 8HP pan/filter and approved fluid", partNumber: null, note: "Identify the exact transmission and fluid before ordering." }],
    sources: [BMW_2016, { type: "OEM", title: "ZF LifeguardFluid 8 product data", publisher: "ZF Aftermarket", url: "https://aftermarket.zf.com/lubricants-datasheets/lifeguardfluid-8/pds_zf_lifeguardfluid_8_en_20170920.pdf", note: "ZF states a 150,000-km change recommendation and shorter intervals for high loads or unknown use." }],
    diy: ["Keep the vehicle level and follow the required fluid-temperature window.", "A drain-and-fill is not the same operation as a machine flush.", "Use only the approved fluid and the correct shift-through/fill procedure."],
  },
  {
    slug: "manual-transmission-fluid", name: "6-speed manual fluid", shortName: "Manual fluid", category: "Driveline", severity: "important", appliesTo: { transmissions: ["6-speed manual"] },
    description: "Fresh correct-spec fluid can protect shift quality even though BMW does not provide a routine CBS interval.",
    oem: { mileage: null, months: null, label: "Long-term rated", summary: "BMW does not publish a recurring CBS fluid service for the manual gearbox in this schedule." },
    community: { mileage: 50000, months: 60, label: "50,000 mi / 5 yr", summary: "Independent BMW specialists commonly establish a condition-based 50,000-mile baseline for an aging enthusiast car." },
    parts: [{ name: "VIN-matched manual transmission fluid", partNumber: null, note: "Confirm gearbox identification and current BMW fluid label." }],
    sources: [BMW_2016, FCP_ENGINE],
    diy: ["Open the fill plug before draining.", "Keep the car level and verify the exact fluid specification."],
  },
  {
    slug: "rear-differential-fluid", name: "Rear differential fluid", shortName: "Rear differential", category: "Driveline", severity: "important", appliesTo: {},
    description: "A sensible ownership baseline for the final drive, especially when prior service history is unknown.",
    oem: { mileage: null, months: null, label: "No routine CBS interval", summary: "BMW's maintenance schedule does not list a recurring final-drive fluid replacement." },
    community: { mileage: 50000, months: 60, label: "50,000 mi / 5 yr", summary: "Independent owners and shops commonly service the differential by condition and age." },
    parts: [{ name: "VIN-matched final-drive oil", partNumber: null, note: "Open versus limited-slip units require correct identification and fluid." }],
    sources: [BMW_2016, F30_BUYER],
    diy: ["Open the fill plug before draining.", "Inspect both plugs and seals and confirm the correct level on a level car."],
  },
  {
    slug: "transfer-case-fluid", name: "xDrive transfer-case fluid", shortName: "Transfer case", category: "xDrive", severity: "important", appliesTo: { drivetrains: ["xDrive"] },
    description: "Matched tire circumference and healthy transfer-case fluid matter to xDrive clutch life.",
    oem: { mileage: null, months: null, label: "Condition based", summary: "BMW does not expose a recurring transfer-case fluid item in the normal CBS maintenance list." },
    community: { mileage: 50000, months: 60, label: "50,000 mi / 5 yr", summary: "A conservative service baseline plus closely matched tires is common specialist guidance." },
    parts: [{ name: "BMW transfer-case fluid", partNumber: null, note: "Verify transfer-case model, fluid, fill quantity, and adaptation procedure." }],
    sources: [F30_BUYER],
    diy: ["Measure tire tread and confirm all four tires are compatible in size and rolling circumference.", "A scan-tool adaptation procedure may be required after service."],
  },
  {
    slug: "front-differential-fluid", name: "xDrive front differential fluid", shortName: "Front differential", category: "xDrive", severity: "important", appliesTo: { drivetrains: ["xDrive"] },
    description: "The front final drive is easy to overlook when establishing an xDrive baseline.",
    oem: { mileage: null, months: null, label: "No routine CBS interval", summary: "BMW's normal CBS maintenance list does not include a recurring front-final-drive service." },
    community: { mileage: 50000, months: 60, label: "50,000 mi / 5 yr", summary: "Owners commonly pair this service with the rear differential and transfer case." },
    parts: [{ name: "VIN-matched front final-drive oil", partNumber: null, note: "Confirm the exact unit and fluid by VIN." }],
    sources: [F30_BUYER],
    diy: ["Open the fill plug before draining.", "Inspect for axle-seal leaks while access is available."],
  },
  {
    slug: "engine-coolant", name: "Engine coolant", shortName: "Coolant", category: "Cooling", severity: "critical", appliesTo: {},
    description: "Coolant loss is a symptom to diagnose, not something to normalize with repeated top-offs.",
    oem: { mileage: null, months: null, label: "Condition / repair based", summary: "The 2016 schedule does not provide a recurring CBS coolant replacement interval; coolant is replaced as required during cooling-system repairs." },
    community: { mileage: 50000, months: 48, label: "50,000 mi / 4 yr", summary: "Many specialists use a four-year condition-based refresh while inspecting hoses, caps, pumps, and plastic fittings." },
    parts: [{ name: "Current BMW-approved coolant", partNumber: null, note: "Coolant chemistry changed over time; verify the correct current product and mixing instruction." }],
    sources: [BMW_2016, FCP_ENGINE],
    diy: ["Never open a hot pressurized cooling system.", "Pressure-test unexplained loss and use the engine-specific bleed procedure."],
  },
  {
    slug: "diesel-fuel-filter", name: "Diesel fuel filter", shortName: "Fuel filter", category: "Diesel", severity: "important", appliesTo: { engines: ["N47T"] },
    description: "Clean fuel delivery protects the high-pressure diesel system and supports reliable cold starts.",
    oem: { mileage: 20000, months: 24, label: "Every 2nd oil service", summary: "BMW's diesel maintenance schedule links the fuel filter to scheduled oil-service counters; confirm the exact CBS sequence." },
    community: { mileage: 20000, months: 24, label: "20,000 mi / 2 yr", summary: "Community practice generally stays close to BMW's counter-based cadence." },
    parts: [{ name: "N47T fuel-filter service kit", partNumber: null, note: "Verify heater, seals, and production-date fitment." }],
    sources: [BMW_2014],
    diy: ["Diesel fuel work requires strict cleanliness.", "Prime and leak-check the system using the correct service procedure."],
  },
  {
    slug: "diesel-def", name: "Diesel exhaust fluid (DEF)", shortName: "DEF", category: "Diesel", severity: "critical", appliesTo: { engines: ["N47T"] },
    description: "The SCR system can prevent restart when DEF quantity or system faults are ignored.",
    oem: { mileage: 10000, months: 12, label: "Top up at every oil service", summary: "BMW calls for DEF top-up at each oil service on the 328d." },
    community: { mileage: 10000, months: 12, label: "Check at every oil service", summary: "Use sealed in-spec fluid and investigate abnormal consumption or countdown warnings." },
    parts: [{ name: "ISO 22241-compliant DEF", partNumber: null, note: "Keep the fill area clean and do not contaminate the diesel tank." }],
    sources: [BMW_2014],
    diy: ["Never put DEF into the diesel-fuel tank.", "Treat a no-start countdown or SCR fault as a diagnostic issue, not only a fluid-level issue."],
  },
  {
    slug: "hybrid-coolant", name: "330e high-voltage cooling check", shortName: "Hybrid cooling", category: "Hybrid", severity: "critical", appliesTo: { engines: ["B48-PHEV"] },
    description: "The 330e has a separate high-voltage cooling circuit that must not be confused with the engine circuit.",
    oem: { mileage: null, months: null, label: "Separate reservoir / condition based", summary: "BMW identifies a separate high-voltage-system coolant reservoir for the 330e; service must follow hybrid-specific procedures." },
    community: { mileage: null, months: 12, label: "Inspect annually", summary: "An annual visual level and leak check is a prudent owner baseline, with all HV diagnosis left to trained personnel." },
    parts: [{ name: "VIN-specific BMW coolant", partNumber: null, note: "Hybrid cooling work requires the correct circuit, fluid, bleeding, and safety procedure." }],
    sources: [BMW_2016],
    diy: ["Do not open, disconnect, or probe high-voltage components.", "Escalate HV warnings, isolation faults, or unexplained cooling loss to a qualified BMW hybrid technician."],
  },
  {
    slug: "belts-hoses", name: "Belts, hoses & plastic fittings", shortName: "Belts & hoses", category: "Inspection", severity: "important", appliesTo: {},
    description: "Age, oil contamination, and heat cycles can matter more than a fixed odometer number.",
    oem: { mileage: null, months: null, label: "Inspect by condition", summary: "BMW includes vehicle and engine-compartment checks within scheduled service operations rather than a single replacement interval." },
    community: { mileage: 30000, months: 24, label: "Inspect every 2 yr", summary: "Owners commonly inspect the belt drive, coolant hoses, vacuum lines, and plastic quick-connects at every major service." },
    parts: [{ name: "Engine-specific belt and tensioner parts", partNumber: null, note: "Oil contamination requires finding and fixing the leak, not only replacing the belt." }],
    sources: [BMW_2016, FCP_ENGINE],
    diy: ["Never work around a moving belt drive.", "Treat an oil-soaked or damaged belt as an immediate correction item and diagnose the source."],
  },
];

const issueSource = (title: string, url: string, note: string, publisher = "F30Post"):
  CatalogSource => ({ type: "Community consensus", title, publisher, url, note });

const issues: KnownIssue[] = [
  {
    slug: "n20-timing-chain", system: "Engine", issue: "N20/N26 timing-chain and oil-pump drive", severity: "critical", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["N20", "N26"] },
    description: "BMW issued warranty extensions and settlement procedures for specific earlier N20/N26 production. A 2016 is generally outside the highest-risk production window, but build date, noise, fault history, and prior repair still matter.",
    symptoms: "Whine from the lower engine, chain rattle, timing faults, oil-pressure warnings, or plastic debris in the filter.", typicalMileage: "VIN and production-date dependent; do not apply early-car statistics blindly to a 2016.",
    preventativeAction: "Verify VIN and production date, inspect service history, shorten oil intervals, and stop driving for oil-pressure or timing faults.",
    sources: [{ type: "OEM", title: "N20/N26 timing-chain limited warranty extension", publisher: "BMW of North America · SIB 11 03 17", url: "https://bmwrepairguide.com/sib/110317.pdf", note: "Defines affected production and covered timing/oil-pump drive components." }, N20_VIDEO],
  },
  {
    slug: "n20-oil-filter-housing", system: "Engine", issue: "Oil-filter housing and oil-cooler gasket leaks", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26"] },
    description: "The housing-to-head and oil-cooler seals harden and leak. Oil reaching the belt drive raises the consequence beyond a cosmetic seep.",
    symptoms: "Fresh oil around the filter housing, oil smell, belt contamination, or oil collecting at the front of the engine.", typicalMileage: "Common with age and heat cycling, often from roughly 60,000 miles onward.",
    preventativeAction: "Inspect at every oil service. Repair promptly, clean the belt path, and replace contaminated belt components.",
    sources: [{ type: "Community consensus", title: "N20/N26 oil-filter housing gasket replacement", publisher: "FCP Euro", url: "https://www.fcpeuro.com/blog/how-to-replace-a-bmw-n20-n26-oil-filter-housing-gasket-f30", note: "Specialist procedure and failure context." }, N20_VIDEO],
  },
  {
    slug: "n20-valve-cover-pcv", system: "Engine", issue: "Valve-cover gasket and integrated PCV", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26"] },
    description: "The composite cover can warp, its gasket can leak, and the integrated crankcase-ventilation diaphragm can fail.",
    symptoms: "Burning-oil odor, oil at the cover edge, whistling, rough idle, mixture faults, or excess crankcase vacuum.", typicalMileage: "Age and heat-cycle dependent; common on higher-mileage cars.",
    preventativeAction: "Inspect the entire cover before replacing only the gasket and verify crankcase pressure when symptoms point to PCV failure.", sources: [N20_VIDEO],
  },
  {
    slug: "n20-water-pump-thermostat", system: "Cooling", issue: "Electric water pump and thermostat", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26"] },
    description: "Electric-pump or thermostat failure can quickly become an overheat event.",
    symptoms: "Coolant warning, high fan speed, reduced power, overheating message, stored pump faults, or slow warm-up.", typicalMileage: "Often discussed around 70,000–120,000 miles, but failures are not strictly mileage based.",
    preventativeAction: "Scan cooling faults during major service, address abnormal temperature behavior immediately, and replace pump/thermostat as a matched job when diagnosis supports it.", sources: [N20_VIDEO, STARTMYCAR_328],
  },
  {
    slug: "n20-charge-pipe", system: "Intake", issue: "Plastic charge-pipe cracking", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26", "B58"] },
    description: "The plastic charge path can split at a seam or connection, especially after years of heat cycles or higher boost.",
    symptoms: "Sudden power loss, boost leak, drivetrain malfunction, hiss, or an oily split near a coupling.", typicalMileage: "Condition and modification dependent.",
    preventativeAction: "Inspect joints during service and diagnose boost faults before replacing parts; a quality metal replacement is a common preventative upgrade.", sources: [N20_VIDEO, F30_BUYER],
  },
  {
    slug: "n20-turbo-lines-wastegate", system: "Turbo", issue: "Turbo oil/coolant lines and wastegate wear", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26"] },
    description: "Seals and feed/return lines can seep, while wastegate linkage wear can create rattle or boost-control faults.",
    symptoms: "Oil or coolant near the turbo, exhaust smoke, metallic rattle, low boost, or boost-control codes.", typicalMileage: "Most relevant as heat cycles and mileage accumulate.",
    preventativeAction: "Inspect from below during oil service and diagnose smoke or boost faults before condemning the turbocharger.", sources: [N20_VIDEO],
  },
  {
    slug: "n20-ignition-fueling", system: "Fuel & ignition", issue: "Coils, injectors, and high-pressure fueling", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26"] },
    description: "Misfires can originate in plugs, coils, injectors, fuel pressure, air leaks, or control faults; parts-swapping obscures the real cause.",
    symptoms: "Cold-start shake, cylinder-specific misfire, hesitation under load, fuel smell, or rail-pressure faults.", typicalMileage: "Condition based; coils and plugs are wear items while injectors and pumps require diagnosis.",
    preventativeAction: "Read fault codes and freeze-frame data, move coils only as a controlled test, and check fuel pressure before authorizing expensive parts.", sources: [N20_VIDEO],
  },
  {
    slug: "n47-egr-recall", system: "Diesel emissions", issue: "N47T EGR-cooler safety recall", severity: "critical", urgency: "urgent", evidence: "BMW recall", appliesTo: { engines: ["N47T"] },
    description: "BMW recall 21V-907 covers affected F30/F31 N47T vehicles because an internally leaking EGR cooler can combine coolant with soot, damage the intake, and increase fire risk.",
    symptoms: "Coolant loss, reduced power, exhaust odor, unusual engine-bay noise, smoke, or an open recall with no symptoms.", typicalMileage: "Recall eligibility is VIN and production-date based, not mileage based.",
    preventativeAction: "Check the VIN on BMW's recall page and complete any open campaign at an authorized BMW center at no charge.",
    sources: [{ type: "OEM", title: "Recall 21V-907: N47T EGR cooler", publisher: "BMW of North America / NHTSA · SIB 11 09 21", url: "https://static.nhtsa.gov/odi/rcl/2021/RCRIT-21V907-7368.pdf", note: "Official recall scope, risk, and VIN-check procedure." }, { type: "OEM", title: "BMW recall lookup", publisher: "BMW USA", url: "https://www.bmwusa.com/safety-and-emission-recalls.html", note: "Official VIN-specific recall lookup." }],
  },
  {
    slug: "n47-dpf-thermostat", system: "Diesel emissions", issue: "DPF regeneration and low operating temperature", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N47T"] },
    description: "Short-trip use, failed thermostats, pressure-sensor faults, or other engine faults can prevent regeneration and overload the diesel particulate filter.",
    symptoms: "Frequent regeneration, reduced power, DPF faults, poor fuel economy, fan running after shutdown, or engine failing to reach normal temperature.", typicalMileage: "Usage-pattern dependent; repeated short trips raise risk at any mileage.",
    preventativeAction: "Diagnose the cause before forcing regeneration; verify operating temperature, pressure sensors, glow system, and fault-free engine operation.",
    sources: [issueSource("328d DPF and regeneration owner diagnostics", "https://f30.bimmerpost.com/forums/showthread.php?t=1503426", "Recurring diesel owner checks and usage context.")],
  },
  {
    slug: "n47-scr-def-nox", system: "Diesel emissions", issue: "SCR, DEF tanks, heaters, and NOx sensors", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N47T"] },
    description: "The selective-catalyst system relies on pumps, heaters, sensors, dosing, and in-spec fluid. A fault can trigger a no-start countdown.",
    symptoms: "Check-engine light, incorrect-fluid warning, low-level warning that will not clear, SCR efficiency faults, or miles-to-no-start countdown.", typicalMileage: "Age, climate, and crystallization dependent.",
    preventativeAction: "Use sealed in-spec DEF, scan BMW-specific faults promptly, and diagnose the system rather than repeatedly topping up.", sources: [BMW_2014, F30_BUYER],
  },
  {
    slug: "n47-timing-chain", system: "Engine", issue: "N47T rear timing-chain wear", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N47T"] },
    description: "N47-family timing components are mounted at the rear of the engine, making abnormal chain wear a consequential diagnosis. Not every N47T develops it.",
    symptoms: "Metallic rattle or scraping from the transmission side of the engine, timing correlation faults, or debris in the oil filter.", typicalMileage: "History, oil service, and production dependent; community reports vary widely.",
    preventativeAction: "Listen during cold and warm operation, preserve oil-service records, inspect the filter, and obtain specialist diagnosis before assuming normal diesel noise is chain wear.", sources: [F30_BUYER],
  },
  {
    slug: "n47-intake-carbon", system: "Diesel intake", issue: "EGR soot and intake carbon buildup", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N47T"] },
    description: "EGR soot mixed with oil vapor can narrow the intake tract and affect swirl-flap operation.",
    symptoms: "Reduced power, uneven response, airflow faults, smoke, or heavy deposits found during EGR service.", typicalMileage: "Usage and EGR-system dependent; urban use can accelerate buildup.",
    preventativeAction: "Diagnose airflow faults, inspect during relevant repairs, and use an appropriate mechanical cleaning procedure when confirmed.", sources: [F30_BUYER],
  },
  {
    slug: "n47-glow-system", system: "Diesel", issue: "Glow plugs and glow-control module", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N47T"] },
    description: "Glow-system faults affect cold starts and can interfere with low-temperature DPF regeneration strategy.",
    symptoms: "Hard cold starting, rough cold idle, smoke, glow-plug codes, or regeneration complaints.", typicalMileage: "More likely with age and cold-climate use.",
    preventativeAction: "Scan individual glow circuits and module supply before replacing a complete set.", sources: [F30_BUYER],
  },
  {
    slug: "330e-kle", system: "Hybrid charging", issue: "330e KLE charging-electronics fault", severity: "critical", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["B48-PHEV"] },
    description: "BMW documented charging failures involving the KLE charging electronics on the F30 330e.",
    symptoms: "Vehicle will not charge, charging stops, charge-port indicator faults, or charging system messages.", typicalMileage: "Fault and production dependent, not a scheduled wear interval.",
    preventativeAction: "Stop using damaged charging equipment, try a known-good supply only if safe, and have the vehicle diagnosed with BMW hybrid procedures.",
    sources: [{ type: "OEM", title: "330e KLE charging fault", publisher: "BMW of North America · SIB 61 13 16", url: "https://static.nhtsa.gov/odi/tsbs/2018/MC-10142936-9999.pdf", note: "Official diagnostic and repair bulletin for F30 PHEV charging complaints." }],
  },
  {
    slug: "330e-cell-temperature", system: "High voltage", issue: "High-voltage battery cell-temperature sensor fault", severity: "critical", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["B48-PHEV"] },
    description: "BMW published a diagnostic bulletin for cell-temperature sensing faults in the 330e high-voltage battery system.",
    symptoms: "Drivetrain or high-voltage warning, restricted electric operation, charging disabled, or stored battery-management faults.", typicalMileage: "Fault based; specialist diagnosis required.",
    preventativeAction: "Do not open or probe the battery. Park safely and arrange diagnosis by a BMW-trained high-voltage technician.",
    sources: [{ type: "OEM", title: "PHEV high-voltage battery cell-temperature sensor faults", publisher: "BMW of North America", url: "https://static.nhtsa.gov/odi/tsbs/2024/MC-11012073-0001.pdf", note: "Official BMW service information for high-voltage temperature-sensor diagnosis." }],
  },
  {
    slug: "330e-hv-cooling", system: "Hybrid cooling", issue: "High-voltage battery cooling and A/C dependency", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B48-PHEV"] },
    description: "The plug-in hybrid depends on functioning thermal-management and air-conditioning systems to protect battery operation.",
    symptoms: "Reduced electric range, charging limits, A/C failure, battery-temperature messages, or electric mode unavailable in heat.", typicalMileage: "Condition and climate dependent.",
    preventativeAction: "Treat A/C and hybrid cooling faults as battery-protection issues and use a hybrid-qualified shop.",
    sources: [issueSource("330e owner guidance on A/C and battery cooling", "https://www.reddit.com/r/F30/comments/sfiki0", "Owner discussion used as a community signal, not factory procedure.", "r/F30")],
  },
  {
    slug: "330e-charge-lock-12v", system: "Electrical", issue: "330e charge-port lock and 12-volt battery faults", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B48-PHEV"] },
    description: "A weak 12-volt battery, charge-flap actuator, or locking fault can mimic a larger charging-system failure.",
    symptoms: "Cable will not lock or release, charge door will not operate, multiple low-voltage warnings, or intermittent failure to initiate charging.", typicalMileage: "Age and battery-condition dependent.",
    preventativeAction: "Test the 12-volt battery and scan body/charging modules before replacing high-voltage parts.",
    sources: [issueSource("330e unable-to-charge diagnostic discussion", "https://www.reddit.com/r/BmwTech/comments/14d36ui", "Community troubleshooting patterns requiring proper scan confirmation.", "r/BmwTech")],
  },
  {
    slug: "b48-coolant-housing", system: "Cooling", issue: "B48 coolant vent lines and filter-housing leaks", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B48-PHEV"] },
    description: "Plastic coolant connections and the oil-filter-housing area can develop leaks with heat cycles.",
    symptoms: "Low-coolant warning, sweet odor, dried coolant residue, or wetness below the intake side of the engine.", typicalMileage: "Age and heat-cycle dependent.",
    preventativeAction: "Pressure-test unexplained loss and inspect plastic connectors before a small seep becomes an overheat event.",
    sources: [issueSource("B48 coolant-hose failure patterns", "https://www.reddit.com/r/F30/comments/1cckw4p", "Recurring owner reports used to define an inspection item.", "r/F30")],
  },
  {
    slug: "b58-oil-filter-housing", system: "Cooling", issue: "B58 plastic oil-filter housing coolant leak", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B58"] },
    description: "The first-generation B58 housing contains coolant passages and can leak in a labor-intensive location.",
    symptoms: "Low coolant, dried residue under the intake manifold, coolant odor, or pressure-test loss with no obvious hose leak.", typicalMileage: "Age and heat-cycle dependent; often discussed on higher-mileage first-generation B58s.",
    preventativeAction: "Track coolant level, pressure-test loss early, and confirm the leak source before authorizing housing replacement.",
    sources: [{ type: "Community consensus", title: "BMW B58 engine service catalog and common failures", publisher: "FCP Euro", url: "https://www.fcpeuro.com/BMW-parts/b58-engine/", note: "Independent specialist overview of common first-generation B58 leak and service areas." }],
  },
  {
    slug: "b58-heat-management", system: "Cooling", issue: "B58 heat-management module", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B58"] },
    description: "The module and its plastic coolant connections can leak or control temperature incorrectly.",
    symptoms: "Coolant loss, slow warm-up, over-temperature warning, temperature-control faults, or residue near the front/side of the engine.", typicalMileage: "Condition dependent and increasingly relevant with age.",
    preventativeAction: "Pressure-test, scan thermal-management faults, and inspect adjacent hoses before replacing parts.", sources: [{ type: "Community consensus", title: "BMW B58 engine service catalog and common failures", publisher: "FCP Euro", url: "https://www.fcpeuro.com/BMW-parts/b58-engine/", note: "Specialist failure overview." }],
  },
  {
    slug: "b58-water-pump", system: "Cooling", issue: "B58 mechanical water pump", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B58"] },
    description: "The belt-driven pump can seep or develop bearing wear as mileage accumulates.",
    symptoms: "Coolant residue, chirp or bearing noise, low-coolant warning, or temperature problems.", typicalMileage: "Specialists commonly flag inspection around 100,000 miles and beyond, without treating it as a fixed failure point.",
    preventativeAction: "Inspect for seepage and shaft/bearing symptoms during belt service; replace based on confirmed condition.", sources: [{ type: "Community consensus", title: "BMW B58 engine service catalog and common failures", publisher: "FCP Euro", url: "https://www.fcpeuro.com/BMW-parts/b58-engine/", note: "Independent specialist guidance." }],
  },
  {
    slug: "b58-valve-cover-pcv", system: "Engine", issue: "B58 valve cover, gasket, and PCV diaphragm", severity: "important", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["B58"] },
    description: "Oil sealing and the integrated pressure-control system can cause leaks, whistle, smoke, or mixture problems.",
    symptoms: "Whistle, rough idle, smoke after idle, oil around the cover, or crankcase-pressure faults.", typicalMileage: "Age and heat-cycle dependent.",
    preventativeAction: "Test crankcase pressure and inspect the complete cover before choosing a diaphragm-only or full-cover repair.", sources: [{ type: "Community consensus", title: "BMW B58 engine service catalog and common failures", publisher: "FCP Euro", url: "https://www.fcpeuro.com/BMW-parts/b58-engine/", note: "Includes first-generation PCV and valve-cover failure context." }],
  },
  {
    slug: "b58-fueling-ignition", system: "Fuel & ignition", issue: "B58 injectors, high-pressure pump, plugs, and coils", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B58"] },
    description: "High-load misfires or rail-pressure faults require structured diagnosis across ignition, injection, and fuel supply.",
    symptoms: "Cold-start shake, fuel smell, long crank, misfire under boost, or rail-pressure faults.", typicalMileage: "Condition and calibration dependent.",
    preventativeAction: "Use BMW-specific fault data and cylinder testing; do not replace injectors or the pump without confirming the failure.", sources: [{ type: "Community consensus", title: "B58 common-issue owner discussion", publisher: "F30Post", url: "https://f30.bimmerpost.com/forums/showthread.php?t=1796289", note: "Recurring owner reports cross-checked against specialist guidance." }],
  },
  {
    slug: "f30-thrust-arm-bushings", system: "Suspension", issue: "Front thrust-arm hydro-bushings", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "The fluid-filled front tension-strut bushings can split or leak, reducing stability under braking.",
    symptoms: "Brake shimmy, clunk when braking or reversing, wandering, vague steering, or dark oily residue at the bushing.", typicalMileage: "Often relevant from 50,000–100,000 miles, sooner on rough roads.",
    preventativeAction: "Inspect for leakage and play during every tire or brake service and align the car after replacement.",
    sources: [issueSource("F30 thrust-arm bushing owner inspection", "https://f30.bimmerpost.com/forums/showthread.php?t=1750820", "Recurring chassis wear pattern across F30 variants.")],
  },
  {
    slug: "f30-steering-rack-thrust", system: "Steering", issue: "Electric steering-rack thrust-piece clunk", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Wear or preload at the rack thrust piece can create a knock that is easily confused with suspension play.",
    symptoms: "Knock over small bumps, clunk while rocking the wheel at a stop, or noise near the driver's front footwell.", typicalMileage: "Condition dependent; reported across model years and mileages.",
    preventativeAction: "Have steering and suspension play diagnosed before ordering a rack; BMW offers a rack-specific repair part for certain applications.",
    sources: [issueSource("Steering knocking and thrust-piece diagnosis", "https://f30.bimmerpost.com/forums/showthread.php?t=1609631", "Owner diagnostic thread documenting the rack thrust-piece pattern.")],
  },
  {
    slug: "f30-parking-brake-clip", system: "Driveline", issue: "Parking-brake cable retainer above driveshaft", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "A plastic cable retainer can break and allow the parking-brake cables to contact the rotating driveshaft.",
    symptoms: "Metallic scraping, rhythmic rattle, or tapping under the center console that changes with road speed or acceleration.", typicalMileage: "Age and heat-cycle dependent.",
    preventativeAction: "Inspect the cable routing promptly; correct contact before the cable jacket is damaged.", sources: [issueSource("F30 parking-brake cable retainer reports", "https://f30.bimmerpost.com/forums/showthread.php?t=1503426", "Model-wide buyer and owner inspection context.")],
  },
  {
    slug: "f30-guibo-center-bearing", system: "Driveline", issue: "Flex disc and driveshaft center support", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Rubber driveline couplings and support bearings deteriorate with age, heat, and torque cycles.",
    symptoms: "Clunk taking up drive, vibration under acceleration, shudder, or cracked rubber visible at the flex disc.", typicalMileage: "Typically a higher-mileage or age-related inspection item.",
    preventativeAction: "Inspect with the underbody safely supported and distinguish it from differential mounts or the parking-brake cable clip.", sources: [F30_BUYER],
  },
  {
    slug: "f30-wheel-bearings", system: "Chassis", issue: "Wheel-bearing wear", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Bearing noise can be mistaken for tire roar and may change as the car is gently loaded side to side.",
    symptoms: "Speed-related hum or growl, roughness, or play found during inspection.", typicalMileage: "Road-impact, wheel/tire, and mileage dependent.",
    preventativeAction: "Inspect tire wear first, then confirm the bearing location professionally before replacement.", sources: [F30_BUYER],
  },
  {
    slug: "f30-sway-links-strut-mounts", system: "Suspension", issue: "Sway-bar links, strut mounts, and damper wear", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Several front-end wear points can produce similar low-speed rattles, making physical diagnosis essential.",
    symptoms: "Rattle over broken pavement, bounce, cupped tires, leaking damper, or noise while steering.", typicalMileage: "Often increasingly relevant after 60,000 miles or repeated pothole impacts.",
    preventativeAction: "Inspect as a system and avoid replacing multiple parts solely from a sound recording.", sources: [issueSource("F30 low-speed suspension rattle diagnosis", "https://f30.bimmerpost.com/forums/showthread.php?t=1800060", "Recurring owner diagnostic path across links, mounts, dampers, and steering rack.")],
  },
  {
    slug: "f30-engine-trans-mounts", system: "Mounts", issue: "Engine and transmission mount collapse", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Hydraulic and rubber mounts settle with time, increasing vibration and driveline movement.",
    symptoms: "Cabin vibration at idle, thump during shifts, excessive engine movement, or vibration that changes in gear.", typicalMileage: "Often a higher-mileage age item, accelerated by fluid leaks and heat.",
    preventativeAction: "Inspect all mounts and rule out misfires or driveline faults before replacement.", sources: [F30_BUYER],
  },
  {
    slug: "f30-oil-pan-gasket", system: "Engine", issue: "Oil-pan gasket seepage", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26", "N47T", "B48-PHEV", "B58"] },
    description: "The pan seal can seep with age; repair labor differs sharply between RWD and xDrive because of front-driveline packaging.",
    symptoms: "Oil along the pan seam, wet undertray, drops after parking, or oil smell.", typicalMileage: "Age and heat-cycle dependent.",
    preventativeAction: "Clean and confirm the highest leak source before approving a pan reseal; use the profile's drivetrain to estimate labor correctly.", sources: [F30_BUYER],
  },
  {
    slug: "f30-battery-registration", system: "Electrical", issue: "12-volt battery aging and registration", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "A weak battery can create unrelated-looking warnings. Replacement batteries must match the charging strategy and be registered to the car.",
    symptoms: "Slow crank, discharge warning, comfort features disabled, multiple intermittent faults, or low resting voltage.", typicalMileage: "Commonly age related around 4–7 years, highly climate dependent.",
    preventativeAction: "Load-test the battery, check charging and sleep current, match type/capacity, and register the replacement.", sources: [F30_BUYER, STARTMYCAR_328],
  },
  {
    slug: "f30-wheel-speed-sensors", system: "Electrical", issue: "Wheel-speed sensor and reluctor faults", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "A wheel-speed signal fault can disable ABS, stability control, cruise control, and other dependent systems.",
    symptoms: "ABS/DSC warning cluster, cruise unavailable, speed-signal codes, or intermittent warnings after rain or wheel work.", typicalMileage: "Condition and corrosion dependent.",
    preventativeAction: "Scan live wheel speeds and inspect wiring, sensor seating, bearing play, and reluctor condition before replacing the sensor.", sources: [F30_BUYER],
  },
  {
    slug: "f30-water-vapor-barrier", system: "Body", issue: "Door vapor-barrier water leak", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Butyl sealing around the foam door barrier can release and route rainwater onto the sill and carpet.",
    symptoms: "Wet front or rear footwell after rain, water at the door-sill trim, damp odor, or visible flow behind a door card.", typicalMileage: "Age, previous door work, and climate dependent.",
    preventativeAction: "Water-test the specific door, reseal with the correct material, clear door drains, and dry the carpet fully to protect electronics and prevent mold.",
    sources: [issueSource("F30 rainwater leak and vapor-barrier repair", "https://f30.bimmerpost.com/forums/showthread.php?t=1762975", "Repeated owner confirmation of loose vapor-barrier sealing.")],
  },
  {
    slug: "f30-sunroof-drains", system: "Body", issue: "Sunroof drain restriction or disconnection", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "The sunroof tray depends on open, connected drains; forced compressed air can disconnect a tube inside a pillar.",
    symptoms: "Wet headliner or pillars, water in a footwell, sloshing, or overflow during a controlled drain test.", typicalMileage: "Environment dependent; trees and debris accelerate blockage.",
    preventativeAction: "Test drains gently, clear with a safe flexible method, and avoid high pressure that can detach a hose.", sources: [issueSource("F30 water-leak owner diagnosis", "https://f30.bimmerpost.com/forums/showthread.php?t=1762975", "Separates sunroof drains from the frequently confused door barrier leak.")],
  },
  {
    slug: "f30-ac-evaporator", system: "Climate", issue: "A/C refrigerant leak and evaporator diagnosis", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Loss of cooling can originate in service valves, condenser, lines, compressor, or the dashboard-mounted evaporator; the expensive location must be confirmed.",
    symptoms: "Weak or warm A/C, repeated refrigerant loss, dye at drains or components, or pressure-test failure.", typicalMileage: "Age and leak-source dependent.",
    preventativeAction: "Require a documented leak test before authorizing evaporator or compressor replacement. For a 330e, treat A/C failure as hybrid thermal-management relevant.", sources: [F30_BUYER],
  },
  {
    slug: "f30-headlight-moisture", system: "Lighting", issue: "Headlamp moisture and module damage", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Persistent water entry can damage adaptive-light or LED control modules; light temporary condensation is different from standing water.",
    symptoms: "Droplets that remain, pooled water, adaptive-headlight warning, flicker, or corroded module connectors.", typicalMileage: "Seal, vent, impact, and prior-repair dependent.",
    preventativeAction: "Inspect caps, vents, lens seams, and housing damage before replacing electronics.", sources: [F30_BUYER],
  },
  {
    slug: "f30-sticky-handles-trim", system: "Interior", issue: "Soft-touch door pulls and trim aging", severity: "routine", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Soft-touch coatings can become sticky or peel. It is cosmetic and should stay below mechanical work in the plan.",
    symptoms: "Tacky door pull, peeling finish, or degraded trim surface.", typicalMileage: "Age, heat, and cleaning-product dependent.",
    preventativeAction: "Use a quality replacement insert or refinishing approach after safety and maintenance work are funded.", sources: [F30_BUYER],
  },
  {
    slug: "xdrive-tire-mismatch", system: "xDrive", issue: "Tire circumference mismatch and transfer-case stress", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { drivetrains: ["xDrive"] },
    description: "Mismatched brands, sizes, wear, or inflation can keep the xDrive clutch working continuously and cause shudder or wear.",
    symptoms: "Binding or shudder on low-speed turns, drivetrain faults, uneven tire wear, or mismatched tread depths.", typicalMileage: "Can begin immediately after an incompatible tire replacement.",
    preventativeAction: "Keep all four tires compatible in specified size and closely matched circumference; diagnose shudder before replacing the transfer case.", sources: [F30_BUYER],
  },
  {
    slug: "rwd-rear-axle-seals", system: "Driveline", issue: "Rear differential and axle-seal leaks", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { drivetrains: ["RWD"] },
    description: "A RWD car avoids the front differential and transfer case but still needs rear final-drive and output-seal inspection.",
    symptoms: "Gear-oil smell, wet output flange, fluid on the rear underbody, or differential whine.", typicalMileage: "Age, impact, vent, and mileage dependent.",
    preventativeAction: "Inspect at each rear-differential service and confirm the source before replacing seals.", sources: [F30_BUYER],
  },
];

export const KNOWN_ISSUES = issues;

export const PROJECT_IDEAS: ProjectIdea[] = [
  { slug: "tires", title: "Replace aging run-flats with a quality tire setup", description: "A fresh, correctly sized tire is often the biggest ride, grip, and noise improvement on an F30.", payoff: "Ride · grip · confidence", appliesTo: {} },
  { slug: "suspension-refresh", title: "Refresh dampers and tired bushings as a system", description: "Restore the chassis before adding stiffness. Pair confirmed wear items with an alignment instead of chasing noises part by part.", payoff: "Control · comfort", appliesTo: {} },
  { slug: "carplay", title: "Add a reversible CarPlay / Android Auto interface", description: "A model-year-correct interface can modernize navigation and audio without turning the dashboard into an aftermarket science project.", payoff: "Daily usability", appliesTo: {} },
  { slug: "charge-pipe", title: "Upgrade the plastic charge path", description: "A well-fitting metal charge pipe is a popular preventative project after the maintenance baseline is current.", payoff: "Reliability · response", appliesTo: { engines: ["N20", "N26", "B58"] } },
  { slug: "rwd-lsd", title: "Plan a limited-slip differential", description: "For a RWD enthusiast build, a professionally selected LSD can add usable traction without pretending it is required maintenance.", payoff: "Traction · balance", appliesTo: { drivetrains: ["RWD"], engines: ["N20", "N26", "B58"] } },
  { slug: "brake-feel", title: "Dial in brake feel", description: "Fresh correct fluid, healthy rubber, quality street pads, and good tires come before larger calipers.", payoff: "Pedal feel · confidence", appliesTo: {} },
];

export function getCatalogItem(slug: string) {
  return MAINTENANCE_CATALOG.find((item) => item.slug === slug);
}
