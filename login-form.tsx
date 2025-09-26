"use client";

import { useState } from "react";
import { useApp } from "@/context/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, { message: "Please enter your username." }),
  passcode: z.string().min(1, { message: "Passcode is required." }),
});

export function LoginForm() {
  const { login, isUserLoading } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", passcode: "" },
  });

  const handleLogin = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    login(values.username, values.passcode);
    // The loading state will be handled by the isUserLoading from the context
  };
  
  const combinedIsLoading = isLoading || isUserLoading;

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="grid gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passcode</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your passcode" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={combinedIsLoading}>
            {combinedIsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  );
}
