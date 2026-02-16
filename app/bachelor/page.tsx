import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  DollarSign,
  Calendar,
  Sparkles,
  Calculator,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ultimate Bachelor Party in Las Vegas | Trip Planning Guide 2026',
  description: 'Plan the perfect Vegas bachelor party. Complete guide with budget estimates, recommended hotels, restaurants, clubs, and day-by-day itinerary.',
}

export default function BachelorPartyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="section-spacing bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Ultimate Vegas Bachelor Party
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto">
              Your best friend is getting married. Time to plan the send-off of a lifetime.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-sm text-white/80">Ideal Group</p>
                <p className="text-2xl font-bold text-white">8-12 guys</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-sm text-white/80">Duration</p>
                <p className="text-2xl font-bold text-white">3-4 days</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-sm text-white/80">Budget</p>
                <p className="text-2xl font-bold text-white">$1.5k-$5k</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-sm text-white/80">Best Time</p>
                <p className="text-2xl font-bold text-white">Fall/Spring</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Calculator CTA */}
      <section className="section-spacing">
        <div className="container max-w-4xl mx-auto px-6">
          <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="p-8 text-center">
              <Calculator className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Calculate Your Bachelor Party Budget
              </h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get a realistic cost estimate based on your group size, hotel preference, and nightlife plans.
              </p>
              <Link href="/calculator">
                <Button size="lg" className="text-lg px-8">
                  <Calculator className="mr-2 h-5 w-5" />
                  Get Your Estimate
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-spacing bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-6 text-white" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Plan Your Bachelor Party?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Use our trip calculator to get a personalized budget, then start building your itinerary.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 text-lg px-8">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Budget
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8">
                <ArrowRight className="mr-2 h-5 w-5" />
                Start Planning
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
