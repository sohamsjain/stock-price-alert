import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { TelegramSettings } from "@/components/settings/TelegramSettings"

export default function SettingsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="overflow-hidden">
          <SiteHeader title="Settings" />
          <div className="flex flex-1 flex-col">
            <div className="px-4 lg:px-6 space-y-8 py-4 md:py-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>

              <div className="space-y-6">
                <TelegramSettings />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}