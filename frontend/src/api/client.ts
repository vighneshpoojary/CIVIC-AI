import { Complaint, AIAssessment, Hotspot, AnalyticsSummary, Officer, DatasetItem, DuplicateMatch } from '../types';

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fsprxbxocebtwugarofx.supabase.co';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzcHJ4YnhvY2VidHd1Z2Fyb2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTAyOTMsImV4cCI6MjEwODkyNjI5M30.A5JOMke0fhOOqekswb1ZTGTlXD-JNU6s15_2hiNWkR4';

async function fetchSupabase(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'apikey': SUPABASE_ANON,
    'Authorization': `Bearer ${SUPABASE_ANON}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  return fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, { ...options, headers });
}

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
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch {
      // Netlify Fallback: Direct Supabase PostgREST query
      try {
        const sQuery = new URLSearchParams();
        sQuery.append('select', '*');
        sQuery.append('order', 'created_at.desc');
        sQuery.append('limit', (params.limit || 50).toString());
        if (params.category && params.category !== 'All') sQuery.append('category', `eq.${params.category}`);
        if (params.priority && params.priority !== 'All') sQuery.append('priority', `eq.${params.priority}`);
        if (params.status && params.status !== 'All') sQuery.append('status', `eq.${params.status}`);
        
        const sRes = await fetchSupabase(`complaints?${sQuery.toString()}`);
        if (sRes.ok) {
          return await sRes.json();
        }
      } catch (err) {
        console.warn('Supabase fallback error:', err);
      }
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
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch {
      try {
        const sRes = await fetchSupabase(`complaints?reference_id=eq.${ref}&select=*&limit=1`);
        if (sRes.ok) {
          const list = await sRes.json();
          if (list && list.length > 0) {
            const c = list[0];
            c.timeline = [{
              status: c.status || 'Submitted',
              changed_by: 'Citizen Portal',
              timestamp: c.created_at,
              public_note: 'Grievance recorded in Bengaluru BBMP municipal database.'
            }];
            return c;
          }
        }
      } catch (err) {
        console.warn('Supabase ref fallback error:', err);
      }
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
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch {
      try {
        const sRes = await fetchSupabase('officers?select=*&limit=50');
        if (sRes.ok) return await sRes.json();
      } catch (err) {
        console.warn('Supabase officers fallback error:', err);
      }
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
