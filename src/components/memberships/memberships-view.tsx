import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MembershipsTable } from './memberships-table'

export const MembershipsView = () => {
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            type="text"
            placeholder="Cerca Memberships"
            className="bg-white"
          />
        </div>
        <Button className="w-full sm:w-auto bg-[#1E2A4A] text-white hover:bg-[#2A3B66]">
          AGGIUNGI MEMBERSHIP
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">4 risultati</p>
        </div>
        <div className="p-4 overflow-x-auto">
          <MembershipsTable memberships={[]} />
        </div>
      </div>
    </div>
  )
}
