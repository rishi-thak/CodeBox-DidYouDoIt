

// Types
export interface User {
     id: string;
     email: string;
     full_name: string;
     role: 'admin' | 'user';
     created_date: string;
}

export interface Group {
     id: string;
     name: string;
     description: string;
     members: string[]; // emails
     created_date: string;
}

export interface Assignment {
     id: string;
     title: string;
     description: string;
     type: 'video' | 'pdf' | 'link' | 'document';
     content_url: string;
     thumbnail_url?: string;
     assigned_groups: string[]; // group ids
     due_date?: string;
     created_date: string;
}

export interface Completion {
     id: string;
     assignment_id: string;
     user_email: string;
     completed_at: string;
}

// Mock Data
const users: User[] = [
     {
          id: 'user_1',
          email: 'alice@example.com',
          full_name: 'Alice Johnson',
          role: 'user',
          created_date: new Date().toISOString()
     },
     {
          id: 'user_2',
          email: 'admin@example.com',
          full_name: 'Admin User',
          role: 'admin',
          created_date: new Date().toISOString()
     },
     {
          id: 'user_3',
          email: 'bob@example.com',
          full_name: 'Bob Smith',
          role: 'user',
          created_date: new Date().toISOString()
     }
];

let currentUser: User | null = null; // Simulating auth state

const groups: Group[] = [
     {
          id: 'grp_1',
          name: 'Engineering Team',
          description: 'Software development team',
          members: ['alice@example.com', 'bob@example.com'],
          created_date: new Date().toISOString()
     },
     {
          id: 'grp_2',
          name: 'Design Team',
          description: 'Product design team',
          members: ['alice@example.com'],
          created_date: new Date().toISOString()
     }
];

const assignments: Assignment[] = [
     {
          id: 'asn_1',
          title: 'React Hooks Tutorial',
          description: 'Learn useState and useEffect in depth.',
          type: 'video',
          content_url: 'https://youtube.com/watch?v=dpw9EHDh2bM',
          assigned_groups: ['grp_1'],
          due_date: '2025-02-01',
          created_date: new Date().toISOString()
     },
     {
          id: 'asn_2',
          title: 'Git Cheat Sheet',
          description: 'Common git commands for daily use.',
          type: 'pdf',
          content_url: 'https://education.github.com/git-cheat-sheet-education.pdf',
          assigned_groups: [], // Everyone
          created_date: new Date().toISOString()
     },
     {
          id: 'asn_3',
          title: 'Company Handbook',
          description: 'Read the company policies.',
          type: 'document',
          content_url: 'https://example.com/handbook',
          assigned_groups: ['grp_2'],
          created_date: new Date().toISOString()
     },
     {
          id: 'asn_4',
          title: 'Advanced Typescript',
          description: 'Deep dive into generics.',
          type: 'link',
          content_url: 'https://typescriptlang.org',
          assigned_groups: ['grp_1'],
          created_date: new Date().toISOString()
     }
];

const completions: Completion[] = [
     {
          id: 'cmp_1',
          assignment_id: 'asn_2',
          user_email: 'alice@example.com',
          completed_at: '2025-01-15T10:30:00Z'
     }
];

// Mock API Functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
     auth: {
          login: async (email: string, role: 'admin' | 'user' = 'user') => {
               await delay(500);
               let user = users.find(u => u.email === email);
               if (!user) {
                    // Create new user on the fly for prototype
                    user = {
                         id: `user_${Date.now()}`,
                         email,
                         full_name: email.split('@')[0],
                         role,
                         created_date: new Date().toISOString()
                    };
                    users.push(user);
               } else {
                    // Update role if switching access type (just for prototype flexibility)
                    user.role = role;
               }
               currentUser = user;
               return user;
          },
          logout: async () => {
               await delay(200);
               currentUser = null;
          },
          me: async () => {
               await delay(300);
               // For prototype, default to admin if not set, or return null?
               // Instructions say "If not authenticated -> redirect to Home"
               // Let's simulate no user by default, but let's provide a way to login easily.
               return currentUser;
          }
     },
     assignments: {
          list: async () => {
               await delay(500);
               return [...assignments];
          },
          create: async (data: Omit<Assignment, 'id' | 'created_date'>) => {
               await delay(500);
               const newAsn: Assignment = {
                    ...data,
                    id: `asn_${Date.now()}`,
                    created_date: new Date().toISOString()
               };
               assignments.push(newAsn);
               return newAsn;
          },
          update: async (id: string, data: Partial<Assignment>) => {
               await delay(500);
               const index = assignments.findIndex(a => a.id === id);
               if (index === -1) throw new Error('Assignment not found');
               assignments[index] = { ...assignments[index], ...data };
               return assignments[index];
          },
          delete: async (id: string) => {
               await delay(500);
               const index = assignments.findIndex(a => a.id === id);
               if (index !== -1) assignments.splice(index, 1);
          }
     },
     groups: {
          list: async () => {
               await delay(500);
               return [...groups];
          },
          create: async (data: Omit<Group, 'id' | 'created_date'>) => {
               await delay(500);
               const newGrp: Group = {
                    ...data,
                    id: `grp_${Date.now()}`,
                    created_date: new Date().toISOString()
               };
               groups.push(newGrp);
               return newGrp;
          },
          update: async (id: string, data: Partial<Group>) => {
               await delay(500);
               const index = groups.findIndex(g => g.id === id);
               if (index === -1) throw new Error('Group not found');
               groups[index] = { ...groups[index], ...data };
               return groups[index];
          },
          delete: async (id: string) => {
               await delay(500);
               const index = groups.findIndex(g => g.id === id);
               if (index !== -1) groups.splice(index, 1);
          }
     },
     completions: {
          list: async () => {
               await delay(500);
               return [...completions];
          },
          toggle: async (assignmentId: string, userEmail: string) => {
               await delay(300);
               const index = completions.findIndex(c => c.assignment_id === assignmentId && c.user_email === userEmail);
               if (index !== -1) {
                    completions.splice(index, 1);
                    return { completed: false };
               } else {
                    const newCmp: Completion = {
                         id: `cmp_${Date.now()}`,
                         assignment_id: assignmentId,
                         user_email: userEmail,
                         completed_at: new Date().toISOString()
                    };
                    completions.push(newCmp);
                    return { completed: true };
               }
          }
     },
     users: {
          list: async () => {
               await delay(500);
               return [...users];
          }
     }
};
