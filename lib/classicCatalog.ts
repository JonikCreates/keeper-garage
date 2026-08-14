import type { CatalogSource, KnownIssue, MaintenanceCatalogItem, VehicleProfile } from "./catalog";

type Severity = MaintenanceCatalogItem["severity"];

const BMW_SERVICE: CatalogSource = {
  type: "OEM",
  title: "BMW Service and Maintenance technical training",
  publisher: "BMW Technical Training",
  url: "https://ia600902.us.archive.org/26/items/BMWTechnicalTrainingDocuments/ST050%20Technical%20Systems%20%28Archive%201%29/Service%20and%20Maintenance.pdf",
  note: "Period BMW service logic, inspection checklists, and maintenance context.",
};

const BMW_E46_CHECKLIST: CatalogSource = {
  type: "OEM",
  title: "BMW maintenance checklist — SIB 00 01 05",
  publisher: "BMW of North America",
  url: "https://bmwrepairguide.com/sib/000105.pdf",
  note: "Period E46-family checklist and service intervals.",
};

const BMW_E39_MANUALS: CatalogSource = {
  type: "OEM",
  title: "BMW E39 owner manuals",
  publisher: "BMW owner-manual archive",
  url: "https://www.bmwsections.com/docs/5series/",
  note: "Model-year owner information and inspection context.",
};

const MILLER_SCHEDULE: CatalogSource = {
  type: "Community consensus",
  title: "Old School BMW Maintenance Schedule",
  publisher: "Mike Miller / BMW CCA",
  url: "https://www.1addicts.com/forums/attachment.php?attachmentid=1461518&d=1469006598",
  note: "Conservative independent interval layer kept separate from BMW requirements.",
};

const BMW_CLASSIC: CatalogSource = {
  type: "OEM",
  title: "BMW Group Classic parts and vehicle information",
  publisher: "BMW Group Classic",
  url: "https://www.bmwgroup-classic.com/en/services/spare-parts/bmw.html",
  note: "Engine and component-family reference for classic BMW applications.",
};

const E46_REAR_AXLE: CatalogSource = {
  type: "OEM",
  title: "E46 rear axle support inspection and repair — SIB 41 01 09",
  publisher: "BMW of North America",
  url: "https://bmwrepairguide.com/sib/410109.pdf",
  note: "BMW inspection and repair procedure for rear axle carrier panel damage.",
};

const E46_M56: CatalogSource = {
  type: "OEM",
  title: "M56 SULEV fuel tank limited warranty extension",
  publisher: "BMW of North America / NHTSA",
  url: "https://static.nhtsa.gov/odi/tsbs/2020/MC-10181217-9999.pdf",
  note: "Coverage and component context for the sealed M56 fuel-tank system.",
};

const E46_ROD_BEARINGS: CatalogSource = {
  type: "OEM",
  title: "S54 connecting-rod bearing service action — SIB 11 04 04",
  publisher: "BMW of North America",
  url: "https://bmwrepairguide.com/sib/110404.pdf",
  note: "Production and campaign context for affected E46 M3 engines.",
};

const E46_SMG: CatalogSource = {
  type: "OEM",
  title: "E46 M3 SMG diagnosis — SIB 23 05 06",
  publisher: "BMW of North America",
  url: "https://bmwrepairguide.com/sib/230506.pdf",
  note: "BMW diagnostic context for SMG warning and hydraulic faults.",
};

const E39_TRANSMISSIONS: CatalogSource = {
  type: "OEM",
  title: "BMW transmission fluid application chart — SD92-113",
  publisher: "BMW technical information",
  url: "https://www.ge39.com/files/SD92-113.pdf",
  note: "Transmission identification, approved-fluid, and capacity context.",
};

const E39_VANOS: CatalogSource = {
  type: "OEM",
  title: "M62TU VANOS technical information — SIB 04 12 98",
  publisher: "BMW of North America",
  url: "https://bmwrepairguide.com/sib/041298.pdf",
  note: "BMW technical context for VANOS-equipped E39 V8 engines.",
};

function intervalLabel(mileage: number | null, months: number | null) {
  const parts = [];
  if (mileage) parts.push(`${mileage.toLocaleString("en-US")} mi`);
  if (months) parts.push(`${months} mo`);
  return parts.join(" / ") || "Condition / history";
}

