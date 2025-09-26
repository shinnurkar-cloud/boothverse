"use client";

import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { initialUsers, initialBooths } from '@/lib/data';
import type { User, Role, Booth } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const MASTER_PASSCODE = "91111";

interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (name: string, passcode?: string) => void;
  logout: () => void;
  // Data
  users: User[];
  booths: Booth[];
  addUser: (name: string, passcode: string, role: Role) => void;
  updateUser: (userId: string, updates: Partial<Pick<User, 'name' | 'passcode'>>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  addBooth: (name: string, voteCount: number, assignedTo: string | null) => void;
  updateBoothSelection: (boothId: string, selectedVotes: number[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data State
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [booths, setBooths] = useState<Booth[]>(initialBooths);

  const login = useCallback((name: string, passcode?: string) => {
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

    if (user) {
        if (!user.active) {
            setTimeout(() => toast({ title: "Login Failed", description: "This account has been deactivated.", variant: "destructive" }), 0);
            return;
        }

        if (user.passcode === passcode || (user.role !== 'Super-Admin' && passcode === MASTER_PASSCODE)) {
          setCurrentUser(user);
          router.push('/dashboard');
        } else {
          setTimeout(() => toast({ title: "Login Failed", description: "Invalid username or passcode.", variant: "destructive" }), 0);
        }
    } else {
        setTimeout(() => toast({
          title: "Login Failed",
          description: "User not found.",
          variant: "destructive",
        }), 0);
    }
  }, [users, router, toast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    router.push('/');
  }, [router]);

  const addUser = useCallback((name: string, passcode: string, role: Role) => {
    if (!currentUser) return;

    const userExists = users.some(u => 
        (u.role === role && u.createdBy === currentUser.id && u.name.toLowerCase() === name.toLowerCase()) ||
        (u.name.toLowerCase() === name.toLowerCase() && u.role === 'Admin' && role === 'Admin')
    );
    
    if (userExists) {
        setTimeout(() => toast({
            title: "User creation failed",
            description: `A user with this name already exists in this hierarchy.`,
            variant: "destructive"
        }), 0);
        return;
    }
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        role,
        passcode,
        createdBy: currentUser.id,
        avatar: `https://picsum.photos/seed/avatar${Date.now()}/100/100`,
        active: true,
    };

    setUsers(prev => [...prev, newUser]);
    setTimeout(() => toast({
        title: "User Created",
        description: `${name} has been added as a ${role}.`,
      }), 0);
  }, [currentUser, toast, users]);

  const updateUser = useCallback((userId: string, updates: Partial<Pick<User, 'name' | 'passcode'>>) => {
    setUsers(prevUsers => {
      const targetUser = prevUsers.find(u => u.id === userId);
      if (!targetUser) {
          setTimeout(() => toast({ title: "Update Failed", description: "User not found.", variant: "destructive" }), 0);
          return prevUsers;
      }
      
      // Check for username uniqueness if it's being changed
      if (updates.name && updates.name !== targetUser.name) {
          const isDuplicate = prevUsers.some(u => 
              u.id !== userId &&
              u.role === targetUser.role &&
              u.createdBy === targetUser.createdBy &&
              u.name.toLowerCase() === updates.name?.toLowerCase()
          );
          if (isDuplicate) {
              setTimeout(() => toast({ title: "Update Failed", description: `A user with the name "${updates.name}" already exists.`, variant: "destructive" }), 0);
              return prevUsers;
          }
      }

      setTimeout(() => toast({ title: "User Updated", description: `User ${targetUser.name} has been updated.` }), 0);
      return prevUsers.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      );
    });
  }, [toast]);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prevUsers => {
        const userToDelete = prevUsers.find(u => u.id === userId);
        if (!userToDelete) return prevUsers;

        const descendentsToDelete = new Set<string>();
        descendentsToDelete.add(userId);

        let currentLayer = [userId];
        while (currentLayer.length > 0) {
            const nextLayer: string[] = [];
            for (const parentId of currentLayer) {
                prevUsers.forEach(u => {
                    if (u.createdBy === parentId) {
                        descendentsToDelete.add(u.id);
                        nextLayer.push(u.id);
                    }
                });
            }
            currentLayer = nextLayer;
        }

        const newUsers = prevUsers.filter(u => !descendentsToDelete.has(u.id));
        
        setBooths(prevBooths => prevBooths.map(b => 
            descendentsToDelete.has(b.assignedTo || '') ? { ...b, assignedTo: null } : b
        ));

        setTimeout(() => toast({ title: "User Deleted", description: `User ${userToDelete.name} and all their subordinates have been deleted.` }), 0);
        return newUsers;
    });
  }, [toast]);

  const toggleUserStatus = useCallback((userId: string) => {
    setUsers(prevUsers => {
        const user = prevUsers.find(u => u.id === userId);
        if (user) {
            setTimeout(() => toast({ title: "Status Updated", description: `User ${user.name} has been ${user.active ? 'deactivated' : 'activated'}.` }), 0);
        }
        return prevUsers.map(u => u.id === userId ? { ...u, active: !u.active } : u);
    })
  }, [toast]);

  const addBooth = useCallback((name: string, voteCount: number, assignedTo: string | null) => {
    if (!currentUser) return;
    const newBooth: Booth = {
        id: `booth-${Date.now()}`,
        name,
        voteCount,
        assignedTo,
        createdBy: currentUser.id,
        selectedVotes: [],
    };
    setBooths(prev => [...prev, newBooth]);
    setTimeout(() => toast({
        title: "Booth Created",
        description: `Booth "${name}" with ${voteCount} votes has been created.`,
      }), 0);
  }, [currentUser, toast]);

  const updateBoothSelection = useCallback((boothId: string, selectedVotes: number[]) => {
    setBooths(prevBooths => prevBooths.map(b => b.id === boothId ? { ...b, selectedVotes } : b));
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    users,
    booths,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    addBooth,
    updateBoothSelection,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
