export type ComplaintStatus = 'pending' | 'in-progress' | 'resolved';

export type IssueCategory = 
  | 'pothole_road'
  | 'street_light'
  | 'water_sewage'
  | 'waste_sanitation'
  | 'traffic_signal'
  | 'parks_trees'
  | 'sidewalk_pedestrian';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus | 'reported' | 'assigned' | 'inspected';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  actorRole: 'Citizen' | 'Dispatcher' | 'Field Crew' | 'Inspector' | 'System';
  photoUrl?: string;
}

export interface Complaint {
  id: string;
  trackingNumber: string; // e.g., "CMP-2026-8491"
  title: string;
  description: string;
  category: IssueCategory;
  categoryLabel: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  location: {
    address: string;
    ward: string;
    latitude: number;
    longitude: number;
    landmark?: string;
  };
  photos: string[];
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  author: {
    id: string;
    name: string;
    isVerified: boolean;
    avatar?: string;
  };
  assignedDepartment: string;
  departmentCode?: string;
  departmentDivision?: string;
  routingConfidence?: number;
  routingKeywords?: string[];
  assignedCrew?: string;
  estimatedResolutionDays?: number;
  upvotesCount: number;
  timeline: TimelineEvent[];
  officialNotes?: string;
  afterRepairPhotoUrl?: string;
  isOfflineQueued?: boolean;
  offlineCapturedAt?: string;
  syncedAt?: string;
}

export interface DepartmentRoutingResult {
  category: IssueCategory;
  categoryLabel: string;
  department: string;
  departmentCode: string;
  divisionUnit: string;
  slaHours: number;
  confidence: number;
  matchedKeywords: string[];
  routingReason: string;
  officerInCharge: string;
}

export interface DuplicateAnalysisResult {
  isDuplicate: boolean;
  confidenceScore: number;
  existingComplaint?: Complaint;
  matchedFactors: string[];
  policyReason: string;
}

export interface QueuedOfflineComplaint {
  tempId: string;
  capturedAt: string;
  title: string;
  description: string;
  category: IssueCategory;
  categoryLabel: string;
  priority: PriorityLevel;
  location: {
    address: string;
    ward: string;
    latitude: number;
    longitude: number;
    landmark?: string;
  };
  photos: string[];
  author: {
    id: string;
    name: string;
    isVerified: boolean;
    avatar?: string;
  };
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
  attempts?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'municipal_officer';
  ward?: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  department?: string;
}

export interface FilterState {
  status: 'all' | ComplaintStatus;
  category: 'all' | IssueCategory;
  ward: 'all' | string;
  search: string;
  sortBy: 'newest' | 'upvotes' | 'priority';
  viewMode: 'grid' | 'list' | 'map';
  onlyMyComplaints: boolean;
}