function service(
  platform: "E39" | "E46",
  slug: string,
  name: string,
  category: string,
  severity: Severity,
  mileage: number | null,
  months: number | null,
  detail: string,
  sources?: CatalogSource[],
): MaintenanceCatalogItem {
  const platformSource = platform === "E46" ? BMW_E46_CHECKLIST : BMW_E39_MANUALS;
  const label = intervalLabel(mileage, months);
  return {
    slug: `${platform.toLowerCase()}-${slug}`,
    name,
    shortName: name,
    category,
    severity,
    appliesTo: { platforms: [platform] },
    description: detail,
    oem: {
      mileage: null,
      months: null,
      label: "BMW service / condition",
      summary: "BMW service information, the vehicle service indicator, component condition, and exact production configuration remain controlling.",
    },
    community: {
      mileage,
      months,
      label,
      summary: mileage || months
        ? `The supplied ${platform} schedule uses ${label} as a conservative tracking point; age, history, and observed condition can justify earlier work.`
        : `The supplied ${platform} schedule keeps this condition-based because no reliable mileage-only replacement rule applies.`,
    },
    parts: [{ name: "VIN-matched service parts", partNumber: null, note: "Verify production date, installed equipment, component labels, fluid approval, and part supersessions." }],
    sources: sources ?? [platformSource, BMW_SERVICE, MILLER_SCHEDULE],
    diy: [
      detail,
      "Confirm the exact VIN, production date, and installed component before ordering parts or fluid.",
      "Record the date, mileage, parts, cost, and findings so the next service decision is based on history.",
    ],
  };
}

const coreRows: Array<[string, string, string, Severity, number | null, number | null, string]> = [
  ["oil-filter", "Engine oil & filter", "Engine", "critical", 7500, 12, "Use the engine-specific BMW oil approval and capacity; S54 applications require their specified 10W-60 oil."],
  ["brake-fluid", "Brake fluid", "Brakes", "critical", null, 24, "Flush with fresh DOT 4 fluid and inspect the complete brake system."],
  ["air-filter", "Engine air filter", "Engine", "routine", 30000, null, "Inspect sooner in dusty use and keep debris out of the intake while servicing."],
  ["microfilter", "Cabin microfilter", "Climate", "routine", 30000, 12, "Shorten the interval in dusty, humid, leafy, or high-pollen conditions."],
  ["fuel-filter", "Fuel filter", "Fuel", "important", 60000, null, "Match the filter or regulator configuration to the exact VIN."],
  ["differential-fluid", "Differential fluid", "Driveline", "important", 30000, null, "Identify the installed final drive and limited-slip requirements before choosing fluid."],
  ["spark-plugs", "Spark plugs", "Ignition", "important", 60000, null, "Use the exact OE plug specification and diagnose recurring misfires rather than replacing parts blindly."],
  ["oxygen-sensors", "Oxygen sensors", "Emissions", "important", 120000, null, "Use faults and mixture diagnosis alongside the BMW mileage context."],
  ["belts", "Engine & A/C serpentine belts", "Engine", "critical", 60000, null, "Inspect for cracking, glazing, fraying, pulley alignment, and fluid contamination."],
  ["tensioners", "Belt tensioners & roller pulleys", "Engine", "critical", 60000, null, "Check bearing roughness, play, noise, drag, and tensioner travel whenever belts are removed."],
  ["coolant", "Engine coolant", "Cooling", "critical", null, 24, "Use BMW-compatible coolant and complete the engine-specific bleed procedure."],
  ["power-steering-fluid", "Power steering fluid", "Steering", "important", 30000, null, "The reservoir-cap label controls fluid selection; inspect hoses and reservoir at the same visit."],
  ["water-pump", "Water pump", "Cooling", "critical", 60000, null, "Age and history matter as much as mileage on the composite-heavy cooling system."],
  ["thermostat", "Thermostat", "Cooling", "critical", 60000, null, "Investigate warm-up, regulation, and mapped-thermostat faults before an overheat event."],
  ["thermostat-housing", "Plastic thermostat housing", "Cooling", "critical", 60000, null, "Inspect the engine-specific housing or assembly for age cracks and leakage."],
  ["radiator", "Radiator", "Cooling", "critical", 90000, null, "Inspect plastic necks, end tanks, seams, mounts, and staining."],
  ["expansion-tank", "Expansion tank", "Cooling", "critical", 90000, null, "Inspect seams, hose necks, cap sealing, sensor areas, and unexplained level changes."],
  ["fan-clutch", "Mechanical fan & fan clutch", "Cooling", "critical", 90000, null, "Cracked blades, hub play, or an incorrect clutch can damage the cooling system and nearby parts."],
  ["hoses", "Coolant & fuel hoses", "Inspection", "critical", 150000, null, "Age, hardening, swelling, cracking, and service history can justify replacement far earlier than the mileage marker."],
  ["intake-vacuum", "Intake boots & vacuum lines", "Engine", "important", null, 12, "Flex boots and smoke-test persistent mixture faults to find hidden unmetered-air leaks."],
  ["chassis", "Chassis, bushings, ball joints & wheel bearings", "Chassis", "critical", 30000, 12, "Inspect the chassis as a system and measure play instead of diagnosing only by noise."],
  ["brake-system", "Brake system", "Brakes", "critical", 30000, 12, "Pads, rotors, hoses, lines, parking brake, leakage, and pedal feel remain condition-based safety items."],
  ["ignition-coils", "Ignition coils & coil boots", "Ignition", "important", 60000, null, "Treat this as an inspection and diagnostic checkpoint, not automatic replacement of working coils."],
];

