import { Complaint, AIAssessment, Hotspot, AnalyticsSummary, Officer, DatasetItem, DuplicateMatch } from '../types';

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;

export const apiClient = {
  async getComplaints(params: {
    category?: string;
    priority?: string;
    status?: string;
    ward?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Complaint[]> {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.ward && params.ward !== 'All') query.append('ward', params.ward);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());

    try {
      const res = await fetch(`${API_BASE}/complaints?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch complaints');
      return await res.json();
    } catch (e) {
      console.warn('API fetch failed, returning empty fallback:', e);
      return [];
    }
  },

  async getComplaintById(id: string): Promise<Complaint | null> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`);
      if (!res.ok) throw new Error('Complaint not found');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async getComplaintByRef(ref: string): Promise<Complaint | null> {
    try {
      const res = await fetch(`${API_BASE}/complaints/ref/${ref}`);
      if (!res.ok) throw new Error('Complaint reference not found');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async submitComplaint(data: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    address: string;
    ward?: string;
    latitude: number;
    longitude: number;
  }): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit complaint');
    return await res.json();
  },

  async updateComplaintStatus(id: string, status: string, notes?: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, internal_notes: notes }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  },

  async assignComplaint(id: string, data: {
    assigned_department_id?: string;
    assigned_officer_id?: string;
    priority?: string;
  }): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to assign complaint');
    return await res.json();
  },

  async analyzeDraft(title: string, description: string, category: string, ward: string): Promise<AIAssessment> {
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, ward }),
    });
    if (!res.ok) throw new Error('AI analysis failed');
    return await res.json();
  },

  async checkDuplicates(title: string, description: string, category: string, latitude: number, longitude: number): Promise<{
    is_potential_duplicate: boolean;
    highest_similarity: number;
    matches: DuplicateMatch[];
  }> {
    const res = await fetch(`${API_BASE}/ai/check-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, latitude, longitude }),
    });
    if (!res.ok) throw new Error('Duplicate check failed');
    return await res.json();
  },

  async getHotspots(): Promise<Hotspot[]> {
    try {
      const res = await fetch(`${API_BASE}/hotspots`);
      if (!res.ok) throw new Error('Failed to fetch hotspots');
      return await res.json();
    } catch {
      return [];
    }
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    try {
      const res = await fetch(`${API_BASE}/analytics/summary`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return await res.json();
    } catch {
      return {
        total_complaints: 0,
        awaiting_review: 0,
        in_progress: 0,
        resolved: 0,
        rejected: 0,
        high_or_critical: 0,
        category_distribution: [],
        priority_distribution: []
      };
    }
  },

  async getOfficers(): Promise<Officer[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/officers`);
      if (!res.ok) throw new Error('Failed to fetch officers');
      return await res.json();
    } catch {
      return [];
    }
  },

  async getDatasets(): Promise<DatasetItem[]> {
    try {
      const res = await fetch(`${API_BASE}/datasets`);
      if (!res.ok) throw new Error('Failed to fetch datasets');
      return await res.json();
    } catch {
      return [];
    }
  },

  async chat(message: string): Promise<{ reply: string; action?: { label: string; path: string } }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Chat API call failed');
    return await res.json();
  }
};
