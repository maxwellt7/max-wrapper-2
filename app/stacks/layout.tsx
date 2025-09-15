import { StackSidebar } from "@/components/stacks/StackSidebar";

interface StacksLayoutProps {
  children: React.ReactNode;
}

export default function StacksLayout({ children }: StacksLayoutProps) {
  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar */}
      <div className="w-80 bg-base-200 border-r border-base-300 flex-shrink-0">
        <StackSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}