function coreCatalog(profile: VehicleProfile) {
  const platform = profile.platform as "E39" | "E46";
  const automatic = profile.transmission.includes("automatic");
  const smg = profile.transmission.includes("SMG");
  const transmission = smg
    ? service(platform, "smg-fluid", "SMG gearbox fluid", "Driveline", "important", 30000, null, "The SMG uses a 420G-based gearbox plus a separate hydraulic actuation system; identify both service circuits.", [E46_SMG, MILLER_SCHEDULE])
    : service(
        platform,
        automatic ? "automatic-transmission" : "manual-transmission",
        automatic ? "Automatic transmission fluid & filter" : "Manual transmission fluid",
        "Driveline",
        "important",
        automatic ? 60000 : 30000,
        null,
        "The transmission tag, approved fluid, fill temperature, and level procedure are controlling.",
        platform === "E39" ? [E39_TRANSMISSIONS, MILLER_SCHEDULE] : [BMW_SERVICE, MILLER_SCHEDULE],
      );
  const linkage = service(
    platform,
    automatic ? "selector-driveline" : "shifter-driveline",
    automatic ? "Selector linkage, driveshaft guibo, CV joints & center support bearing" : "Shifter linkage, driveshaft guibo, CV joints & center support bearing",
    "Driveline",
    "critical",
    30000,
    null,
    "Inspect linkage, flex disc, center support, CV joints or boots, mounts, play, leakage, and vibration.",
  );
  const rows = coreRows.map(([slug, name, category, severity, mileage, months, detail]) => service(platform, slug, name, category, severity, mileage, months, detail));
  return [...rows.slice(0, 5), transmission, ...rows.slice(5, 22), linkage, rows[22]];
}

function extra(platform: "E39" | "E46", slug: string, name: string, category: string, severity: Severity, mileage: number | null, months: number | null, detail: string, sources?: CatalogSource[]) {
  return service(platform, slug, name, category, severity, mileage, months, detail, sources);
}

const E46_PLATFORM_EXTRAS = [
  extra("E46", "rear-axle-carrier", "Rear axle carrier panel / rear axle support", "Structure", "critical", 30000, 12, "Inspect mounting points for cracks, popped spot welds, separation, movement, or prior repair.", [E46_REAR_AXLE]),
  extra("E46", "front-control-arms", "Front control arm bushings & front ball joints", "Chassis", "critical", 30000, null, "Inspect hydraulic bushings, ball joints, braking shimmy, looseness, and alignment changes."),
  extra("E46", "rear-bushings", "Rear trailing arm bushings & rear shock mounts", "Chassis", "critical", 30000, null, "Inspect for rear steer, clunks, torn mounts, cracked pockets, and uneven tire wear."),
  extra("E46", "aux-fan", "Auxiliary electric cooling fan", "Cooling", "critical", null, 12, "Function-test fan activation and speed control because it supports both A/C and engine cooling."),
  extra("E46", "mounts", "Engine & transmission mounts", "Driveline", "important", 60000, null, "Inspect collapse, separation, excessive drivetrain movement, and vibration."),
  extra("E46", "window-regulators", "Window regulators & door glass mechanisms", "Body", "routine", null, null, "Listen for cable noise and address slow, tilted, dropped, or binding glass before it strands the window."),
];

