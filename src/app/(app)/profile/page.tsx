"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, DollarSign, MessageSquare, Edit2, Save, X } from "lucide-react"

export default function ProfilePage() {
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState("John Doe")
  const [tempName, setTempName] = useState(name)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSaveName = () => {
    setName(tempName)
    setIsEditingName(false)
  }

  const handleCancelEdit = () => {
    setTempName(name)
    setIsEditingName(false)
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, would validate and update password
    console.log("Password change submitted")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  // Mock user data
  const user = {
    email: "john.doe@example.com",
    totalSaved: "$12,450",
    threadsCount: 47,
    joinDate: "March 2024"
  }

  // Mock threads data
  const myThreads = [
    {
      id: 1,
      title: "Replaced Slack with IRC - Here's How",
      category: "Show & Tell",
      replies: 23,
      likes: 145,
      lastActivity: "2 hours ago"
    },
    {
      id: 2,
      title: "Why I Cancelled All My SaaS Subscriptions",
      category: "General",
      replies: 89,
      likes: 412,
      lastActivity: "1 day ago"
    },
    {
      id: 3,
      title: "Built My Own Analytics in 200 Lines",
      category: "Show & Tell",
      replies: 34,
      likes: 223,
      lastActivity: "3 days ago"
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user.email} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <>
                      <Input 
                        id="name" 
                        value={tempName} 
                        onChange={(e) => setTempName(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveName}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input 
                        id="name" 
                        value={name} 
                        disabled 
                        className="flex-1"
                      />
                      <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center text-2xl font-bold">
                    <DollarSign className="h-5 w-5" />
                    {user.totalSaved}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total Saved</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-2xl font-bold">
                    <MessageSquare className="h-5 w-5 mr-1" />
                    {user.threadsCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Threads</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-2xl font-bold">
                    <CalendarDays className="h-5 w-5 mr-1" />
                    {user.joinDate}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Joined</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Threads</h2>
            <div className="space-y-3">
              {myThreads.map((thread) => (
                <Card key={thread.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium">{thread.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="bg-secondary px-2 py-0.5 rounded text-xs">
                            {thread.category}
                          </span>
                          <span>{thread.replies} replies</span>
                          <span>{thread.likes} likes</span>
                          <span>{thread.lastActivity}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Thread
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground">Free Plan</p>
                  </div>
                  <Button variant="outline">Upgrade</Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Total Saved</h3>
                <p className="text-3xl font-bold">{user.totalSaved}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Amount saved by building instead of buying SaaS
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Payment Method</h3>
                <p className="text-sm text-muted-foreground">No payment method on file</p>
                <Button variant="outline" className="mt-2">
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}