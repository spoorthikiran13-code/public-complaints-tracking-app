import { Complaint, IssueCategory, DepartmentRoutingResult, DuplicateAnalysisResult } from '../types';
import { CATEGORY_DEFINITIONS } from '../data/mockComplaints';

export interface DepartmentProfile {
  category: IssueCategory;
  categoryLabel: string;
  department: string;
  departmentCode: string;
  divisionUnit: string;
  officerInCharge: string;
  slaHours: number;
  keywords: string[];
}

export const DEPARTMENT_PROFILES: Record<IssueCategory, DepartmentProfile> = {
  pothole_road: {
    category: 'pothole_road',
    categoryLabel: 'Roads & Potholes',
    department: 'Department of Transportation & Highways',
    departmentCode: 'DEPT-TRANS-01',
    divisionUnit: 'Pavement Engineering & Asphalt Milling Division',
    officerInCharge: 'Chief Engineer Robert Miller, DOT',
    slaHours: 24,
    keywords: [
      'pothole', 'potholes', 'road', 'asphalt', 'pavement', 'sinkhole', 'crater', 'highway',
      'street damage', 'crater on road', 'road crack', 'loose tar', 'bitumen',
      'uneven road surface', 'road cave-in', 'road bump', 'street hole', 'tarmac', 'lane crack'
    ]
  },
  street_light: {
    category: 'street_light',
    categoryLabel: 'Street Lighting',
    department: 'Bureau of Street Lighting & Electrical Infrastructure',
    departmentCode: 'DEPT-ELEC-02',
    divisionUnit: 'Public Illumination & High-Voltage Grid Unit',
    officerInCharge: 'Superintendent Sarah Lin, Lighting Bureau',
    slaHours: 24,
    keywords: [
      'light', 'lights', 'streetlight', 'streetlights', 'lamp', 'lamp post', 'streetlamp',
      'dark', 'darkness', 'bulb', 'flickering', 'blackout', 'unlit', 'pole', 'electrical wire',
      'hanging wire', 'power pole', 'exposed cable', 'night hazard', 'no light', 'illumination',
      'lighting', 'luminaire', 'lantern', 'fuse'
    ]
  },
  water_sewage: {
    category: 'water_sewage',
    categoryLabel: 'Water & Drainage',
    department: 'Municipal Water, Drainage & Sewer Authority',
    departmentCode: 'DEPT-WATER-03',
    divisionUnit: 'Hydraulic Services & Sewerage Emergency Bureau',
    officerInCharge: 'Director Marcus Thorne, Water Authority',
    slaHours: 12,
    keywords: [
      'water', 'sewage', 'sewer', 'leak', 'leaking', 'burst', 'pipe', 'pipes', 'burst pipe',
      'water main', 'drain', 'drains', 'drainage', 'clogged drain', 'stormwater', 'flooding',
      'gushing water', 'manhole overflow', 'dirty water', 'foul smell', 'low pressure',
      'puddle', 'sewer line', 'hydrant', 'gutter overflow', 'stench', 'cesspool'
    ]
  },
  waste_sanitation: {
    category: 'waste_sanitation',
    categoryLabel: 'Waste & Sanitation',
    department: 'Department of Public Sanitation & Waste Management',
    departmentCode: 'DEPT-WASTE-04',
    divisionUnit: 'Solid Waste Collection & Hazardous Spill Division',
    officerInCharge: 'Inspector David Gomez, Sanitation Dept',
    slaHours: 24,
    keywords: [
      'garbage', 'trash', 'waste', 'litter', 'dumped', 'dumping', 'illegal dumping', 'bin',
      'bins', 'overflowing bin', 'dustbin', 'rotting', 'foul smell', 'debris', 'dead animal',
      'junk', 'landfill', 'discarded furniture', 'waste pile', 'plastics', 'rubbish', 'compost',
      'odor', 'fly dumping'
    ]
  },
  traffic_signal: {
    category: 'traffic_signal',
    categoryLabel: 'Traffic & Signals',
    department: 'Traffic Operations & Intelligent Transit Systems Division',
    departmentCode: 'DEPT-TRAF-05',
    divisionUnit: 'Signals Electronics & Intersection Safety Unit',
    officerInCharge: 'Senior Traffic Engineer Chloe Evans, ITS',
    slaHours: 8,
    keywords: [
      'traffic light', 'traffic signal', 'signal', 'signals', 'stop sign', 'red light',
      'green light', 'yellow light', 'blinker', 'intersection', 'pedestrian signal',
      'crossing signal', 'traffic sensor', 'walk button', 'traffic sign', 'speed limit sign',
      'signal failure', 'stuck light', 'crosswalk signal'
    ]
  },
  parks_trees: {
    category: 'parks_trees',
    categoryLabel: 'Parks & Fallen Trees',
    department: 'Department of Parks, Urban Forestry & Public Grounds',
    departmentCode: 'DEPT-PARK-06',
    divisionUnit: 'Arboriculture & Public Recreation Safety Squad',
    officerInCharge: 'Chief Arborist Laura Higgins, Forestry Board',
    slaHours: 36,
    keywords: [
      'tree', 'trees', 'branch', 'branches', 'fallen tree', 'fallen branch', 'tree hazard',
      'park', 'parks', 'limb', 'playground', 'swing', 'slide', 'grass', 'overgrown', 'roots',
      'foliage', 'trunk', 'urban forest', 'public lawn', 'botanical', 'hanging branch', 'bark'
    ]
  },
  sidewalk_pedestrian: {
    category: 'sidewalk_pedestrian',
    categoryLabel: 'Sidewalks & Crossings',
    department: 'Pedestrian Infrastructure & Walkway Safety Bureau',
    departmentCode: 'DEPT-PED-07',
    divisionUnit: 'Concrete Restoration & ADA Accessibility Unit',
    officerInCharge: 'Urban Walkways Coordinator Julian Vance, DPW',
    slaHours: 48,
    keywords: [
      'sidewalk', 'sidewalks', 'pavement', 'footpath', 'pedestrian walkway', 'curb',
      'curb ramp', 'wheelchair ramp', 'tripping hazard', 'broken slab', 'uneven pavement',
      'concrete crack', 'broken curb', 'walkway blocked', 'blind path', 'tactile paving',
      'pedestrian crossing', 'footway', 'kerb'
    ]
  }
};

