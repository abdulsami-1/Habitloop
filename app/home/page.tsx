import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { Navbar } from "@/components/marketing/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { WhyHabitLoop } from "@/components/marketing/WhyHabitLoop"
import { CtaSection } from "@/components/marketing/CtaSection"
import { Footer } from "@/components/marketing/Footer"

export default async function HomePage() {
  try {
    const session = await getSession()
    if (session?.userId) redirect("/today")
  } catch {
    // cookies unavailable during static rendering — render landing page
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <WhyHabitLoop />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
