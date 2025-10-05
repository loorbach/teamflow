import { Button } from '@/components/ui/button'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { Slider } from './ui/slider'

const roles = [
  { label: 'Developer', value: 'role-dev' },
  { label: 'Manager', value: 'role-mgr' },
  { label: 'Junior Developer', value: 'role-jr' },
  { label: 'QA Engineer', value: 'role-qa' },
  { label: 'Support Engineer', value: 'role-sup' },
  { label: 'Designer', value: 'role-des' },
  { label: 'Senior Developer', value: 'role-sr' },
]

type SendEmployee = {
  firstName: string
  lastName: string
  fte: number
  roleId: string
  teamId: string
}

function AddEmployeeForm({
  onEmployeeAdded,
  onClose,
}: {
  onEmployeeAdded: (employee: SendEmployee) => void
  onClose: () => void
}) {
  const [fte, setFte] = useState<number>(1.0)
  const [roleId, setRoleId] = useState<string>('')
  const [teamId, setTeamId] = useState<string>('')

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const newEmployee: SendEmployee = {
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          fte: fte,
          roleId: roleId,
          teamId: teamId,
        }
        onEmployeeAdded(newEmployee)
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-3">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" type="text" required name="firstName" />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" type="text" required name="lastName" />
      </div>
      <Label htmlFor="fte">FTE</Label>
      <div className="flex justify-between gap-6 items-center">
        <Slider defaultValue={[fte]} max={1} step={0.1} onValueChange={(val) => setFte(val[0])} />
        <span className="text-sm text-muted-foreground">{fte.toFixed(1)}</span>
        <input type="number" name="fte" value={fte} hidden readOnly />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select value={roleId} onValueChange={setRoleId} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Roles</SelectLabel>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <input type="hidden" name="roleId" value={roleId ?? ''} />
        <Select value={teamId} onValueChange={setTeamId} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Teams</SelectLabel>
              <SelectItem value="team-a">Team A</SelectItem>
              <SelectItem value="team-b">Team B</SelectItem>
              <SelectItem value="team-c">Team C</SelectItem>
              <SelectItem value="team-d">Team D</SelectItem>
              <SelectItem value="team-e">Team E</SelectItem>
              <SelectItem value="team-f">Team F</SelectItem>
              <SelectItem value="team-g">Team G</SelectItem>
              <SelectItem value="team-h">Team H</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <input type="hidden" name="teamId" value={teamId ?? ''} />
      </div>

      <DialogFooter className="mt-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={!roleId || !teamId}>
          Save changes
        </Button>
      </DialogFooter>
    </form>
  )
}

export default AddEmployeeForm
