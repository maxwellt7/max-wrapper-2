import { StackList } from "@/components/stacks/StackList";

export default function StacksPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Welcome to Stacks
          </h1>
          <p className="text-lg text-base-content/70 mb-2">
            Structured reflection experiences to help you grow and gain insights.
          </p>
          <p className="text-sm text-base-content/50">
            Choose a stack below to begin your guided journey.
          </p>
        </div>
        
        <StackList />
      </div>
    </div>
  );
}