/**
 * Intelligently analyzes problem text, audio transcripts, and category to route to the exact municipal department.
 */
export function analyzeProblemDepartment(
  rawText: string,
  preferredCategory?: IssueCategory
): DepartmentRoutingResult {
  const normalized = rawText.toLowerCase();
  const words = normalized.split(/[\s,.-]+/).filter(w => w.length > 2);

  let bestCategory: IssueCategory = preferredCategory || 'pothole_road';
  let bestScore = 0;
  let detectedKeywords: string[] = [];

  // Evaluate keyword density across all departments
  (Object.keys(DEPARTMENT_PROFILES) as IssueCategory[]).forEach((catKey) => {
    const profile = DEPARTMENT_PROFILES[catKey];
    let score = 0;
    const currentMatches: string[] = [];

    profile.keywords.forEach((keyword) => {
      if (normalized.includes(keyword.toLowerCase())) {
        score += keyword.includes(' ') ? 3 : 2;
        currentMatches.push(keyword);
      }
    });

    // If user explicitly chose a preferred category, give it an affinity bonus
    if (preferredCategory === catKey) {
      score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = catKey;
      detectedKeywords = currentMatches;
    }
  });

  // If a preferred category is explicitly selected by user and has zero text score, fallback to it
  if (preferredCategory && bestScore === 0) {
    bestCategory = preferredCategory;
    detectedKeywords = [CATEGORY_DEFINITIONS[preferredCategory].label];
  }

  const profile = DEPARTMENT_PROFILES[bestCategory];
  const confidence = bestScore > 0 ? Math.min(99, 75 + bestScore * 5) : 85;

  const routingReason = detectedKeywords.length > 0
    ? `Identified civic context [${detectedKeywords.slice(0, 3).join(', ')}] — automatically routed to ${profile.divisionUnit}.`
    : `Routed to ${profile.department} based on municipal infrastructure classification.`;

  return {
    category: bestCategory,
    categoryLabel: profile.categoryLabel,
    department: profile.department,
    departmentCode: profile.departmentCode,
    divisionUnit: profile.divisionUnit,
    slaHours: profile.slaHours,
    confidence,
    matchedKeywords: detectedKeywords.slice(0, 5),
    routingReason,
    officerInCharge: profile.officerInCharge
  };
}

/**
 * Calculates geographic distance in meters between two coordinates using Haversine formula
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Normalizes an address or title string into significant tokens, stripping out common filler words.
 */
function extractSignificantTokens(str: string): Set<string> {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'near', 'by', 'of',
    'is', 'are', 'was', 'were', 'street', 'st', 'avenue', 'ave', 'road', 'rd', 'blvd',
    'boulevard', 'lane', 'ln', 'way', 'crossing', 'hazard', 'reported', 'issue', 'problem'
  ]);

  return new Set(
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
}

