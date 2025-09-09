/**
 * Helper functions to extract search results from different AI provider formats
 */

export interface UnifiedSearchResult {
  sources: Array<{ title: string; url: string; snippet?: string }>;
  summary?: string;
  queries?: string[];
}

/**
 * Extract search results from tool output based on the provider
 */
export function extractSearchResults(
  toolName: string,
  output: any
): UnifiedSearchResult | null {
  if (!output) return null;


  // Google search format
  if (toolName === "google_search") {
    console.log('[extractSearchResults] Google search output:', JSON.stringify(output, null, 2));
    const sources: Array<{ title: string; url: string; snippet?: string }> = [];
    
    // Check if output is a string (raw response from Google)
    if (typeof output === 'string') {
      // Google often returns a formatted text response with sources embedded
      // Try to extract URLs from the text
      const urlRegex = /https?:\/\/[^\s)]+/g;
      const matches = output.match(urlRegex);
      if (matches) {
        matches.forEach((url, index) => {
          sources.push({
            title: `Source ${index + 1}`,
            url: url,
            snippet: undefined
          });
        });
      }
      
      // Also check for citations in Google format [1], [2], etc.
      const citationRegex = /\[(\d+)\]/g;
      const citations = output.match(citationRegex);
      if (citations && citations.length > 0) {
        console.log('[extractSearchResults] Found Google citations:', citations);
      }
      
      return {
        sources,
        summary: output,
      };
    }
    
    // Handle structured output from Google
    if (output && typeof output === 'object') {
      // Check various possible formats
      if (output.results && Array.isArray(output.results)) {
        output.results.forEach((result: any) => {
          if (result.url || result.link) {
            sources.push({
              title: result.title || result.name || "Untitled",
              url: result.url || result.link,
              snippet: result.snippet || result.description || result.content,
            });
          }
        });
      } else if (output.searchResults && Array.isArray(output.searchResults)) {
        output.searchResults.forEach((result: any) => {
          if (result.url || result.link) {
            sources.push({
              title: result.title || "Untitled",
              url: result.url || result.link,
              snippet: result.snippet || result.description,
            });
          }
        });
      } else if (output.groundingChunks && Array.isArray(output.groundingChunks)) {
        // Google Grounding format
        output.groundingChunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri) {
            sources.push({
              title: chunk.web.title || "Untitled",
              url: chunk.web.uri,
              snippet: chunk.web.snippet || chunk.web.description,
            });
          }
        });
      } else if (output.webSearchQueries && Array.isArray(output.webSearchQueries)) {
        // Just queries, no sources yet
        console.log('[extractSearchResults] Google returned only queries:', output.webSearchQueries);
      }
      
      // Check if the entire output might be a search result
      if (!sources.length && output.url) {
        sources.push({
          title: output.title || "Search Result",
          url: output.url,
          snippet: output.snippet || output.description,
        });
      }
    }
    
    return {
      sources,
      summary: output.summary || output.answer || output.text,
      queries: output.queries || output.searchQueries || output.webSearchQueries,
    };
  }

  // OpenAI web_search_preview format
  if (toolName === "web_search_preview") {
    console.log('[extractSearchResults] OpenAI web_search_preview output:', output);
    const sources: Array<{ title: string; url: string; snippet?: string }> = [];
    
    // Check if output is a string (raw response)
    if (typeof output === 'string') {
      // Try to extract URLs from the text
      const urlRegex = /https?:\/\/[^\s)]+/g;
      const matches = output.match(urlRegex);
      if (matches) {
        matches.forEach((url, index) => {
          sources.push({
            title: `Source ${index + 1}`,
            url: url,
            snippet: undefined
          });
        });
      }
      return {
        sources,
        summary: output,
      };
    }
    
    // OpenAI returns sources in a specific format
    if (output.sources && Array.isArray(output.sources)) {
      output.sources.forEach((source: any) => {
        sources.push({
          title: source.title || source.name || "Untitled",
          url: source.url || source.link,
          snippet: source.snippet || source.description,
        });
      });
    } else if (output.results && Array.isArray(output.results)) {
      // Alternative format
      output.results.forEach((result: any) => {
        sources.push({
          title: result.title || "Untitled",
          url: result.url,
          snippet: result.snippet,
        });
      });
    } else if (output.web_results && Array.isArray(output.web_results)) {
      // Another possible format
      output.web_results.forEach((result: any) => {
        sources.push({
          title: result.title || "Untitled",
          url: result.url || result.link,
          snippet: result.snippet || result.description,
        });
      });
    }
    
    return {
      sources,
      summary: output.summary || output.answer || output.response,
    };
  }

  // Anthropic web_search format
  if (toolName === "web_search") {
    const sources: Array<{ title: string; url: string; snippet?: string }> = [];
    
    // Anthropic returns search results in a specific format
    if (output.search_results && Array.isArray(output.search_results)) {
      output.search_results.forEach((result: any) => {
        sources.push({
          title: result.title || "Untitled",
          url: result.url,
          snippet: result.snippet || result.extract,
        });
      });
    } else if (output.results && Array.isArray(output.results)) {
      // Alternative format
      output.results.forEach((result: any) => {
        sources.push({
          title: result.title || "Untitled",
          url: result.url,
          snippet: result.snippet,
        });
      });
    }
    
    return {
      sources,
      summary: output.summary,
      queries: output.queries || [output.query].filter(Boolean),
    };
  }

  // Default fallback - try to extract sources from common formats
  if (output.sources && Array.isArray(output.sources)) {
    return {
      sources: output.sources.map((source: any) => ({
        title: source.title || source.name || "Untitled",
        url: source.url || source.link || "",
        snippet: source.snippet || source.description || source.extract
      })),
      summary: output.summary,
    };
  }
  
  // If we can't extract sources, return null
  return null;
}