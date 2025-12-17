const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Types
export interface User {
     id: string;
     email: string;
     full_name: string;
     role: 'DEVELOPER' | 'TECH_LEAD' | 'PRODUCT_MANAGER' | 'BOARD_ADMIN'; // Updated roles
     created_date: string;
}

export interface Group {
     id: string;
     name: string;
     description: string;
     created_date: string;
     members: string[];
     _count?: { members: number };
}

export interface Assignment {
     id: string;
     title: string;
     description: string;
     type: 'VIDEO' | 'PDF' | 'LINK' | 'DOCUMENT';
     content_url: string;
     thumbnail_url?: string;
     assigned_groups?: string[]; // TODO: Backend returns `assignedTo` relation, need to map if needed
     due_date?: string;
     created_date: string;
}

export interface Completion {
     id: string;
     assignment_id: string;
     user_email: string;
     completed_at: string;
}

// Helper
const getHeaders = () => {
     const token = localStorage.getItem('token');
     return {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
     };
};

export const api = {
     auth: {
          login: async (email: string, role: string = 'DEVELOPER') => {
               // Map 'admin'/'user' from old UI to new roles if necessary, logic handled in SignIn page slightly
               const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, role })
               });
               if (!res.ok) throw new Error('Login failed');
               const data = await res.json();
               localStorage.setItem('token', data.token);
               return data.user as User;
          },
          logout: async () => {
               localStorage.removeItem('token');
          },
          me: async () => {
               const token = localStorage.getItem('token');
               if (!token) return null;
               const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
               if (!res.ok) {
                    localStorage.removeItem('token');
                    return null;
               }
               return await res.json() as User;
          }
     },
     assignments: {
          list: async () => {
               const res = await fetch(`${API_URL}/assignments`, { headers: getHeaders() });
               if (!res.ok) throw new Error('Failed to fetch assignments');
               return await res.json() as Assignment[];
          },
          create: async (data: any) => {
               const res = await fetch(`${API_URL}/assignments`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
               });
               if (!res.ok) throw new Error('Failed to create assignment');
               return await res.json();
          },
          update: async (id: string, data: any) => {
               // Not implemented in backend yet fully
               return {} as Assignment;
          },
          delete: async (id: string) => {
               // Not implemented in backend yet
          }
     },
     groups: {
          list: async () => {
               const res = await fetch(`${API_URL}/groups`, { headers: getHeaders() });
               if (!res.ok) throw new Error('Failed to fetch groups');
               return await res.json() as Group[];
          },
          create: async (data: any) => {
               const res = await fetch(`${API_URL}/groups`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
               });
               if (!res.ok) throw new Error('Failed to create group');
               return await res.json();
          },
          update: async (id: string, data: any) => { return {} as Group },
          delete: async (id: string) => { }
     },
     completions: {
          list: async () => {
               // Not fully implemented in backend yet
               return [] as Completion[];
          },
          toggle: async (assignmentId: string, userEmail: string) => {
               // Not implemented in backend yet
               return { completed: true };
          }
     },
     users: {
          list: async () => {
               const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
               if (!res.ok) throw new Error('Failed to fetch users');
               return await res.json() as User[];
          }
     }
};
