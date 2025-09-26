'use client';

import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Role, Booth, Box } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  useFirebase,
  useUser as useAuthUser,
  useCollection,
  useDoc,
  initiateEmailSignIn,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  doc,
  query,
  where,
  setDoc,
  writeBatch,
  collectionGroup,
  getDocs,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';


interface AppContextType {
  // Auth
  currentUser: User | null;
  isUserLoading: boolean;
  login: (username: string, passcode: string) => void;
  logout: () => void;
  // Data
  users: User[];
  booths: Booth[];
  boxes: Box[];
  addUser: (name: string, passcode: string, email: string, role: Role) => void;
  updateUser: (userId: string, updates: Partial<Pick<User, 'username' | 'email'>>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  addBooth: (name: string, numberOfBoxes: number, userId: string | null) => void;
  updateBoothSelection: (boothId: string, boxId: string, isSelected: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const { user: authUser, isUserLoading: isAuthUserLoading } = useAuthUser();

  const userDocRef = useMemoFirebase(
    () => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser]
  );
  const { data: currentUser, isLoading: isCurrentUserLoading } = useDoc<User>(userDocRef);

  // Determine which users to fetch based on the current user's role
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    switch (currentUser.role) {
      case 'Super-Admin':
        // Super-Admin sees all admins
        return query(collection(firestore, 'users'), where('role', '==', 'Admin'));
      case 'Admin':
         // Admin sees all sub-admins they created
        return query(collection(firestore, 'users'), where('subAdminId', '==', currentUser.id));
      case 'Sub Admin':
        // Sub Admin sees all users they created
        return query(collection(firestore, 'users'), where('subAdminId', '==', currentUser.id));
      default:
        // Regular users don't need to see a list of other users.
        return null;
    }
  }, [firestore, currentUser]);
  const { data: users = [] } = useCollection<User>(usersQuery);
  
  // Determine which booths to fetch
  const boothsQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
     switch (currentUser.role) {
      case 'User':
        // User sees booths assigned to them
        return query(collection(firestore, 'booths'), where('userId', '==', currentUser.id));
      case 'Sub Admin':
         // Sub Admin sees booths they created
        return query(collection(firestore, 'booths'), where('subAdminId', '==', currentUser.id));
      case 'Admin':
        // Admin sees all booths created by their Sub Admins
        const subAdminIds = users.filter(u => u.role === 'Sub Admin').map(u => u.id);
        if (subAdminIds.length === 0) return null;
        return query(collection(firestore, 'booths'), where('subAdminId', 'in', subAdminIds));
      case 'Super-Admin':
        // Super-Admin can see all booths
        return collection(firestore, 'booths');
      default:
        return null;
    }
  }, [firestore, currentUser, users]);
  const { data: booths = [] } = useCollection<Booth>(boothsQuery);

  const boxesQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    const relevantBoothIds = booths.map(b => b.id);
    if (relevantBoothIds.length > 0) {
      return query(collectionGroup(firestore, 'boxes'), where('boothId', 'in', relevantBoothIds));
    }
    return null;
  }, [firestore, currentUser, booths]);
  const { data: boxes = [] } = useCollection<Box>(boxesQuery);


  const login = useCallback(
    async (username: string, passcode: string) => {
      if (!auth || !firestore) return;
      try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({
                title: "Login Failed",
                description: "User not found. Please check your username.",
                variant: "destructive",
            });
            return;
        }

        // Assuming username is unique, so we take the first result
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as User;
        
        initiateEmailSignIn(auth, userData.email, passcode);
      } catch (error) {
          console.error("Login error:", error);
          toast({
              title: "Login Error",
              description: "An unexpected error occurred during login.",
              variant: "destructive",
          });
      }
    },
    [auth, firestore, toast]
  );

  const logout = useCallback(() => {
    if (!auth) return;
    auth.signOut();
    router.push('/');
  }, [auth, router]);

  const addUser = useCallback(
    async (username: string, passcode: string, email: string, role: Role) => {
      if (!currentUser || !firestore || !auth) return;
  
      try {
        // Check if username already exists
        const usernameQuery = query(collection(firestore, 'users'), where('username', '==', username));
        const usernameSnapshot = await getDocs(usernameQuery);
        if (!usernameSnapshot.empty) {
          toast({
            title: "Username already exists",
            description: "Please choose a different username.",
            variant: "destructive"
          });
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, passcode);
        const newUserId = userCredential.user.uid;
        const newUserDocRef = doc(firestore, 'users', newUserId);
        
        let parentIdField: Partial<User> = {};
        if (role === 'User' && currentUser.role === 'Sub Admin') {
          parentIdField.subAdminId = currentUser.id;
        } else if (role === 'Sub Admin' && currentUser.role === 'Admin') {
          parentIdField.subAdminId = currentUser.id; // subAdminId is the creator id
        } else if (role === 'Admin' && currentUser.role === 'Super-Admin') {
           parentIdField.subAdminId = currentUser.id; // subAdminId is the creator id
        }

        const newUser: User = {
          id: newUserId,
          username,
          email,
          role,
          ...parentIdField
        };
        
        await setDoc(newUserDocRef, newUser);
        
        toast({
          title: "User Created",
          description: `${username} has been added as a ${role}.`,
        });
      } catch (error: any) {
        console.error("Error creating user:", error);
        toast({
          title: "User creation failed",
          description: error.message || "An unknown error occurred.",
          variant: "destructive"
        });
      }
    },
    [auth, firestore, currentUser, toast]
  );

  const updateUser = useCallback((userId: string, updates: Partial<Pick<User, 'username' | 'email'>>) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(userDocRef, updates);
    toast({ title: "User Updated", description: `User has been updated.` });
  }, [firestore, toast]);

  const deleteUser = useCallback((userId: string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    deleteDocumentNonBlocking(userDocRef);
    toast({ title: "User Deleted", description: `User record has been deleted from Firestore.` });
  }, [firestore, toast]);

  const toggleUserStatus = useCallback((userId: string) => {
    console.log("Toggling status for user:", userId);
    toast({ title: "Status Update", description: "Status update functionality needs to be fully implemented." });
  }, [toast]);

  const addBooth = useCallback(async (name: string, numberOfBoxes: number, userId: string | null) => {
    if (!currentUser || !firestore) return;

    const newBoothRef = doc(collection(firestore, 'booths'));
    const newBooth: Booth = {
      id: newBoothRef.id,
      name,
      numberOfBoxes,
      subAdminId: currentUser.id,
      userId: userId || undefined,
    };
    
    try {
      const batch = writeBatch(firestore);
      batch.set(newBoothRef, newBooth);

      for (let i = 1; i <= numberOfBoxes; i++) {
        const boxDocRef = doc(collection(firestore, `booths/${newBoothRef.id}/boxes`));
        const boxData: Box = { 
          id: boxDocRef.id,
          boxNumber: i, 
          isSelected: false, 
          boothId: newBoothRef.id 
        };
        batch.set(boxDocRef, boxData);
      }

      await batch.commit();
      
      toast({
        title: "Booth Created",
        description: `Booth "${name}" with ${numberOfBoxes} boxes has been created.`,
      });
    } catch (err) {
      console.error("Error creating booth or boxes:", err);
      toast({
          title: "Error",
          description: "Could not create booth.",
          variant: "destructive"
      })
    }
  }, [firestore, currentUser, toast]);


  const updateBoothSelection = useCallback((boothId: string, boxId: string, isSelected: boolean) => {
    if (!firestore) return;
    const boxDocRef = doc(firestore, 'booths', boothId, 'boxes', boxId);
    updateDocumentNonBlocking(boxDocRef, { isSelected });
  }, [firestore]);


  const value: AppContextType = {
    currentUser,
    isUserLoading: isAuthUserLoading || isCurrentUserLoading,
    login,
    logout,
    users,
    booths,
    boxes,
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