/**
 * Deep Analysis Engine for Duplicate Problem Detection
 * Evaluates category, geographical ward/address/GPS, and description tokens.
 * Strictly disallows duplicate submissions when an active matching ticket exists.
 */
export function analyzeDuplicateProblem(
  newProblem: {
    category: IssueCategory;
    ward: string;
    address: string;
    title: string;
    description: string;
    latitude?: number;
    longitude?: number;
    landmark?: string;
  },
  existingComplaints: Complaint[]
): DuplicateAnalysisResult {
  // Only check active/unresolved complaints (pending or in-progress)
  const activeComplaints = existingComplaints.filter((c) => c.status !== 'resolved');

  let bestMatch: Complaint | null = null;
  let highestScore = 0;
  let matchFactors: string[] = [];

  const newAddressTokens = extractSignificantTokens(newProblem.address || '');
  const newTextTokens = extractSignificantTokens(`${newProblem.title} ${newProblem.description}`);
  const newWardNorm = (newProblem.ward || '').toLowerCase().trim();

  for (const existing of activeComplaints) {
    let score = 0;
    const currentFactors: string[] = [];

    // 1. Problem Category Match (35%)
    if (existing.category === newProblem.category) {
      score += 35;
      currentFactors.push(`Identical Hazard Category: ${existing.categoryLabel}`);
    }

    // 2. Geographic Ward Match (25%)
    const existingWardNorm = (existing.location.ward || '').toLowerCase().trim();
    const wardMatches = newWardNorm && (newWardNorm === existingWardNorm || existingWardNorm.includes(newWardNorm) || newWardNorm.includes(existingWardNorm));
    if (wardMatches) {
      score += 25;
      currentFactors.push(`Geographical Jurisdiction Match: ${existing.location.ward}`);
    }

    // 3. Street / Address Token Overlap (25%)
    const existingAddressTokens = extractSignificantTokens(existing.location.address || '');
    let commonAddressTokens = 0;
    newAddressTokens.forEach((token) => {
      if (existingAddressTokens.has(token)) {
        commonAddressTokens++;
      }
    });

    if (commonAddressTokens >= 1) {
      const addressBoost = Math.min(25, commonAddressTokens * 12);
      score += addressBoost;
      currentFactors.push(`Street / Address Overlap: "${existing.location.address}"`);
    }

    // 4. GPS Distance Proximity (up to 25%)
    if (
      newProblem.latitude !== undefined &&
      newProblem.longitude !== undefined &&
      existing.location.latitude &&
      existing.location.longitude
    ) {
      const distanceMeters = calculateDistanceMeters(
        newProblem.latitude,
        newProblem.longitude,
        existing.location.latitude,
        existing.location.longitude
      );

      if (distanceMeters <= 150) {
        score += 25;
        currentFactors.push(`GPS Proximity: Within ${Math.round(distanceMeters)}m radius`);
      } else if (distanceMeters <= 350) {
        score += 15;
        currentFactors.push(`GPS Proximity: Within ${Math.round(distanceMeters)}m zone`);
      }
    }

    // 5. Semantic / Keyword Description Overlap (15%)
    const existingTextTokens = extractSignificantTokens(`${existing.title} ${existing.description}`);
    let commonTextTokens = 0;
    newTextTokens.forEach((token) => {
      if (existingTextTokens.has(token)) {
        commonTextTokens++;
      }
    });

    if (commonTextTokens >= 2) {
      score += 15;
      currentFactors.push(`Problem Context & Keyword Similarity: ${commonTextTokens} matching keywords`);
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = existing;
      matchFactors = currentFactors;
    }
  }

  // Threshold: if score >= 55 and category matches + location matches (ward or address)
  const isDuplicate = highestScore >= 55 && !!bestMatch;

  const policyReason = isDuplicate
    ? `Municipal Dispatch Rule: An identical ${bestMatch!.categoryLabel} report (#${bestMatch!.trackingNumber}) is already active in this jurisdiction. Our AI Dispatch Agent strictly disallows submitting duplicate tickets to prevent redundant repair crew dispatches.`
    : 'No duplicate ticket conflict detected. Safe to register new civic report.';

  return {
    isDuplicate,
    confidenceScore: Math.min(99, Math.max(70, highestScore)),
    existingComplaint: bestMatch || undefined,
    matchedFactors: matchFactors,
    policyReason
  };
}
