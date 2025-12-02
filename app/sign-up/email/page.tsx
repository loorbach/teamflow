import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/auth'

function SignUp() {
  return (
    <form
      className="max-w-sm p-4"
      action={async (formData) => {
        'use server'

        const name = formData.get('name') as string
        const password = formData.get('password') as string
        const email = formData.get('email') as string
        console.log(name)

        if (!name || !password || !email) return

        try {
          console.log('trying to create account')
          await auth.api.signUpEmail({
            body: {
              name,
              email,
              password,
            },
          })
          console.log('success ?')
        } catch (error) {
          console.error(error)
        }
      }}
    >
      <Label htmlFor="name">Name</Label>
      <Input id="name" type="text" name="name"></Input>
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="text" name="password"></Input>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" name="email"></Input>
      <Button type="submit">Sign Up</Button>
    </form>
  )
}

export default SignUp
