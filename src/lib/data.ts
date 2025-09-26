
import type { User, Booth } from './types';

export const initialUsers: User[] = [
  { id: 'user-1', name: 'Super-Admin', email: 'super@boothverse.com', role: 'Super-Admin', passcode: '270385', avatar: 'https://picsum.photos/seed/avatar1/100/100', active: true },
  { id: 'user-2', name: 'Alice-Admin', passcode: '11111', role: 'Admin', createdBy: 'user-1', avatar: 'https://picsum.photos/seed/avatar2/100/100', active: true },
  { id: 'user-3', name: 'Bob Sub-Admin', passcode: '55555', role: 'Sub Admin', createdBy: 'user-2', avatar: 'https://picsum.photos/seed/avatar3/100/100', active: true },
  { id: 'user-4', name: 'charlie', passcode: '12345', role: 'User', createdBy: 'user-3', avatar: 'https://picsum.photos/seed/avatar4/100/100', active: true },
  { id: 'user-5', name: 'diana', passcode: '54321', role: 'User', createdBy: 'user-3', avatar: 'https://picsum.photos/seed/avatar5/100/100', active: true },
  { id: 'user-6', name: 'Eve Sub-Admin', passcode: '66666', role: 'Sub Admin', createdBy: 'user-2', avatar: 'https://picsum.photos/seed/avatar6/100/100', active: true },
  { id: 'user-7', name: 'frank', passcode: '67890', role: 'User', createdBy: 'user-6', avatar: 'https://picsum.photos/seed/avatar7/100/100', active: true },
];

export const initialBooths: Booth[] = [
  {
    id: 'booth-1',
    name: 'Main Hall - Section A',
    voteCount: 100,
    assignedTo: 'user-4',
    createdBy: 'user-3',
    selectedVotes: [5, 12, 25, 67, 89],
  },
  {
    id: 'booth-2',
    name: 'Main Hall - Section B',
    voteCount: 150,
    assignedTo: 'user-4',
    createdBy: 'user-3',
    selectedVotes: [],
  },
  {
    id: 'booth-3',
    name: 'Exhibition Area',
    voteCount: 50,
    assignedTo: 'user-5',
    createdBy: 'user-3',
    selectedVotes: [1, 2, 3, 4, 5, 10, 20, 30, 40, 50],
  },
  {
    id: 'booth-4',
    name: 'West Wing',
    voteCount: 200,
    assignedTo: 'user-7',
    createdBy: 'user-6',
    selectedVotes: Array.from({ length: 25 }, (_, i) => i + 10),
  },
    {
    id: 'booth-5',
    name: 'East Wing',
    voteCount: 1500,
    assignedTo: null,
    createdBy: 'user-6',
    selectedVotes: [],
  },
];
