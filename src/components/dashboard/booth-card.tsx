"use client";

import { useApp } from "@/context/app-provider";
import type { Booth } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BoothCardProps {
  booth: Booth;
}

export default function BoothCard({ booth }: BoothCardProps) {
  const { users } = useApp();
  const assignedUser = users.find(u => u.id === booth.assignedTo);
  const createdByUser = users.find(u => u.id === booth.createdBy);
  const selectionPercentage = booth.voteCount > 0 ? (booth.selectedVotes.length / booth.voteCount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{booth.name}</CardTitle>
        <CardDescription>
          {booth.voteCount.toLocaleString()} Votes
          {assignedUser ? ` | Assigned to ${assignedUser.name}` : " | Unassigned"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            <Progress value={selectionPercentage} aria-label={`${selectionPercentage.toFixed(0)}% votes selected`} />
            <p className="text-sm text-muted-foreground">
                {booth.selectedVotes.length.toLocaleString()} of {booth.voteCount.toLocaleString()} votes selected ({selectionPercentage.toFixed(1)}%)
            </p>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Created by {createdByUser?.name || 'Unknown'}</p>
      </CardFooter>
    </Card>
  );
}
