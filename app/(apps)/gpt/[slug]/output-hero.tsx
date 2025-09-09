export default function OutputHero({
  title = "Your marketing strategy has been generated! ✨",
  subtitle = "Read below for more details. Good luck!",
  input,
  onGenerateNew,
  onShare,
  linkCopied,
}: {
  title?: string;
  subtitle?: string;
  input: any;
  onGenerateNew: () => void;
  onShare: () => void;
  linkCopied: boolean;
}) {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-6">
          {/* Top section - Title and Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0 max-w-xl">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">{subtitle}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onGenerateNew}
                className="px-4 py-2 bg-[#1D8BA6] hover:bg-[#177891] text-white 
                         rounded-md transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                Generate new →
              </button>
              <button
                onClick={onShare}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 
                         rounded-md transition-all duration-200 flex items-center justify-center gap-2
                         border border-gray-200 text-sm"
              >
                Share result ↗
              </button>
            </div>
          </div>

          {linkCopied && (
            <p className="text-sm text-green-600 text-center">
              Link copied to clipboard!
            </p>
          )}

          {/* Bottom section - Input Summary */}
          <div className="bg-gray-50 rounded-md p-4">
            <div className="flex items-center gap-x-8">
              <h3 className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                YOUR INPUT:
              </h3>
              <div className="flex flex-wrap gap-4">
                {Object.entries(input).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 capitalize whitespace-nowrap">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="text-sm text-gray-900">
                      {value as string}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
