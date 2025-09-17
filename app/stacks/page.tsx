import { StackList } from "@/components/stacks/StackList";

export default function StacksPage() {
  return (
    <div className="min-h-full bg-vector theme-stacks modern-scrollbar overflow-auto">
      <div className="relative">
        {/* Background overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-slate-900/20 pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto px-8 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl glass glow-primary">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-3.182-2.21l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                Stacks
              </h1>
            </div>
            
            <p className="text-xl text-slate-300 mb-3 font-medium max-w-2xl mx-auto leading-relaxed">
              Structured reflection experiences to help you grow and gain insights
            </p>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Choose a stack below to begin your guided journey of self-discovery
            </p>
          </div>
          
          {/* Main Content */}
          <div className="relative">
            <StackList />
          </div>
        </div>
      </div>
    </div>
  );
}