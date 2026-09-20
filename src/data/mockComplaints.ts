import { Complaint, IssueCategory } from '../types';

export const CATEGORY_DEFINITIONS: Record<IssueCategory, { label: string; icon: string; department: string; color: string }> = {
  pothole_road: {
    label: 'Roads & Potholes',
    icon: 'Hammer',
    department: 'Department of Transportation & Highways',
    color: 'amber'
  },
  street_light: {
    label: 'Street Lighting',
    icon: 'Lightbulb',
    department: 'Bureau of Street Lighting',
    color: 'yellow'
  },
  water_sewage: {
    label: 'Water & Drainage',
    icon: 'Droplets',
    department: 'Municipal Water & Sewer Authority',
    color: 'blue'
  },
  waste_sanitation: {
    label: 'Waste & Sanitation',
    icon: 'Trash2',
    department: 'Department of Public Sanitation',
    color: 'emerald'
  },
  traffic_signal: {
    label: 'Traffic & Signals',
    icon: 'TrafficCone',
    department: 'Traffic Operations Division',
    color: 'rose'
  },
  parks_trees: {
    label: 'Parks & Fallen Trees',
    icon: 'Trees',
    department: 'Parks & Recreational Maintenance',
    color: 'green'
  },
  sidewalk_pedestrian: {
    label: 'Sidewalks & Crossings',
    icon: 'Footprints',
    department: 'Pedestrian Infrastructure Bureau',
    color: 'indigo'
  }
};

