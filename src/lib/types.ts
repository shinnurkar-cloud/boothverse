export type Role = 'Super-Admin' | 'Admin' | 'Sub Admin' | 'User';

export interface User {
  id: string;
  name: string;
  email?: string; // Only for Super Admin
  passcode?: string;
  role: Role;
  avatar: string;
  createdBy?: string; // Who created this user
  active: boolean; // To activate/deactivate user
}

export interface Booth {
  id: string;
  name: string;
  voteCount: number;
  assignedTo: string | null; // userId
  createdBy: string; // sub-admin userId
  selectedVotes: number[];
}
