"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/providers/auth-provider"
import { Loader2, Camera, CreditCard, AlertCircle } from "lucide-react"
import { AvatarGradient } from "@/components/ui/avatar-gradient"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const router = useRouter()
  const { user, refreshAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    bio: "",
    profile_image_url: ""
  })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [subscription, setSubscription] = useState<any>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadUserData()
      loadSubscription()
    }
  }, [user])

  async function loadUserData() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("full_name, email, bio, profile_image_url")
        .eq("id", user?.id)
        .single()

      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          email: data.email || user?.email || "",
          bio: data.bio || "",
          profile_image_url: data.profile_image_url || ""
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  async function loadSubscription() {
    try {
      const { data } = await supabase
        .from("stripe_subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .single()

      setSubscription(data)
    } catch (error) {
      console.error("Error loading subscription:", error)
    } finally {
      setLoadingSubscription(false)
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase
        .from("users")
        .update({
          bio: profileData.bio,
          profile_image_url: profileData.profile_image_url
        })
        .eq("id", user?.id)

      if (error) throw error

      setSuccess("Profile updated successfully")
      await refreshAuth()
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      setPasswordLoading(false)
      return
    }

    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword
      })

      if (signInError) {
        throw new Error("Current password is incorrect")
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setError(error.message || "Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Calculate new dimensions (max 800x800 for better quality)
          let width = img.width
          let height = img.height
          const maxSize = 800
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            'image/jpeg',
            0.9 // 90% quality
          )
        }
      }
      reader.onerror = reject
    })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError("")

    try {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB. Image will be compressed automatically.")
      }

      // Compress image
      const compressedBlob = await compressImage(file)
      
      // Check compressed size
      if (compressedBlob.size > 2 * 1024 * 1024) {
        throw new Error("Image is still too large after compression. Please use a smaller image.")
      }

      // First delete old image if exists
      if (profileData.profile_image_url) {
        const oldPath = profileData.profile_image_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from("profile-images")
            .remove([oldPath])
        }
      }

      // Upload to Supabase Storage
      const fileName = `${user?.id}-${Date.now()}.jpg`

      const { error: uploadError, data } = await supabase.storage
        .from("profile-images")
        .upload(fileName, compressedBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg'
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName)

      setProfileData({ ...profileData, profile_image_url: publicUrl })
      setSuccess("Profile image uploaded successfully")
    } catch (error: any) {
      setError(error.message || "Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleCancelSubscription() {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to paid features at the end of your billing period.")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.stripe_subscription_id })
      })

      if (!response.ok) throw new Error("Failed to cancel subscription")

      setSuccess("Subscription cancelled. You'll retain access until the end of your billing period.")
      await loadSubscription()
    } catch (error: any) {
      setError(error.message || "Failed to cancel subscription")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {error && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    {profileData.profile_image_url ? (
                      <img
                        src={profileData.profile_image_url}
                        alt="Profile"
                        className="w-24 h-24 sm:w-20 sm:h-20 rounded-full object-cover"
                      />
                    ) : (
                      <AvatarGradient seed={user.email || ""} className="w-24 h-24 sm:w-20 sm:h-20" />
                    )}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-1.5 bg-background rounded-full border cursor-pointer hover:bg-muted"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-medium text-lg sm:text-base">{profileData.full_name}</p>
                    <p className="text-sm text-muted-foreground">{profileData.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 2MB • JPG, PNG, GIF, WebP</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself in one line"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={2}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {profileData.bio.length}/160 characters
                  </p>
                </div>

                <Button type="submit" disabled={profileLoading || uploadingImage}>
                  {profileLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
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
                    minLength={6}
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
                    minLength={6}
                  />
                </div>

                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage your Control OS subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingSubscription ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : subscription ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="text-2xl font-bold">Control OS Premium</p>
                    <p className="text-muted-foreground">$97/month</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{subscription.status}</p>
                  </div>

                  {subscription.current_period_end && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Next Billing Date</p>
                      <p className="font-medium">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 space-y-4">
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Subscription"
                      )}
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      <p>Need a refund? Email us at{" "}
                        <a href="mailto:me@aichrislee.com" className="text-primary underline">
                          me@aichrislee.com
                        </a>
                      </p>
                      <p className="mt-2">
                        Refund Policy: We offer refunds within 14 days of purchase if you haven't accessed premium content.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No active subscription</p>
                  <Button onClick={() => router.push("/")}>
                    Join Control OS
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}