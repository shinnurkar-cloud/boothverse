"use client";

import { useApp } from "@/context/app-provider";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export default function UserDashboard() {
  const { currentUser, booths } = useApp();

  if (!currentUser) return null;

  const myBooths = booths.filter(b => b.assignedTo === currentUser.id);

  return (
    <div className="space-y-4">
      <CardHeader className="p-0">
        <CardTitle>My Booths</CardTitle>
        <CardDescription>
          Here are the booths assigned to you. Click on a booth to view and select votes.
        </CardDescription>
      </CardHeader>
      
      {myBooths.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myBooths.map(booth => (
            <Link key={booth.id} href={`/booths/${booth.id}`} passHref>
              <Card className="flex h-full flex-col transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader>
                  <CardTitle>{booth.name}</CardTitle>
                  <CardDescription>{booth.voteCount.toLocaleString()} votes</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm">
                    <span className="font-semibold text-primary">{booth.selectedVotes.length}</span> votes selected
                  </p>
                </CardContent>
                <CardFooter>
                    <Button variant="link" className="p-0">
                        Select Votes <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="mt-4 flex items-center justify-center py-12">
            <CardContent>
                <p className="text-center text-muted-foreground">You have not been assigned any booths yet.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
