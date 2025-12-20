import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { TradesPage } from "@/components/trades/TradesPage";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function Page() {
  return (
    <AuthGuard requireAuth={true}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="overflow-hidden">
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="px-4 lg:px-6 space-y-8 py-4 md:py-6">
              <TradesPage />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
