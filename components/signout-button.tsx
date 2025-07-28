import { signOut } from "@/auth"
import { Button } from "./ui/button"
 
export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <Button variant="link" type="submit" className="hover:cursor-pointer">Sign Out</Button>
    </form>
  )
}