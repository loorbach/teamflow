'use client'

import signInAction from '@/app/actions/signIn'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import { useActionState } from 'react'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'

export function SignInForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [state, formAction, isPending] = useActionState(signInAction, null)

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <h1 className="text-foreground font-semibold text-center">Welcome to Teamflow</h1>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                    Forgot your password?
                    </a> */}
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              {state && !state.ok && (
                <div className="text-destructive text-sm flex gap-1 items-center">
                  <AlertCircle size={16}></AlertCircle>
                  {state.message}
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Spinner />}
                  {isPending ? 'Logging in...' : 'Log in'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
