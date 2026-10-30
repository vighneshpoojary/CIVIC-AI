export type ComplaintPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus = 
  | 'Submitted'
  | 'AI Reviewed'
  | 'Awaiting Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Needs Clarification'
  | 'Reopened';

export interface TimelineEntry {
  status: ComplaintStatus;
  changed_by: string;
  timestamp: string;
  public_note?: string;
  internal_note?: string;
}

export interface AIAssessment {
  summary: string;
  category: string;
  subcategory: string;
  suggested_department: string;
  priority_recommendation: ComplaintPriority;
  confidence_score: number;
  risk_factors: string[];
  priority_reasoning: string[];
}

export interface Complaint {
  id: string;
  reference_id: string;
  citizen_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  address: string;
  city: string;
  ward?: string;
  latitude: number;
  longitude: number;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_department_id?: string;
  assigned_officer_id?: string;
  is_synthetic?: boolean;
  source_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  ai_assessment?: AIAssessment;
  timeline?: TimelineEntry[];
}

export interface DuplicateMatch {
  reference_id: string;
  title: string;
  similarity_score: number;
  distance_meters: number;
  match_rationale: string;
  status: string;
}

export interface Hotspot {
  hotspot_id: string;
  center_latitude: number;
  center_longitude: number;
  radius_meters: number;
  complaint_count: number;
  critical_count: number;
  dominant_category: string;
  ward: string;
  severity: 'Critical' | 'High';
  sample_complaints: string[];
}

export interface Officer {
  officer_name: string;
  officer_designation: string;
  normalized_category: string;
  cases_handled: number;
}

export interface AnalyticsSummary {
  total_complaints: number;
  awaiting_review: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  high_or_critical: number;
  category_distribution: { category: string; count: number }[];
  priority_distribution: { priority: string; count: number }[];
}

export interface DatasetItem {
  id: string;
  name: string;
  source: string;
  file_name: string;
  record_count: number;
  geographic_coverage: string;
  data_type: string;
  validation_status: string;
  processing_status: string;
}
