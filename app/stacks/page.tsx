import { StackList } from "@/components/stacks/StackList";

export default function StacksPage() {
  return (
    <div className="min-h-full p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl glass glow-primary" style={{backgroundColor: 'rgb(var(--primary) / 0.15)', borderColor: 'rgb(var(--primary) / 0.3)'}}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: 'rgb(var(--primary))'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-3.182-2.21l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
              Stacks
            </h1>
          </div>
          
          <p className="text-xl mb-3 font-medium max-w-2xl mx-auto leading-relaxed" style={{color: 'rgb(var(--fg) / 0.9)'}}>
            Structured reflection experiences to help you grow and gain insights
          </p>
          <p className="text-sm max-w-lg mx-auto" style={{color: 'rgb(var(--muted))'}}>
            Choose a stack below to begin your guided journey of self-discovery
          </p>
        </div>
        
        {/* Main Content */}
        <div className="relative">
          <StackList />
        </div>
      </div>
    </div>
  );
}