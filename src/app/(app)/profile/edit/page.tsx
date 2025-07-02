import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function EditProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <Link href="/profile/john">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Display Name</label>
            <Input defaultValue="John Builder" className="mt-1" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Username</label>
            <Input defaultValue="john" disabled className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
          </div>

          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea 
              defaultValue="Killing SaaS one tool at a time. Previously wasted $10k/month on 37 different tools."
              className="mt-1 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">Brief description about yourself</p>
          </div>

          <div>
            <label className="text-sm font-medium">Total Saved (Monthly)</label>
            <Input defaultValue="45000" type="number" className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">How much you save per month by killing SaaS</p>
          </div>

          <Button className="w-full">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}