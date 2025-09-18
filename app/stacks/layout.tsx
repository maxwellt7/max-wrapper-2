import { StackSidebar } from "@/components/stacks/StackSidebar";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent,
  SidebarInset,
  SidebarTrigger 
} from "@/components/ui/sidebar";

interface StacksLayoutProps {
  children: React.ReactNode;
}

export default function StacksLayout({ children }: StacksLayoutProps) {
  return (
    <div className="min-h-screen theme-stacks" style={{backgroundColor: 'rgb(var(--bg))'}}>
      {/* Light theme background with subtle pattern */}
      <div className="fixed inset-0 bg-vector pointer-events-none -z-10" />
      
      <SidebarProvider>
        <div className="flex h-screen relative">
          <Sidebar collapsible="offcanvas" className="glass-subtle border-r" style={{borderColor: 'rgb(var(--border) / 0.5)'}}>
            <SidebarContent>
              <StackSidebar />
            </SidebarContent>
          </Sidebar>
          
          <SidebarInset className="flex-1 flex flex-col overflow-hidden">
            {/* Toggle button */}
            <div className="flex items-center gap-3 px-6 py-4 border-b glass-subtle" style={{borderColor: 'rgb(var(--border) / 0.3)'}}>
              <SidebarTrigger className="p-2 rounded-lg glass-subtle hover:glass transition-all duration-200 border" style={{color: 'rgb(var(--muted))', borderColor: 'rgb(var(--border) / 0.4)'}} />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgb(var(--primary) / 0.15)', color: 'rgb(var(--primary))'}}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold" style={{color: 'rgb(var(--primary))'}}>
                  Stacks
                </span>
              </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1 overflow-auto modern-scrollbar">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}