export const WARDS_LIST = [
  'Ward 1 - Downtown Civic Center',
  'Ward 2 - East River District',
  'Ward 3 - North Hillside',
  'Ward 4 - West Boulevard & Market',
  'Ward 5 - South Park Commons',
  'Ward 6 - Harbor Industrial'
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-001',
    trackingNumber: 'CMP-2026-8491',
    title: 'Hazardous deep pothole causing vehicle swerving near school crossing',
    description: 'A 6-inch deep pothole has formed along the northbound lane right before the crosswalk of Lincoln Elementary. Multiple drivers have had to swerve abruptly into the oncoming lane to avoid tire rim damage.',
    category: 'pothole_road',
    categoryLabel: 'Roads & Potholes',
    status: 'in-progress',
    priority: 'high',
    location: {
      address: '420 N. Lincoln Blvd, near 5th St',
      ward: 'Ward 3 - North Hillside',
      latitude: 37.7749,
      longitude: -122.4194,
      landmark: 'Across Lincoln Elementary School'
    },
    photos: [
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=1000&q=80'
    ],
    reportedAt: '2026-09-18T14:30:00Z',
    updatedAt: '2026-09-19T08:15:00Z',
    author: {
      id: 'usr-101',
      name: 'Elena Vance',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
    },
    assignedDepartment: 'Department of Transportation & Highways',
    assignedCrew: 'Road Repair Unit 04 (Asphalt Patching)',
    estimatedResolutionDays: 1,
    upvotesCount: 28,
    timeline: [
      {
        id: 't-1',
        status: 'reported',
        title: 'Complaint Registered',
        description: 'Citizen Elena Vance submitted the report with 2 geo-tagged photos.',
        timestamp: '2026-09-18T14:30:00Z',
        actor: 'Elena Vance',
        actorRole: 'Citizen'
      },
      {
        id: 't-2',
        status: 'assigned',
        title: 'Assigned to DOT Highways',
        description: 'Triage team evaluated severity as High due to proximity to school zone. Work Order #WO-9041 created.',
        timestamp: '2026-09-18T16:10:00Z',
        actor: 'City Dispatch System',
        actorRole: 'Dispatcher'
      },
      {
        id: 't-3',
        status: 'in-progress',
        title: 'Crew Dispatched to Site',
        description: 'Road Repair Unit 04 has arrived on site. Area cordoned off with high-visibility safety pylons. Cold asphalt mill and fill in progress.',
        timestamp: '2026-09-19T08:15:00Z',
        actor: 'Marcus Chen, Field Lead',
        actorRole: 'Field Crew',
        photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
      }
    ],
    officialNotes: 'Scheduled completion by today 17:00. Cold mix asphalt temporary barrier followed by permanent hot asphalt resurfacing scheduled on ward maintenance round.'
  },
  {
    id: 'cmp-002',
    trackingNumber: 'CMP-2026-8488',
    title: 'High-pressure water main leak pooling across pedestrian sidewalk',
    description: 'Continuous freshwater leak bubbling through the expansion joint on the southern sidewalk. Water has pooled into a 15-foot wide stream flowing into the storm drain.',
    category: 'water_sewage',
    categoryLabel: 'Water & Drainage',
    status: 'pending',
    priority: 'critical',
    location: {
      address: '880 Ocean View Ave & 14th Terrace',
      ward: 'Ward 2 - East River District',
      latitude: 37.7833,
      longitude: -122.4167,
      landmark: 'In front of Maritime Pharmacy'
    },
    photos: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80'
    ],
    reportedAt: '2026-09-19T06:45:00Z',
    updatedAt: '2026-09-19T07:10:00Z',
    author: {
      id: 'usr-102',
      name: 'David K. Ross',
      isVerified: true
    },
    assignedDepartment: 'Municipal Water & Sewer Authority',
    estimatedResolutionDays: 2,
    upvotesCount: 41,
    timeline: [
      {
        id: 't-201',
        status: 'reported',
        title: 'Emergency Utility Report Filed',
        description: 'Report filed by resident David K. Ross noting rapid water loss.',
        timestamp: '2026-09-19T06:45:00Z',
        actor: 'David K. Ross',
        actorRole: 'Citizen'
      },
      {
        id: 't-202',
        status: 'pending',
        title: 'Priority Triage Underway',
        description: 'Flagged as Critical Priority. Utility isolation valve locator team alerted.',
        timestamp: '2026-09-19T07:10:00Z',
        actor: 'Municipal Water Ops',
        actorRole: 'Dispatcher'
      }
    ],
    officialNotes: 'Valve isolation team requested on radio channel 3. Pressure readings in district sector B2 show moderate drop.'
  },
  {
    id: 'cmp-003',
    trackingNumber: 'CMP-2026-8462',
    title: 'Streetlight pole dark for four consecutive blocks on Elmwood',
    description: 'Four consecutive high-pressure sodium street lamps (Poles #E-14 to #E-17) are completely dead at night, creating an unlit blind spot along the residential walkway.',
    category: 'street_light',
    categoryLabel: 'Street Lighting',
    status: 'resolved',
    priority: 'medium',
    location: {
      address: '310 - 390 Elmwood Crescent',
      ward: 'Ward 4 - West Boulevard & Market',
      latitude: 37.7699,
      longitude: -122.4467,
      landmark: 'Between Maple St and Birch Way'
    },
    photos: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80'
    ],
    reportedAt: '2026-09-16T21:15:00Z',
    updatedAt: '2026-09-18T18:30:00Z',
    resolvedAt: '2026-09-18T18:30:00Z',
    author: {
      id: 'usr-103',
      name: 'Sofia Martinez',
      isVerified: true
    },
    assignedDepartment: 'Bureau of Street Lighting',
    assignedCrew: 'Electrical Grid Team 02',
    upvotesCount: 19,
    timeline: [
      {
        id: 't-301',
        status: 'reported',
        title: 'Issue Logged by Citizen',
        description: 'Report logged with location markers for poles E-14 to E-17.',
        timestamp: '2026-09-16T21:15:00Z',
        actor: 'Sofia Martinez',
        actorRole: 'Citizen'
      },
      {
        id: 't-302',
        status: 'in-progress',
        title: 'Circuit Fault Diagnostic',
        description: 'Crew inspected breaker box CB-12. Detected blown photocell sensor and corroded wiring splice.',
        timestamp: '2026-09-17T11:20:00Z',
        actor: 'Bureau Electrical Tech',
        actorRole: 'Field Crew'
      },
      {
        id: 't-303',
        status: 'resolved',
        title: 'Repairs Completed & Verified',
        description: 'Upgraded all four fixtures to energy-efficient 65W LED luminaires with new photocell sensors. 100% illumination restored.',
        timestamp: '2026-09-18T18:30:00Z',
        actor: 'Chief Inspector Davies',
        actorRole: 'Inspector',
        photoUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80'
      }
    ],
    officialNotes: 'Completed LED conversion ahead of winter schedule. Night lumen test recorded at 38 lux, exceeding municipal safety standard.',
    afterRepairPhotoUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cmp-004',
    trackingNumber: 'CMP-2026-8475',
    title: 'Heavy illegal dumping blocking storm drain alleyway',
    description: 'Bulk waste including discarded mattresses, broken construction drywall, and unbagged cardboard dumped in the alleyway behind commercial strip.',
    category: 'waste_sanitation',
    categoryLabel: 'Waste & Sanitation',
    status: 'in-progress',
    priority: 'medium',
    location: {
      address: 'Alleyway behind 1240 Market Street',
      ward: 'Ward 1 - Downtown Civic Center',
      latitude: 37.7785,
      longitude: -122.4156,
      landmark: 'Rear access behind City Central Diner'
    },
    photos: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1000&q=80'
    ],
    reportedAt: '2026-09-17T10:10:00Z',
    updatedAt: '2026-09-19T09:00:00Z',
    author: {
      id: 'usr-104',
      name: 'Geraldine Wu',
      isVerified: false
    },
    assignedDepartment: 'Department of Public Sanitation',
    assignedCrew: 'Rapid Clean Unit 7',
    estimatedResolutionDays: 1,
    upvotesCount: 15,
    timeline: [
      {
        id: 't-401',
        status: 'reported',
        title: 'Report Received',
        description: 'Sanitation hotline synchronized report with photo upload.',
        timestamp: '2026-09-17T10:10:00Z',
        actor: 'Geraldine Wu',
        actorRole: 'Citizen'
      },
      {
        id: 't-402',
        status: 'in-progress',
        title: 'Heavy Loader Dispatched',
        description: 'Flatbed loader en route with hazmat screening personnel.',
        timestamp: '2026-09-19T09:00:00Z',
        actor: 'Sanitation Dispatch',
        actorRole: 'Dispatcher'
      }
    ],
    officialNotes: 'Commercial security camera footage requested to identify dumping vehicle.'
  },
  {
    id: 'cmp-005',
    trackingNumber: 'CMP-2026-8455',
    title: 'Damaged pedestrian signal button with exposed electrical wires',
    description: 'The pedestrian crossing push-button casing is smashed on the northwest corner. Two exposed colored wires are protruding out, potentially live.',
    category: 'traffic_signal',
    categoryLabel: 'Traffic & Signals',
    status: 'resolved',
    priority: 'critical',
    location: {
      address: 'Interchange of 7th & Grand Ave',
      ward: 'Ward 1 - Downtown Civic Center',
      latitude: 37.7812,
      longitude: -122.4089,
      landmark: 'Directly in front of Metro Transit Station'
    },
    photos: [
      'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=1000&q=80'
    ],
    reportedAt: '2026-09-15T09:20:00Z',
    updatedAt: '2026-09-16T14:00:00Z',
    resolvedAt: '2026-09-16T14:00:00Z',
    author: {
      id: 'usr-105',
      name: 'Officer Ramirez',
      isVerified: true
    },
    assignedDepartment: 'Traffic Operations Division',
    assignedCrew: 'Signal Tech Response Unit',
    upvotesCount: 37,
    timeline: [
      {
        id: 't-501',
        status: 'reported',
        title: 'Priority Signal Failure Flagged',
        description: 'Vandalized pedestrian activator reported.',
        timestamp: '2026-09-15T09:20:00Z',
        actor: 'Officer Ramirez',
        actorRole: 'Citizen'
      },
      {
        id: 't-502',
        status: 'resolved',
        title: 'Unit Replaced & Calibrated',
        description: 'Installed vandal-resistant ADA audible tactile actuator. Low voltage continuity tested safe.',
        timestamp: '2026-09-16T14:00:00Z',
        actor: 'Signal Maintenance Team',
        actorRole: 'Field Crew'
      }
    ],
    officialNotes: 'Upgraded to heavy-gauge cast aluminum housing with chirp locator audio for visually impaired citizens.'
  },
  {
    id: 'cmp-006',
    trackingNumber: 'CMP-2026-8495',
    title: 'Severe sidewalk buckling caused by aged pine tree roots',
    description: 'The concrete slab has lifted over 4 inches creating a severe tripping obstacle. A senior citizen fell earlier this week.',
    category: 'sidewalk_pedestrian',
    categoryLabel: 'Sidewalks & Crossings',
    status: 'pending',
    priority: 'medium',
    location: {
      address: '542 Pinecrest Lane',
      ward: 'Ward 5 - South Park Commons',
      latitude: 37.7650,
      longitude: -122.4350,
      landmark: 'Near entrance to South Community Park'
    },
    photos: [
      'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1000&q=80'
    ],
    reportedAt: '2026-09-19T07:50:00Z',
    updatedAt: '2026-09-19T07:50:00Z',
    author: {
      id: 'usr-101',
      name: 'Elena Vance',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
    },
    assignedDepartment: 'Pedestrian Infrastructure Bureau',
    estimatedResolutionDays: 4,
    upvotesCount: 9,
    timeline: [
      {
        id: 't-601',
        status: 'reported',
        title: 'Pedestrian Hazard Filed',
        description: 'Citizen report filed with photo showing root lift measurement.',
        timestamp: '2026-09-19T07:50:00Z',
        actor: 'Elena Vance',
        actorRole: 'Citizen'
      }
    ],
    officialNotes: 'Requires coordination with municipal arborist to shave root without harming mature evergreen tree.'
  },
  {
    id: 'cmp-007',
    trackingNumber: 'CMP-2026-8440',
    title: 'Split branch hanging over children playground swing set',
    description: 'A large oak limb cracked during recent heavy gusts and is hanging precariously 15 feet directly above the toddler swing set.',
    category: 'parks_trees',
    categoryLabel: 'Parks & Fallen Trees',
    status: 'resolved',
    priority: 'critical',
    location: {
      address: 'South Park Commons Playground East Gate',
      ward: 'Ward 5 - South Park Commons',
      latitude: 37.7620,
      longitude: -122.4330,
      landmark: 'Children play area, Section B'
    },
    photos: [
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000&q=80'
    ],
    reportedAt: '2026-09-14T11:00:00Z',
    updatedAt: '2026-09-14T16:20:00Z',
    resolvedAt: '2026-09-14T16:20:00Z',
    author: {
      id: 'usr-106',
      name: 'Kendra Patel',
      isVerified: true
    },
    assignedDepartment: 'Parks & Recreational Maintenance',
    assignedCrew: 'Tree Service Unit Alpha',
    upvotesCount: 52,
    timeline: [
      {
        id: 't-701',
        status: 'reported',
        title: 'Emergency Park Tree Hazard',
        description: 'Reported with high urgency due to child safety zone.',
        timestamp: '2026-09-14T11:00:00Z',
        actor: 'Kendra Patel',
        actorRole: 'Citizen'
      },
      {
        id: 't-702',
        status: 'in-progress',
        title: 'Bucket Truck Dispatched',
        description: 'Playground cordoned off. Hydraulic bucket crane deployed for limb reduction.',
        timestamp: '2026-09-14T13:10:00Z',
        actor: 'Parks Arborist Unit',
        actorRole: 'Field Crew'
      },
      {
        id: 't-703',
        status: 'resolved',
        title: 'Hazard Cleared and Canopy Inspected',
        description: 'Dangerous fractured branch safely pruned, wood chipped for park mulch, surrounding branches certified sound.',
        timestamp: '2026-09-14T16:20:00Z',
        actor: 'Parks Safety Inspector',
        actorRole: 'Inspector'
      }
    ],
    officialNotes: 'Area reopened at 16:30. Tree health certified stable for upcoming season.'
  }
];

export const DEMO_USERS = {
  citizen: {
    id: 'usr-101',
    name: 'Elena Vance',
    email: 'elena.vance@civicmail.org',
    role: 'citizen' as const,
    ward: 'Ward 3 - North Hillside',
    phone: '+1 (555) 349-8812',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    isVerified: true
  },
  officer: {
    id: 'usr-officer-01',
    name: 'Marcus Chen',
    email: 'marcus.chen@publicworks.gov',
    role: 'municipal_officer' as const,
    ward: 'All Wards (Supervisory)',
    phone: '+1 (555) 720-4100',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    isVerified: true,
    department: 'Department of Public Works & Emergency Response'
  }
};
