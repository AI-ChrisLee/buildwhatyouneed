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
                Build What You Need: From Zero to Clone in 3 Hours
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Watch me build a $419/mo SaaS tool live using AI
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="aspect-video bg-black rounded-lg shadow-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                    <Play className="h-10 w-10 text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 flex flex-col items-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 h-14 flex items-center gap-2">
                  Get My AI Prompts + Template
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Join the founding 1000 • 153 spots left at $97/month
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Projection Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="mx-auto max-w-[940px] px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Your Next 30 Days</h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 md:left-8 top-5 md:top-8 bottom-5 md:bottom-8 w-0.5 bg-gray-300"></div>
              
              {/* Week 1 */}
              <div className="relative flex items-start mb-8">
                <div className="flex-shrink-0 w-10 h-10 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm md:text-lg z-10">
                  W1
                </div>
                <div className="ml-6 md:ml-8 bg-white rounded-lg p-4 md:p-6 shadow-sm flex-1">
                  <h3 className="font-semibold text-base md:text-lg mb-2">Cancel your first $200/mo subscription</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">Start your journey by replacing your most expensive tool</p>
                </div>
              </div>
              
              {/* Week 2 */}
              <div className="relative flex items-start mb-8">
                <div className="flex-shrink-0 w-10 h-10 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm md:text-lg z-10">
                  W2
                </div>
                <div className="ml-6 md:ml-8 bg-white rounded-lg p-4 md:p-6 shadow-sm flex-1">
                  <h3 className="font-semibold text-base md:text-lg mb-2">Build your second tool (save another $400/mo)</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">Double down on what works, compound your savings</p>
                </div>
              </div>
              
              {/* Week 3 */}
              <div className="relative flex items-start mb-8">
                <div className="flex-shrink-0 w-10 h-10 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm md:text-lg z-10">
                  W3
                </div>
                <div className="ml-6 md:ml-8 bg-white rounded-lg p-4 md:p-6 shadow-sm flex-1">
                  <h3 className="font-semibold text-base md:text-lg mb-2">Help another founder escape SaaS prison</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">Share your wins, build together, grow the movement</p>
                </div>
              </div>
              
              {/* Week 4 */}
              <div className="relative flex items-start">
                <div className="flex-shrink-0 w-10 h-10 md:w-16 md:h-16 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg z-10">
                  W4
                </div>
                <div className="ml-6 md:ml-8 bg-gradient-to-r from-green-50 to-white rounded-lg p-4 md:p-6 shadow-sm flex-1 border-2 border-green-200">
                  <h3 className="font-semibold text-base md:text-lg mb-2">Be $800/mo richer and own everything</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">Full control, zero dependencies, infinite possibilities</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center mt-12 text-lg font-medium">
            This is your future. Join 1000 builders making it happen.
          </p>
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
          
          <div className="pt-12 flex justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 h-14 flex items-center gap-2">
                Stop the Bleeding Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
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

{/* Scarcity & Pricing Section */}
      <section className="w-full py-12 md:py-24">
        <div className="mx-auto max-w-[940px] px-4">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              <span className="text-3xl">🔥</span>
              <span>Founding Member Offer</span>
            </div>
            
            <div className="space-y-4">
              <div className="text-4xl font-bold">
                $97/month forever
              </div>
              <p className="text-lg text-muted-foreground">
                (153 spots remaining)
              </p>
              <p className="text-sm">
                → Price increases to $197 after founding 1000
              </p>
            </div>
            
            <div className="pt-4 flex justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 h-14 flex items-center gap-2">
                  Secure Your Founding Spot
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-8 border-t max-w-md mx-auto">
              <div>
                <div className="text-2xl font-bold">$2,400+</div>
                <div className="text-sm text-muted-foreground">Your savings by Month 3</div>
              </div>
              <div>
                <div className="text-2xl font-bold">$291</div>
                <div className="text-sm text-muted-foreground">Your investment</div>
              </div>
              <div>
                <div className="text-2xl font-bold">824%</div>
                <div className="text-sm text-muted-foreground">ROI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Risk Reversal Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="mx-auto max-w-[940px] px-4">
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold">The 7-Day Builder Guarantee</h2>
            
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Build your first tool in 7 days or full refund</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>We start together on Day 1</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Daily office hours your first week</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Can't build = our failure = your refund</span>
              </div>
            </div>
            
            <p className="text-lg font-medium">Zero risk. Just build.</p>
          </div>
        </div>
      </section>

      {/* Future Social Proof Section */}
      <section className="w-full py-12 md:py-24">
        <div className="mx-auto max-w-[940px] px-4">
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold">The Founding 1000 Movement</h2>
            
            <p className="text-lg">When 1000 builders unite:</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="space-y-2">
                <div className="text-3xl">💰</div>
                <div className="text-2xl font-bold">$10M+</div>
                <div className="text-sm text-muted-foreground">in collective SaaS savings/year</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">🚀</div>
                <div className="text-2xl font-bold">5,000+</div>
                <div className="text-sm text-muted-foreground">tools built and owned</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">⚡</div>
                <div className="text-2xl font-bold">3 hours</div>
                <div className="text-sm text-muted-foreground">average build time</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">🔥</div>
                <div className="text-2xl font-bold">Every</div>
                <div className="text-sm text-muted-foreground">major SaaS disrupted</div>
              </div>
            </div>
            
            <p className="text-lg font-medium">Your name in the founding story.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-12 md:py-24 bg-black text-white">
        <div className="mx-auto max-w-[940px] px-4">
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold">
              Your Choice: Keep Bleeding or Start Building
            </h2>
            
            <p className="text-lg">Join 847 builders who chose freedom</p>
            
            <div className="pt-4 flex justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8 h-14 flex items-center gap-2">
                  Join the Founding 1000
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <p className="text-sm opacity-80">
              $97/month while spots last • 7-day guarantee
            </p>
            
            <p className="text-lg font-medium">
              In 30 days: Own your stack or get every penny back.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}