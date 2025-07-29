import { signIn } from '@/auth'

export function SignIn() {
  return (
    <form
      action={async (formData) => {
        'use server'
        console.log('inside server form action')
        const formEntries = Object.fromEntries(formData.entries())
        console.log('form info', formData, formEntries, typeof formData, typeof formEntries)

        await signIn('credentials', {
          ...formEntries,
          redirectTo: '/',
        })
      }}
    >
      <label>
        Email
        <input name="email" type="email" />
      </label>
      <label>
        Password
        <input name="password" type="password" />
      </label>
      <button>Sign In</button>
    </form>
  )
}
