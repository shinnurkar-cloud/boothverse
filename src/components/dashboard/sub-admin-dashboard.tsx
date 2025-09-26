
"use client";

import { useApp } from "@/context/app-provider";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ChevronDown, ChevronUp, MoreHorizontal, Edit, Trash2, UserX, UserCheck } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import type { User as UserType } from "@/lib/types";

function UserVoteChart({ userId }: { userId: string }) {
    const { booths } = useApp();
    const userBooths = booths.filter(b => b.assignedTo === userId);
    if (userBooths.length === 0) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          This user has no booths assigned.
        </div>
      );
    }
  
    const allUserVotes = userBooths.flatMap(booth => {
      const voteNumbers = Array.from({ length: booth.voteCount }, (_, i) => i + 1);
      return voteNumbers.map(voteNumber => ({
        boothId: booth.id,
        boothName: booth.name,
        voteNumber: voteNumber,
        isSelected: booth.selectedVotes.includes(voteNumber)
      }));
    });
    
    const totalSelectedVotes = allUserVotes.filter(b => b.isSelected).length;
    const totalVotes = allUserVotes.length;

    return (
        <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold">User's Vote Overview</h4>
                <Badge className="text-base">{totalSelectedVotes} / {totalVotes}</Badge>
            </div>
            <div className={cn(
                "grid gap-1.5 sm:gap-2",
                totalVotes > 500 ? "grid-cols-20" : 
                totalVotes > 100 ? "grid-cols-15" : "grid-cols-10"
            )}>
                {allUserVotes.map((vote) => (
                    <div
                        key={`${vote.boothId}-${vote.voteNumber}`}
                        title={`${vote.boothName} - Vote ${vote.voteNumber}`}
                        className={cn(
                            "aspect-square rounded-md flex items-center justify-center font-mono text-xs",
                            vote.isSelected
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "bg-card border"
                        )}
                    >
                         {vote.voteNumber}
                    </div>
                ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">{totalSelectedVotes} of {totalVotes} votes selected</p>
        </div>
    );
}

const userFormSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters.").regex(/^\S*$/, { message: "Username cannot contain spaces." }),
  passcode: z.string().regex(/^\d{5}$/, "Passcode must be 5 digits."),
});

const boothFormSchema = z.object({
  name: z.string().min(3, "Booth name must be at least 3 characters."),
  voteCount: z.coerce.number().int().min(1, "Must have at least 1 vote.").max(10000, "Cannot exceed 10,000 votes."),
  assignedTo: z.string().optional().nullable(),
});

function UserActions({ user }: { user: UserType }) {
  const { deleteUser, toggleUserStatus, updateUser } = useApp();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: user.name, passcode: user.passcode || "" },
  });

  function onEditSubmit(values: z.infer<typeof userFormSchema>) {
    updateUser(user.id, values);
    setIsEditDialogOpen(false);
  }
  
  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="john.doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="passcode" render={({ field }) => (
                <FormItem><FormLabel>5-Digit Passcode</FormLabel><FormControl><Input type="text" maxLength={5} placeholder="e.g., 12345" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
              {user.active ? <><UserX className="mr-2 h-4 w-4" /> Deactivate</> : <><UserCheck className="mr-2 h-4 w-4" /> Activate</>}
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
      </AlertDialog>
    </>
  );
}