const E46_I6_EXTRAS = [
  extra("E46", "ccv", "Crankcase ventilation / CCV / oil separator", "Engine", "important", null, null, "Inspect for vacuum faults, cold-weather blockage, oil use, mixture faults, and brittle hoses."),
  extra("E46", "vanos", "VANOS system / seals", "Engine", "important", null, null, "Use timing faults, torque loss, rattle, and diagnosis to guide repair rather than a mileage-only rule."),
  extra("E46", "disa", "DISA / intake resonance valve", "Intake", "important", null, null, "Inspect the flap, pivot, seal, and actuator for looseness, leakage, and noise."),
  extra("E46", "valve-cover", "Valve cover gasket & spark-plug-well seals", "Engine", "important", null, null, "Inspect the perimeter and plug wells for oil, smoke, odor, and ignition contamination."),
  extra("E46", "oil-filter-housing", "Oil filter housing gasket & adjacent oil-line leaks", "Engine", "critical", null, null, "Oil near the belt drive deserves prompt diagnosis and cleanup after repair."),
  extra("E46", "secondary-air", "Secondary-air system", "Emissions", "routine", null, null, "Diagnose cold-start flow faults before replacing pumps, valves, hoses, or addressing blocked passages."),
];

const E46_AWD_EXTRAS = [
  extra("E46", "front-differential", "Front differential fluid", "Driveline", "important", 30000, null, "Verify the xi front differential and approved gear oil before service."),
  extra("E46", "transfer-case", "Transfer case fluid", "Driveline", "critical", 30000, null, "Use the NV124-specific approved fluid and keep tire circumferences closely matched."),
  extra("E46", "front-axles", "Front axle shafts & CV boots (xi)", "Driveline", "critical", 30000, null, "Inspect inner and outer boots, joints, clamps, leakage, clicking, and vibration."),
];

const E46_M3_EXTRAS = [
  extra("E46", "m3-break-in", "M3 1,200-mile break-in service", "Service history", "critical", 1200, null, "Confirm the documented break-in engine-oil, transmission, and differential service in the car's history.", [BMW_SERVICE]),
  extra("E46", "s54-valves", "S54 valve clearance adjustment", "Engine", "critical", 30000, null, "Measure and adjust clearances on a cold engine using the S54 procedure."),
  extra("E46", "s54-vanos", "S54 VANOS, exhaust hub & cam-sprocket hardware", "Engine", "critical", null, null, "Inspect for tab damage, hardware movement, timing faults, rattle, and prior upgrade history."),
  extra("E46", "s54-rod-bearings", "S54 connecting-rod bearing service-action status", "Engine", "critical", null, null, "Verify VIN and documentation for the BMW service action before drawing conclusions from model year alone.", [E46_ROD_BEARINGS]),
  extra("E46", "s54-ccv", "S54 crankcase ventilation / oil separator", "Engine", "important", null, null, "Inspect separator function, hoses, vacuum behavior, and oil-consumption history."),
  extra("E46", "s54-oil-leaks", "S54 valve cover gasket & CPV / engine oil leaks", "Engine", "critical", null, null, "Inspect common leak paths and keep oil away from the exhaust and belt drive."),
  extra("E46", "m3-rear-bushings", "M3 differential mounts & rear subframe bushings", "Driveline", "critical", 30000, null, "Inspect mounts, bushings, rear structure, leakage, and driveline movement."),
  extra("E46", "m3-clutch", "Clutch & dual-mass flywheel", "Driveline", "important", null, null, "Track slip, engagement, release noise, vibration, and replacement history."),
  extra("E46", "m3-secondary-air", "Secondary-air / emissions system", "Emissions", "routine", null, null, "Diagnose cold-start and emissions faults before replacing components."),
];

function e46Catalog(profile: VehicleProfile) {
  if (profile.engineCode === "S54B32") {
    const convertibleTrackingRow = extra("E46", "convertible-top", "Convertible top hydraulics, tension components & drains", "Body", "important", null, 12, "The workbook keeps the M3 convertible body-system row visible; coupe owners can mark it not equipped." );
    const smg = profile.transmission.includes("SMG")
      ? [extra("E46", "smg-hydraulics", "SMG hydraulic pump, relay, accumulator & hydraulic unit", "Driveline", "critical", null, null, "Diagnose pressure, relay, pump, accumulator, temperature, adaptation, and wiring before replacing assemblies.", [E46_SMG])]
      : [];
    return [...coreCatalog(profile), ...E46_PLATFORM_EXTRAS, convertibleTrackingRow, ...E46_M3_EXTRAS, ...smg];
  }

  const engineExtras = profile.engineCode === "M56B25"
    ? [
        ...E46_I6_EXTRAS.slice(1),
        extra("E46", "m56-fuel-tank", "M56 SULEV sealed fuel tank / pump system", "Fuel", "critical", null, null, "Verify emissions label and applicable warranty coverage before authorizing sealed-tank work.", [E46_M56]),
        extra("E46", "m56-cylinder-cover", "M56 crankcase-ventilation / cylinder-head-cover system", "Engine", "important", null, null, "Treat the M56 cylinder-head-cover and ventilation system as a distinct configuration."),
      ]
    : E46_I6_EXTRAS;
  const bodyExtras = profile.trim.endsWith("Cic")
    ? [extra("E46", "convertible-top", "Convertible top hydraulics, tension components & drains", "Body", "important", null, 12, "Inspect hydraulic leakage, latches, tension components, seals, storage well, and drains.")]
    : [];
  const awdExtras = profile.drivetrain === "AWD" ? E46_AWD_EXTRAS : [];
  return [...coreCatalog(profile), ...E46_PLATFORM_EXTRAS, ...bodyExtras, ...engineExtras, ...awdExtras];
}

