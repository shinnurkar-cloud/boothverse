
"use client";

import { useApp } from "@/context/app-provider";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BoothSelectorProps {
  boothId: string;
}

export function BoothSelector({ boothId }: BoothSelectorProps) {
  const { booths, updateBoothSelection } = useApp();
  const booth = booths.find(b => b.id === boothId);
  const { toast } = useToast();

  const [selectedVotes, setSelectedVotes] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (booth) {
      setSelectedVotes(new Set(booth.selectedVotes));
    }
  }, [booth]);

  if (!booth) {
    // In a real app, you might show a loading state before the notFound call
    return notFound();
  }

  const toggleVoteSelection = (voteNumber: number) => {
    const newSelection = new Set(selectedVotes);
    if (newSelection.has(voteNumber)) {
      newSelection.delete(voteNumber);
    } else {
      newSelection.add(voteNumber);
    }
    setSelectedVotes(newSelection);
    updateBoothSelection(booth.id, Array.from(newSelection));
    toast({
        title: "Selection Updated",
        description: `Your vote selections have been saved.`,
      });
  };

  const voteNumbers = Array.from({ length: booth.voteCount }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
        </Link>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">{booth.name}</CardTitle>
          <CardDescription>
            Select votes from the grid below. Selections are saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/50 p-3">
            <h3 className="font-semibold text-foreground/80">Selection Summary</h3>
            <Badge variant="secondary" className="text-base font-semibold">{selectedVotes.size} / {booth.voteCount}</Badge>
          </div>
          <div className={cn(
            "grid gap-1.5 sm:gap-2",
            booth.voteCount > 500 ? "grid-cols-20" : 
            booth.voteCount > 100 ? "grid-cols-15" : "grid-cols-10"
          )}>
            {voteNumbers.map((voteNumber) => (
              <button
                key={voteNumber}
                onClick={() => toggleVoteSelection(voteNumber)}
                aria-pressed={selectedVotes.has(voteNumber)}
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center font-mono text-xs transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  selectedVotes.has(voteNumber)
                    ? "bg-accent text-accent-foreground shadow-lg scale-105"
                    : "bg-card border hover:bg-muted/70"
                )}
              >
                {voteNumber}
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">Your changes are saved automatically.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
