/**
 * Client rendering page for a sign-up form.
 * We use React Hook Form from shadcn here: https://ui.shadcn.com/docs/components/form
 */
"use client";

import { useForm } from "react-hook-form";
import { signUpSchema, SingUpValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUp } from "@/app/(auth)/signup/actions";

export default function SignUpForm() {
  const [error, setError] = useState<string>();

  const [isPending, startTransition] = useTransition();

  const form = useForm<SingUpValues>({
    // we inject our sign-up schema into the resolver, it will automatically apply all the validation rules
    resolver: zodResolver(signUpSchema),
    // we have to explicitly set the values as empty strings, because they are undefined per default
    // the validators will not apply min() to it
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: SingUpValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await signUp(values);

      if (error) setError(error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field}></Input>
              </FormControl>
              <FormMessage></FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field}></Input>
              </FormControl>
              <FormMessage></FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Password"
                  type="password"
                  {...field}
                ></Input>
              </FormControl>
              <FormMessage></FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>
    </Form>
  );
}
