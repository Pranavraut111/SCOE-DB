import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  // Students API
  students: {
    getAll: () => fetch(`${API_BASE_URL}/students/`).then(res => res.json()),
    getById: (id: string) => fetch(`${API_BASE_URL}/students/${id}`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE_URL}/students/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE'
    }),
    bulkUpload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`${API_BASE_URL}/students/bulk-upload`, {
        method: 'POST',
        body: formData
      }).then(res => res.json());
    },
    downloadTemplate: () => fetch(`${API_BASE_URL}/students/template`).then(res => res.blob())
  },

  // Subjects API
  subjects: {
    getAll: (params?: { year?: string; department?: string; semester?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.year) searchParams.append('year', params.year);
      if (params?.department) searchParams.append('department', params.department);
      if (params?.semester) searchParams.append('semester', params.semester);
      
      const query = searchParams.toString();
      return fetch(`${API_BASE_URL}/subjects/${query ? `?${query}` : ''}`).then(res => res.json());
    },
    getById: (id: number) => fetch(`${API_BASE_URL}/subjects/${id}`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE_URL}/subjects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: number, data: any) => fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: number) => fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'DELETE'
    }),
    getCatalog: (department: string, semester?: string) => {
      const params = new URLSearchParams({ department });
      if (semester) params.append('semester', semester);
      return fetch(`${API_BASE_URL}/subjects/catalog?${params}`).then(res => res.json());
    },
    populateCatalog: () => fetch(`${API_BASE_URL}/subjects/catalog/populate`).then(res => res.json()),
    getComponentTemplates: () => fetch(`${API_BASE_URL}/subjects/templates/components`).then(res => res.json())
  }
};

export default api;
