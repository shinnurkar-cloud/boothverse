"use client";

import { useApp } from "@/context/app-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Vote, PlusCircle, User, CheckSquare, MoreHorizontal, Edit, Trash2, UserX, UserCheck } from "lucide-react";
import { useState } from "react";
import BoothCard from "./booth-card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import type { User as UserType } from "@/lib/types";
import { Badge } from "../ui/badge";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).regex(/^\S*$/, { message: "Username cannot contain spaces." }),
  passcode: z.string().regex(/^\d{5}$/, "Passcode must be 5 digits."),
});


function UserActions({ user }: { user: UserType }) {
  const { deleteUser, toggleUserStatus, updateUser } = useApp();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: user.name, passcode: user.passcode || "" },
  });

  function onEditSubmit(values: z.infer<typeof formSchema>) {
    updateUser(user.id, values);
    setIsEditDialogOpen(false);
  }
  
  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Sub-Admin</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="jane.doe" {...field} /></FormControl><FormMessage /></FormItem>
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
              This action cannot be undone. This will permanently delete the sub-admin and all users they have created.
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


export default function AdminDashboard() {
  const { users, addUser, booths, currentUser } = useApp();
  const [open, setOpen] = useState(false);

  const subAdmins = users.filter(u => u.role === 'Sub Admin' && u.createdBy === currentUser?.id);
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const totalBooths = booths.length;
  const totalVotes = booths.reduce((acc, booth) => acc + booth.voteCount, 0);
  const totalSelectedVotes = booths.reduce((acc, booth) => acc + booth.selectedVotes.length, 0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", passcode: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addUser(values.name, values.passcode, 'Sub Admin');
    form.reset();
    setOpen(false);
  }

  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Booths</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooths}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVotes.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected Votes</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSelectedVotes.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
                {totalVotes > 0 ? `${((totalSelectedVotes / totalVotes) * 100).toFixed(1)}% selected` : '0.0% selected'}
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="booths">
        <TabsList>
          <TabsTrigger value="booths">Booths Overview</TabsTrigger>
          <TabsTrigger value="sub-admins">Manage Sub-Admins</TabsTrigger>
        </TabsList>
        <TabsContent value="booths" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {booths.map(booth => <BoothCard key={booth.id} booth={booth} />)}
            </div>
        </TabsContent>
        <TabsContent value="sub-admins" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Sub-Admins</CardTitle>
                    <CardDescription>Create and manage sub-admins.</CardDescription>
                </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />Add Sub-Admin</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create New Sub-Admin</DialogTitle></DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="jane.doe" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="passcode" render={({ field }) => (
                        <FormItem><FormLabel>5-Digit Passcode</FormLabel><FormControl><Input type="text" maxLength={5} placeholder="e.g., 12345" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" className="w-full">Create Sub-Admin</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Passcode</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {subAdmins.length > 0 ? subAdmins.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar><AvatarImage src={user.avatar} alt={user.name} /><AvatarFallback>{getInitials(user.name)}</AvatarFallback></Avatar>
                          <div><p className="font-medium">{user.name}</p></div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={user.active ? "secondary" : "outline"}>{user.active ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell>{user.passcode}</TableCell>
                      <TableCell className="text-right">
                        <UserActions user={user} />
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="text-center">No sub-admins found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
