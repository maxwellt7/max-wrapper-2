export function FaqSection() {
  return (
    <section className="mt-12 md:mt-16 pb-12 md:pb-16">
      <h2 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8">
        Understanding Next.js Templates & AI Apps
      </h2>

      <div className="space-y-8 md:space-y-12">
        <div>
          <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
            What is boilerplate code, and why do I need it?
          </h3>
          <div className="space-y-3 md:space-y-4 text-sm text-gray-600">
            <p>
              Think of boilerplate code like the foundation of a house. It's the
              basic code you need to start any project - things like user login,
              payments, and database connections. While most boilerplates only
              give you these basics, AnotherWrapper goes way beyond that.
            </p>
            <p>
              We include 10 production-ready AI demo apps that cover every major
              AI functionality you might need:
            </p>
            <ul className="list-disc pl-4 md:pl-5 space-y-1.5 md:space-y-2 mt-2">
              <li>Advanced chat with GPT-4, Claude, and LLaMA support</li>
              <li>PDF analysis and chat using vector search</li>
              <li>Speech-to-text with Whisper in 26+ languages</li>
              <li>Text-to-speech with 1000+ voices using ElevenLabs</li>
              <li>Image generation with DALL·E and Stable Diffusion</li>
              <li>Image analysis with GPT-4 Vision</li>
              <li>Structured data generation with JSON validation</li>
            </ul>
            <p className="mt-3 md:mt-4">
              Each demo comes with all the building blocks you need, like
              authentication, file storage, error handling, and all the complex
              AI integrations already set up and working. It's like getting a
              complete AI development toolkit instead of just basic starter
              code.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
            What exactly is an AI wrapper?
          </h3>
          <div className="space-y-3 md:space-y-4 text-sm text-gray-600">
            <p>
              When people talk about "AI wrappers," they mean apps built on top
              of AI services like OpenAI, Anthropic, or image models like Stable
              Diffusion. It's become a running joke in tech circles because if
              you think about it... everything in life is basically a wrapper
              around something else!
            </p>
            <p>Let's have some fun with this:</p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Netflix is just a wrapper around movies</li>
              <li>Uber is a wrapper around cars</li>
              <li>Banks are wrappers around your money</li>
              <li>Restaurants are wrappers around food preparation</li>
              <li>Schools are wrappers around education</li>
              <li>Instagram is a wrapper around sharing photos</li>
              <li>Spotify is a wrapper around music</li>
              <li>Your phone is a wrapper around communication</li>
            </ul>
            <p>
              So when someone says "Oh, you're just building an AI wrapper" like
              it's a bad thing, remind them that every great product is a
              wrapper! Uber made it easier to get rides, Spotify made it easier
              to listen to music, and AI wrappers make it easier to use powerful
              AI technology.
            </p>
            <p className="font-bold">
              The core idea here is to make complex stuff simple and accessible
              for everyone.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
            How do I build an AI wrapper?
          </h3>
          <div className="space-y-3 md:space-y-4 text-sm text-gray-600">
            <p>Building an AI wrapper requires several key components:</p>
            <ul className="list-disc pl-4 md:pl-5 space-y-1.5 md:space-y-2">
              <li>User authentication and account management</li>
              <li>Secure API integrations with AI providers</li>
              <li>Rate limiting and error handling</li>
              <li>File storage and database setup</li>
              <li>Payment processing for usage-based billing</li>
              <li>Real-time streaming capabilities</li>
              <li>Responsive user interface</li>
            </ul>
            <p className="mt-3 md:mt-4">
              Setting this up from scratch typically takes 3-4 months of
              development time. AnotherWrapper provides all these components
              pre-built and integrated, saving you hundreds of hours of
              development and thousands in setup costs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