const E39_PLATFORM_EXTRAS = [
  extra("E39", "mounts", "Engine & transmission mounts", "Driveline", "important", 60000, null, "Inspect collapse, excess engine movement, fan clearance, shift disturbance, and vibration."),
  extra("E39", "aux-fan", "Auxiliary electric cooling fan", "Cooling", "critical", null, 12, "Function-test fan activation and speed control because it supports both A/C and engine cooling."),
  extra("E39", "thrust-arms", "Front thrust arms / tension-strut bushings", "Chassis", "critical", 30000, null, "Inspect hydraulic bushings, ball joints, braking shimmy, and looseness."),
  extra("E39", "rear-suspension", "Rear suspension ball joints / integral links / subframe bushings", "Chassis", "critical", 30000, null, "Inspect play, links, control arms, mounts, alignment, and tire-wear evidence."),
  extra("E39", "power-steering-hoses", "Power steering hoses & reservoir", "Steering", "important", 30000, null, "Inspect reservoir, clamps, hoses, pump area, rack boots, and the highest source of any leak."),
];

const E39_I6_EXTRAS = [
  extra("E39", "ccv", "Crankcase ventilation / CCV / oil separator", "Engine", "important", null, null, "Inspect for vacuum faults, cold-weather blockage, oil use, mixture faults, and brittle hoses."),
  extra("E39", "vanos", "VANOS system / seals", "Engine", "important", null, null, "Use timing faults, torque loss, rattle, and diagnosis to guide repairs."),
  extra("E39", "disa", "DISA / intake resonance flap", "Intake", "important", null, null, "Inspect the flap, pivot, seal, and actuator where fitted."),
  extra("E39", "valve-cover", "Valve cover gasket & plug-well seals", "Engine", "important", null, null, "Inspect the perimeter and plug wells for oil, smoke, odor, and ignition contamination."),
  extra("E39", "oil-filter-housing", "Oil filter housing gasket / oil-line leak inspection", "Engine", "critical", null, null, "Oil reaching belts and suspension bushings deserves prompt repair."),
];

const E39_V8_BASE = [
  extra("E39", "v8-ccv", "Crankcase ventilation / oil separator system", "Engine", "important", null, null, "Inspect the V8-specific separator, rear cover or diaphragm arrangement, hoses, and vacuum behavior."),
  extra("E39", "timing-guides", "Timing chain guides & chain tensioner", "Engine", "critical", null, null, "Track history and diagnose start-up rattle, timing faults, oil-filter debris, or guide damage; no mileage-only rule is assigned.", [BMW_CLASSIC, BMW_E39_MANUALS]),
  extra("E39", "v8-gaskets", "Valve cover gaskets & upper timing cover gaskets", "Engine", "critical", null, null, "Inspect cover perimeters, plug wells, timing-cover joints, smoke, and oil migration."),
];

