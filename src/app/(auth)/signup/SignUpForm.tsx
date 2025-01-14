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
import { PasswordInput } from "@/components/PasswordInput";

export default function SignUpForm() {
  const [error, setError] = useState<string>();

  /**
   * We have to wrap server actions into a transition.
   * The problem: we could have errors from backend, like already existing username, etc.
   * If we do not wrap it, it looks like pending for the user.
   */
  const [isPending, startTransition] = useTransition();

  /**
   * Form model based on sign-up values.
   */
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

  /**
   * Handling the errors occurs on the backend by wrapping the call into startTransition.
   * @param values
   */
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
        {error && <p className="text-center text-destructive">{error}</p>}
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
                {/*                <Input
                  placeholder="Password"
                  type="password"
                  {...field}
                ></Input>*/}
                <PasswordInput
                  placeholder="Password"
                  {...field}
                ></PasswordInput>
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
