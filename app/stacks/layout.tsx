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
    <SidebarProvider>
      <div className="flex h-screen bg-base-100">
        <Sidebar collapsible="offcanvas" className="bg-base-200 border-r border-base-300">
          <SidebarContent>
            <StackSidebar />
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Toggle button */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-base-300">
            <SidebarTrigger className="btn btn-ghost btn-sm" />
            <span className="text-lg font-semibold">Stacks</span>
          </div>
          
          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}