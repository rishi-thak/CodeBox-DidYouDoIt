const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Types
export interface User {
     id: string;
     email: string;
     fullName: string;
     role: 'DEVELOPER' | 'TECH_LEAD' | 'PRODUCT_MANAGER' | 'BOARD_ADMIN'; // Updated roles
     createdAt: string;
}

export interface Group {
     id: string;
     name: string;
     description: string;
     createdAt: string;
     members: string[]; // emails
     _count?: { members: number };
}

export interface Assignment {
     id: string;
     title: string;
     description: string;
     type: 'VIDEO' | 'PDF' | 'LINK' | 'DOCUMENT';
     contentUrl: string;
     thumbnailUrl?: string;
     groupIds?: string[];
     assignedTo?: { groupId: string }[]; // Backend relation structure
     dueDate?: string;
     createdAt: string;
}

export interface Completion {
     id: string;
     assignmentId: string;
     userEmail: string;
     completedAt: string;
}

export interface AssignmentStats {
     assignmentTitle: string;
     totalAssigned: number;
     totalCompleted: number;
     completionRate: number;
     details: {
          userId: string;
          email: string;
          fullName: string;
          status: 'COMPLETED' | 'PENDING';
          completedAt: string | null;
     }[];
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
               if (!res.ok) {
                    const errorText = await res.text();
                    let errorMessage = errorText || res.statusText;
                    try {
                         const errorJson = JSON.parse(errorText);
                         if (errorJson.error) errorMessage = errorJson.error;
                    } catch (e) {
                         // ignore json parse error
                    }
                    throw new Error(errorMessage);
               }
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
               const data = await res.json();
               // Map backend structure to frontend interface
               return data.map((item: any) => ({
                    ...item,
                    groupIds: item.assignedTo?.map((rel: any) => rel.groupId) || []
               })) as Assignment[];
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
               const res = await fetch(`${API_URL}/assignments/${id}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
               });
               if (!res.ok) throw new Error('Failed to update assignment');
               return await res.json() as Assignment;
          },
          delete: async (id: string) => {
               const res = await fetch(`${API_URL}/assignments/${id}`, {
                    method: 'DELETE',
                    headers: getHeaders()
               });
               if (!res.ok) throw new Error('Failed to delete assignment');
               return await res.json();
          },
          getStats: async (id: string) => {
               const res = await fetch(`${API_URL}/assignments/${id}/stats`, { headers: getHeaders() });
               if (!res.ok) throw new Error('Failed to fetch assignment stats');
               return await res.json() as AssignmentStats;
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
          update: async (id: string, data: any) => {
               const res = await fetch(`${API_URL}/groups/${id}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
               });
               if (!res.ok) throw new Error('Failed to update group');
               return await res.json() as Group;
          },
          delete: async (id: string) => {
               const res = await fetch(`${API_URL}/groups/${id}`, {
                    method: 'DELETE',
                    headers: getHeaders()
               });
               if (!res.ok) throw new Error('Failed to delete group');
               return await res.json();
          }
     },
     completions: {
          list: async () => {
               const res = await fetch(`${API_URL}/completions`, { headers: getHeaders() });
               if (!res.ok) {
                    // If 404, it might just mean the route isn't implemented fully yet, so return empty
                    if (res.status === 404) return [];

                    const errorText = await res.text();
                    console.error("Completions Fetch Error:", errorText);
                    try {
                         const errorJson = JSON.parse(errorText);
                         throw new Error(`Failed to fetch completions: ${errorJson.error || res.statusText}`);
                    } catch (e) {
                         throw new Error(`Failed to fetch completions: ${res.status} ${res.statusText}`);
                    }
               }
               return await res.json() as Completion[];
          },
          toggle: async (assignmentId: string, userEmail: string) => { // userEmail param is largely ignored by backend now as it uses auth token
               const res = await fetch(`${API_URL}/completions/toggle`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ assignmentId })
               });
               if (!res.ok) throw new Error('Failed to toggle completion');
               return await res.json();
          }
     },
     users: {
          list: async () => {
               const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
               if (!res.ok) throw new Error('Failed to fetch users');
               return await res.json() as User[];
          },
          create: async (data: any) => {
               const res = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
               });
               if (!res.ok) throw new Error('Failed to create user');
               return await res.json();
          },
          update: async (id: string, data: any) => {
               const res = await fetch(`${API_URL}/users/${id}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
               });
               if (!res.ok) throw new Error('Failed to update user');
               return await res.json();
          },
          delete: async (ids: string[]) => {
               const res = await fetch(`${API_URL}/users/delete-many`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ ids })
               });
               if (!res.ok) throw new Error('Failed to delete users');
               return await res.json();
          }
     }
};
