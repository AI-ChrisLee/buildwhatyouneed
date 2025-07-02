import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { mockStats } from "@/lib/mock-data"
import { ArrowRight, CheckCircle2, Play, DollarSign, Users, Zap } from "lucide-react"

export default function SalesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24">
        <div className="mx-auto max-w-[940px] px-4">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                The $50B SaaS Scam Ends Today
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                They charge $419/month for a forum. I built this in 4 hours. 
                Join {mockStats.totalMembers} builders who stopped bleeding money to overpriced software.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              Watch this - Only 10 minutes to save $10k/month!
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="aspect-video bg-black rounded-lg shadow-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto cursor-pointer hover:bg-white/20 transition-all hover:scale-105">
                      <Play className="h-12 w-12 text-white ml-1" fill="white" />
                    </div>
                    <p className="text-white text-lg font-medium">
                      How I Replaced $10,847/mo of SaaS in 4 Hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold">
                JD
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">John Doe</p>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground">@johndoe</span>
                  <div className="flex gap-1">
                    <svg className="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <svg className="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full border-t border-b bg-muted/50">
        <div className="mx-auto max-w-[940px] px-4 py-12">
          <div className="text-center space-y-8">
            <h2 className="text-2xl font-bold">
              Copy & Paste My Exact Templates
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Get instant access to the code that replaced $10,847/month of SaaS. 
              No fluff. No theory. Just working code you can deploy today.
            </p>
            <div className="pt-2">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8">
                  Get The Templates Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Setup in 60 seconds
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* Problem Section */}
      <section className="w-full py-12 md:py-24">
        <div className="mx-auto max-w-[940px] px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter">
              You're Drowning in SaaS Complexity
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every month, you bleed money to tools that promised simplicity but delivered chaos
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Financial Bleeding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You're paying for 37 different subscriptions, each promising to be "essential" for your business.
                </p>
                <div className="pt-2">
                  <p className="text-2xl font-bold">$10,847/mo</p>
                  <p className="text-sm text-muted-foreground">Average SaaS spend</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Feature Overwhelm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  100+ features per tool, but you use 3. The rest? Bloat that slows you down and confuses your team.
                </p>
                <div className="pt-2">
                  <p className="text-2xl font-bold">3%</p>
                  <p className="text-sm text-muted-foreground">Features actually used</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Integration Hell</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your data is scattered across 37 platforms. Nothing talks to each other. You're the human API.
                </p>
                <div className="pt-2">
                  <p className="text-2xl font-bold">15hrs/week</p>
                  <p className="text-sm text-muted-foreground">Wasted on tool juggling</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="w-full border-t bg-muted/30">
        <div className="mx-auto max-w-[940px] px-4 py-12 md:py-24">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">
                How This Works
              </h2>
              <p className="text-xl text-muted-foreground">
                Simple 3-step process. No complexity.
              </p>
            </div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="grid gap-6 md:grid-cols-2 items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <h3 className="text-2xl font-bold">Join Today</h3>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Sign up in 60 seconds. Get instant access to everything. No onboarding flow. No setup wizard. Just immediate value.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Instant community access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>All video content unlocked</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Code templates ready to copy</span>
                    </li>
                  </ul>
                </div>
                <div className="order-first md:order-last">
                  <Card className="shadow-lg">
                    <img
                      src="/api/placeholder/600/400"
                      alt="Join process"
                      className="rounded-lg"
                    />
                  </Card>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid gap-6 md:grid-cols-2 items-center">
                <div className="order-last md:order-first">
                  <Card className="shadow-lg">
                    <img
                      src="/api/placeholder/600/400"
                      alt="Weekly delivery"
                      className="rounded-lg"
                    />
                  </Card>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <h3 className="text-2xl font-bold">We Deliver Code</h3>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Every week we ship new templates, patterns, and solutions. Copy our exact code. Ask questions in office hours. Ship faster than ever.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>New templates every Tuesday</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Live coding sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Direct help in office hours</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid gap-6 md:grid-cols-2 items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <h3 className="text-2xl font-bold">You Save $10k/mo</h3>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Replace your entire SaaS stack with code you control. Build exactly what you need. Never pay inflated prices again.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Cancel $10,847/mo in subscriptions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Own your code forever</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Build anything you want</span>
                    </li>
                  </ul>
                </div>
                <div className="order-first md:order-last">
                  <Card className="shadow-lg">
                    <img
                      src="/api/placeholder/600/400"
                      alt="Savings dashboard"
                      className="rounded-lg"
                    />
                  </Card>
                </div>
              </div>
            </div>
          </div>
      </section>

{/* Final CTA */}
      <section className="w-full border-t py-12 md:py-24">
        <div className="mx-auto max-w-[940px] px-4">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter">
              Ready to Stop Bleeding Money?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join {mockStats.totalMembers} builders who took control of their software stack
            </p>
            <div className="pt-4">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8">
                  Start Building. Stop Bleeding.
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              {1000 - mockStats.totalMembers} spots left at founding price
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}