function e39Catalog(profile: VehicleProfile) {
  const touring = profile.trim.endsWith("T");
  const touringExtra = touring
    ? [extra("E39", "touring-air-suspension", "Touring rear self-leveling air suspension", "Chassis", "critical", null, 12, "Inspect air springs, lines, compressor, height sensors, ride height, and overnight settling.")]
    : [];
  if (["M52B28", "M52TUB28", "M54B25", "M54B30"].includes(profile.engineCode)) {
    return [...coreCatalog(profile), ...E39_PLATFORM_EXTRAS, ...E39_I6_EXTRAS, ...touringExtra];
  }

  if (profile.engineCode === "S62B50") {
    return [
      ...coreCatalog(profile),
      ...E39_PLATFORM_EXTRAS,
      ...E39_V8_BASE,
      extra("E39", "v8-vanos", "VANOS system / solenoids", "Engine", "critical", null, null, "The S62 uses double VANOS; diagnose solenoids, timing behavior, seals, and faults before replacement.", [E39_VANOS]),
      extra("E39", "s62-coolant", "Valley / internal coolant leak inspection", "Cooling", "critical", null, null, "Diagnose hidden coolant loss using the S62 configuration rather than applying the M62 valley-pan wording."),
      extra("E39", "s62-mafs", "Mass-air-flow sensors (dual MAFs)", "Intake", "important", null, null, "Use live data, fuel trims, and bank comparison before replacing either of the two sensors."),
      extra("E39", "s62-throttles", "Individual throttle actuators / throttle system", "Engine", "critical", null, null, "Inspect linkage and actuation, read faults, and follow synchronization or adaptation procedures."),
      extra("E39", "s62-secondary-air", "Secondary-air / emissions system", "Emissions", "routine", null, null, "Diagnose pump, valve, hose, and passage faults before repair."),
      extra("E39", "m5-clutch", "Clutch & dual-mass flywheel", "Driveline", "important", null, null, "Track slip, engagement, release noise, vibration, and replacement history."),
      extra("E39", "m5-differential", "Differential mounts & seals", "Driveline", "critical", 30000, null, "Inspect limited-slip differential mounts, bushings, seals, leakage, and movement."),
    ];
  }

  const vanos = profile.engineCode === "M62TUB44"
    ? extra("E39", "v8-vanos", "VANOS system / solenoids", "Engine", "important", null, null, "The M62TU uses VANOS; diagnose rattle and cam-timing faults before repair.", [E39_VANOS])
    : extra("E39", "pre-tu-vanos", "VANOS system", "Engine", "routine", null, null, "Pre-TU M62 applications do not use VANOS; this row prevents M62TU work from being applied blindly.", [BMW_CLASSIC]);
  return [
    ...coreCatalog(profile),
    ...E39_PLATFORM_EXTRAS,
    ...E39_V8_BASE,
    vanos,
    extra("E39", "valley-pan", "Valley pan / valley-pan gasket", "Cooling", "critical", null, null, "Inspect for hidden coolant leakage in the M62 engine valley."),
    ...touringExtra,
  ];
}

// REVIEW DECISION: the workbooks are translated into exact equipment branches here instead of showing every aggregate worksheet row to every body style.
export function getClassicMaintenanceCatalog(profile: VehicleProfile) {
  if (profile.platform === "E46") return e46Catalog(profile);
  if (profile.platform === "E39") return e39Catalog(profile);
  return [];
}

function issue(platform: "E39" | "E46", slug: string, system: string, title: string, severity: KnownIssue["severity"], description: string, symptoms: string, action: string, sources: CatalogSource[], engines?: string[], trims?: string[], drivetrains?: string[], transmissions?: string[]): KnownIssue {
  return {
    slug: `${platform.toLowerCase()}-${slug}`,
    system,
    issue: title,
    description,
    symptoms,
    typicalMileage: "Age, service history, production configuration, and observed condition matter more than a universal failure mileage.",
    severity,
    urgency: "watch",
    evidence: sources.some((source) => /sib|tsbs|nhtsa/i.test(source.url)) ? "BMW bulletin" : "Community consensus",
    preventativeAction: action,
    appliesTo: { platforms: [platform], engines, trims, drivetrains, transmissions },
    sources,
  };
}

