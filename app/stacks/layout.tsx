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
    <div className="min-h-screen bg-vector theme-stacks">
      {/* Global background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-slate-900/20 pointer-events-none -z-10" />
      
      <SidebarProvider>
        <div className="flex h-screen relative">
          <Sidebar collapsible="offcanvas" className="glass border-r border-slate-700/50 backdrop-blur-xl">
            <SidebarContent>
              <StackSidebar />
            </SidebarContent>
          </Sidebar>
          
          <SidebarInset className="flex-1 flex flex-col overflow-hidden">
            {/* Toggle button */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/30 glass-subtle backdrop-blur-sm">
              <SidebarTrigger className="p-2 rounded-lg glass-subtle hover:glass transition-all duration-200 text-slate-400 hover:text-slate-200 border border-slate-600/30 hover:border-slate-500/50" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center glow-primary">
                  <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
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