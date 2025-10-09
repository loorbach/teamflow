'use client'

import { useFormStatus } from 'react-dom'
import { Button } from './ui/button'

function LoginButton() {
  const status = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={status.pending}>
      {status.pending ? 'Logging in...' : 'Log in'}
    </Button>
  )
}

export default LoginButton