export default function SubAdminDashboard() {
  const { currentUser, users, booths, addUser, addBooth } = useApp();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [boothModalOpen, setBoothModalOpen] = useState(false);
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});

  const toggleCollapsible = (userId: string) => {
    setOpenCollapsibles(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const managedUsers = users.filter(u => u.role === 'User' && u.createdBy === currentUser?.id);
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');
  const managedBooths = booths.filter(b => b.createdBy === currentUser?.id);
  
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: "", passcode: "" },
  });

  const boothForm = useForm<z.infer<typeof boothFormSchema>>({
    resolver: zodResolver(boothFormSchema),
    defaultValues: { name: "", voteCount: 100, assignedTo: null },
  });

  function onUserSubmit(values: z.infer<typeof userFormSchema>) {
    addUser(values.name, values.passcode, 'User');
    userForm.reset();
    setUserModalOpen(false);
  }

  function onBoothSubmit(values: z.infer<typeof boothFormSchema>) {
    addBooth(values.name, values.voteCount, values.assignedTo || null);
    boothForm.reset();
    setBoothModalOpen(false);
  }

  return (
    <Tabs defaultValue="users">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="users">Manage Users</TabsTrigger>
        <TabsTrigger value="booths">Manage Booths</TabsTrigger>
      </TabsList>
      <TabsContent value="users" className="mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>Create and manage booth users. Click a user to see their vote selections.</CardDescription>
            </div>
            <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
              <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />Add User</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
                <Form {...userForm}><form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                  <FormField control={userForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="john.doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={userForm.control} name="passcode" render={({ field }) => (
                    <FormItem><FormLabel>5-Digit Passcode</FormLabel><FormControl><Input type="text" maxLength={5} placeholder="e.g., 12345" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full">Create User</Button>
                </form></Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent><Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Passcode</TableHead>
                    <TableHead>Selected Votes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {managedUsers.length > 0 ? (
                managedUsers.map(user => {
                    const userBooths = booths.filter(booth => booth.assignedTo === user.id);
                    const totalSelectedVotes = userBooths.reduce((acc, booth) => acc + booth.selectedVotes.length, 0);
                    const totalVotes = userBooths.reduce((acc, booth) => acc + booth.voteCount, 0);
                    const selectionPercentage = totalVotes > 0 ? (totalSelectedVotes / totalVotes) * 100 : 0;
                    const isOpen = openCollapsibles[user.id] || false;
                    
                    return (
                      <React.Fragment key={user.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/50 border-b"
                          onClick={() => toggleCollapsible(user.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.active ? 'secondary' : 'outline'}>
                              {user.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.passcode}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {totalSelectedVotes.toLocaleString()} / {totalVotes.toLocaleString()}
                              <span className="text-xs text-muted-foreground">
                                ({selectionPercentage.toFixed(1)}%)
                              </span>
                              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <UserActions user={user} />
                          </TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0">
                              <div className="p-2">
                                <UserVoteChart userId={user.id} />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table></CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="booths" className="mt-4">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Booths</CardTitle>
                <CardDescription>Create booths and assign them to users.</CardDescription>
            </div>
            <Dialog open={boothModalOpen} onOpenChange={setBoothModalOpen}>
              <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />Add Booth</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Booth</DialogTitle></DialogHeader>
                <Form {...boothForm}><form onSubmit={boothForm.handleSubmit(onBoothSubmit)} className="space-y-4">
                  <FormField control={boothForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Booth Name</FormLabel><FormControl><Input placeholder="e.g., North Hall Section 1" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={boothForm.control} name="voteCount" render={({ field }) => (
                    <FormItem><FormLabel>Number of Votes</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={boothForm.control} name="assignedTo" render={({ field }) => (
                    <FormItem><FormLabel>Assign to User (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger></FormControl><SelectContent>
                        {managedUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent></Select>
                    <FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full">Create Booth</Button>
                </form></Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent><Table>
            <TableHeader><TableRow><TableHead>Booth Name</TableHead><TableHead className="text-right">Votes</TableHead><TableHead>Assigned To</TableHead></TableRow></TableHeader>
            <TableBody>{managedBooths.length > 0 ? managedBooths.map(booth => {
              const assignedUser = users.find(u => u.id === booth.assignedTo);
              return (
              <TableRow key={booth.id}><TableCell className="font-medium">{booth.name}</TableCell>
              <TableCell className="text-right">{booth.voteCount}</TableCell>
              <TableCell>{assignedUser ? <Badge variant="secondary">{assignedUser.name}</Badge> : <Badge variant="outline">Unassigned</Badge>}</TableCell>
              </TableRow>
            )}) : <TableRow><TableCell colSpan={3} className="text-center">No booths found.</TableCell></TableRow>}</TableBody>
          </Table></CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
