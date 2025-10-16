// 'use client'

import signInAction from '@/app/actions/signIn'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useRouter } from 'next/navigation'
// import { useForm } from 'react-hook-form'
// import { toast } from 'sonner'
import z from 'zod'
import LoginButton from './login-button'

const signInSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(6),
})

type SignInForm = z.infer<typeof signInSchema>

export function SignInForm({ className, ...props }: React.ComponentProps<'div'>) {
  // const form = useForm<SignInForm>({
  //   resolver: zodResolver(signInSchema),
  //   defaultValues: {
  //     email: '',
  //     password: '',
  //   },
  // })
  // const router = useRouter()

  // async function handleSignIn(data: SignInForm) {
  //   await authClient.signIn.email(
  //     { ...data, callbackURL: '/' },
  //     {
  //       onError: (error) => {
  //         toast.error(error.error.message || 'Failed to sign in')
  //       },
  //       onSuccess: () => {
  //         router.push('/')
  //       },
  //     }
  //   )
  // }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <h1 className="text-foreground font-semibold text-center">Welcome to Teamflow</h1>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <form onSubmit={form.handleSubmit(handleSignIn)}> */}
          <form action={signInAction}>
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
              <div className="flex flex-col gap-3">
                <LoginButton />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