export const CLASSIC_KNOWN_ISSUES: KnownIssue[] = [
  issue("E46", "rear-carrier", "Structure", "Rear axle carrier panel cracking or separation", "critical", "The rear axle support area can crack or separate around its mounting points; BMW published a dedicated inspection and repair procedure.", "Rear clunk, alignment change, torn sheet metal, cracked seam sealer, popped welds, or visible movement around the mounts.", "Inspect the panel and mounting points before performance modifications; use the BMW repair procedure if damage is found.", [E46_REAR_AXLE]),
  issue("E46", "cooling-system", "Cooling", "Age-hardened cooling-system plastics", "critical", "Expansion tanks, radiator necks, thermostat assemblies, hoses, and related plastics can become brittle with age.", "Coolant odor, staining, repeat low level, crusted residue, temperature movement, cracks, or fan contact.", "Pressure-test unexplained loss, document component age, and stop immediately for overheating.", [BMW_E46_CHECKLIST, MILLER_SCHEDULE]),
  issue("E46", "front-control-arms", "Chassis", "Front control arm bushings and ball-joint wear", "critical", "Hydraulic bushings and ball joints can create braking shimmy, wandering, and geometry changes.", "Steering shake under braking, clunks, looseness, tramlining, or uneven tire wear.", "Inspect both sides as a system and align the car after confirmed repairs.", [BMW_SERVICE, MILLER_SCHEDULE]),
  issue("E46", "rear-bushings", "Chassis", "Rear trailing-arm bushings and rear shock mounts", "critical", "Rear suspension wear can create rear steer, clunks, torn mounts, and unstable alignment.", "Rear-end movement, toe change, clunks, torn trunk-area mounts, or abnormal rear tire wear.", "Inspect bushings, mounts, pockets, and surrounding structure before ordering isolated parts.", [BMW_SERVICE, MILLER_SCHEDULE]),
  issue("E46", "ccv", "Engine", "CCV / oil-separator and vacuum faults", "important", "Aged crankcase ventilation components can split, clog, or create incorrect crankcase vacuum.", "Whistle, rough idle, mixture faults, oil consumption, smoke, or cold-weather blockage.", "Smoke-test and measure crankcase behavior; use the M56-specific arrangement where applicable.", [BMW_E46_CHECKLIST, MILLER_SCHEDULE], ["M52TUB25", "M52TUB28", "M54B25", "M54B30", "M56B25"]),
  issue("E46", "vanos-disa", "Engine", "VANOS seal and DISA wear", "important", "Aged seals and intake-resonance components can reduce low-speed torque or create rattles and mixture leaks.", "Flat low-rpm response, rattle, intake noise, lean faults, or a loose DISA flap.", "Inspect and diagnose each system before repair; do not treat every drivability complaint as VANOS or DISA.", [BMW_CLASSIC, MILLER_SCHEDULE], ["M52TUB25", "M52TUB28", "M54B25", "M54B30", "M56B25"]),
  issue("E46", "window-regulators", "Body", "Window regulator and door-glass mechanism wear", "important", "Cable regulators and guides can become noisy, bind, tilt, or drop the glass.", "Crunching, slow glass, tilt, incomplete sealing, or a window dropping into the door.", "Stop cycling a binding window and inspect the regulator, guides, clips, and vapor barrier.", [BMW_SERVICE, MILLER_SCHEDULE]),
  issue("E46", "m56-tank", "Fuel", "M56 sealed fuel-tank / pump system", "critical", "M56 SULEV cars use a distinct sealed tank system with VIN-specific warranty history.", "Fuel odor, EVAP faults, tank leakage, pump faults, or an emissions-label mismatch.", "Confirm the M56 emissions label and VIN coverage before paying for tank replacement.", [E46_M56], ["M56B25"]),
  issue("E46", "s54-vanos", "Engine", "S54 VANOS, exhaust hub, and cam hardware", "critical", "The S54 valvetrain and VANOS area warrants model-specific inspection and documented repair history.", "Rattle, timing faults, power loss, damaged hub tabs, or loose cam-sprocket hardware.", "Use an S54 specialist inspection and document the exact findings and installed updates.", [BMW_CLASSIC, MILLER_SCHEDULE], ["S54B32"]),
  issue("E46", "s54-bearings", "Engine", "S54 connecting-rod bearing service-action status", "critical", "BMW issued a service action for defined E46 M3 production; coverage cannot be inferred from badge alone.", "Unknown campaign history, metallic debris, bearing noise, or low oil pressure.", "Verify VIN, production date, and campaign documentation; stop for oil-pressure or bearing-noise warnings.", [E46_ROD_BEARINGS], ["S54B32"]),
  issue("E46", "smg", "Driveline", "SMG hydraulic pump, relay, accumulator, or adaptation faults", "critical", "The SMG II system combines a 420G-based gearbox with electrohydraulic clutch and shift actuation.", "Cog warning, refusal to select gear, slow shifts, pressure faults, overheating, or intermittent neutral.", "Read BMW-specific faults and hydraulic pressure data before replacing the pump or hydraulic unit.", [E46_SMG], ["S54B32"], undefined, undefined, ["6-speed SMG II"]),
  issue("E39", "cooling-system", "Cooling", "Age-hardened cooling-system plastics and fan components", "critical", "Radiator necks, expansion tanks, thermostat housings, hoses, fan blades, and fan clutches require age-aware inspection.", "Coolant odor, staining, repeat low level, cracks, fan wobble, temperature movement, or fan contact.", "Pressure-test unexplained loss, inspect fan hardware, document component age, and stop immediately for overheating.", [BMW_E39_MANUALS, MILLER_SCHEDULE]),
  issue("E39", "thrust-arms", "Chassis", "Front thrust-arm bushing and ball-joint wear", "critical", "The E39 front tension struts are a key wear area and can affect braking stability and alignment.", "Steering-wheel shimmy under braking, clunks, wandering, torn hydraulic bushings, or ball-joint play.", "Inspect both sides, tires, brakes, and adjacent links; align after confirmed repairs.", [BMW_E39_MANUALS, MILLER_SCHEDULE]),
  issue("E39", "rear-suspension", "Chassis", "Rear ball-joint, integral-link, and bushing wear", "critical", "Multiple rear links and bushings can combine to create toe change, noise, and tire wear.", "Rear steer, clunks, play, unstable alignment, or inside-edge tire wear.", "Inspect and measure the complete rear suspension instead of replacing the noisiest link alone.", [BMW_E39_MANUALS, MILLER_SCHEDULE]),
  issue("E39", "power-steering", "Steering", "Power-steering hose and reservoir leakage", "important", "Reservoir, clamps, return hose, pressure hose, and pump-area leaks are common age-related service items.", "Wet reservoir or hoses, ATF odor, low level, steering noise, or drips on nearby parts.", "Clean the area, identify the highest leak source, verify the cap label, and inspect rack boots.", [BMW_E39_MANUALS, MILLER_SCHEDULE]),
  issue("E39", "i6-ccv", "Engine", "Inline-six CCV, VANOS, and intake-resonance wear", "important", "The E39 inline-six families can develop vacuum, seal, and intake-flap faults that overlap in their symptoms.", "Whistle, rough idle, mixture faults, oil consumption, flat low-rpm torque, or intake rattle.", "Smoke-test and diagnose CCV, VANOS, and DISA separately before ordering parts.", [BMW_CLASSIC, MILLER_SCHEDULE], ["M52B28", "M52TUB28", "M54B25", "M54B30"]),
  issue("E39", "i6-oil-leaks", "Engine", "Inline-six valve-cover and oil-filter-housing leaks", "critical", "Aged gaskets can leak onto hot surfaces, belt drives, and rubber suspension parts.", "Burning-oil smell, smoke, oil in plug wells, or fresh oil below the filter housing.", "Find the highest leak, repair it, and inspect contaminated belts, pulleys, hoses, and bushings.", [BMW_E39_MANUALS, MILLER_SCHEDULE], ["M52B28", "M52TUB28", "M54B25", "M54B30"]),
  issue("E39", "v8-timing-guides", "Engine", "V8 timing-chain guide and tensioner wear", "critical", "M62, M62TU, and S62 timing-guide history materially affects ownership planning; the workbook intentionally assigns no universal failure mileage.", "Start-up rattle, timing faults, oil-filter debris, guide material, or abnormal chain noise.", "Review history and obtain engine-specific diagnosis promptly; do not drive through severe timing noise or oil-pressure warnings.", [BMW_CLASSIC, BMW_E39_MANUALS], ["M62B44", "M62TUB44", "S62B50"]),
  issue("E39", "v8-coolant-leaks", "Cooling", "V8 valley and internal coolant leaks", "critical", "M62-family valley-pan leaks and S62-specific internal leak paths can hide coolant loss under the intake.", "Unexplained low coolant, odor, residue in the engine valley, or pressure-test loss without an obvious external drip.", "Pressure-test and inspect using the exact engine architecture before authorizing intake-off work.", [BMW_E39_MANUALS, BMW_CLASSIC], ["M62B44", "M62TUB44", "S62B50"]),
  issue("E39", "touring-air", "Chassis", "Touring rear self-leveling air suspension", "critical", "Touring air springs, lines, compressor, and height-control hardware can leak or overwork with age.", "Rear sag after parking, uneven ride height, frequent compressor operation, warning messages, or harsh ride.", "Leak-test both air springs and lines, check compressor duty, and calibrate ride height after repair.", [BMW_E39_MANUALS], undefined, ["528iT", "525iT", "540iT"]),
  issue("E39", "s62-air-throttle", "Engine", "S62 dual-MAF and individual-throttle faults", "critical", "The S62 uses dual air-mass sensors and individual throttles, so bank comparison and BMW-specific data are important.", "Uneven power, throttle faults, fuel-trim imbalance, reduced-power mode, or synchronization errors.", "Compare bank data and diagnose actuation before replacing sensors or throttle hardware.", [BMW_CLASSIC, BMW_E39_MANUALS], ["S62B50"]),
];
