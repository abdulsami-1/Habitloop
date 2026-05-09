import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let session
  try {
    session = await getSession()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (!msg.includes("Dynamic server usage")) {
      console.error("[layout] getSession failed:", err instanceof Error ? err.stack : err)
    }
    redirect("/login")
  }
  if (!session?.userId) redirect("/login")

  return (
    <div className="flex h-full">
      <aside className="hidden w-52 shrink-0 border-r border-border md:block">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
