# App Structure Migration Guide

## Overview

This document describes the migration of the app structure to a more organized, self-contained approach where each app contains its own API routes and components.

## Migration Summary

### Before (Old Structure)
```
app/
├── (apps)/
│   ├── chat/
│   ├── audio/
│   └── ...
├── api/
│   └── (apps)/
│       ├── (chat)/
│       │   ├── chat/
│       │   ├── document/
│       │   └── ...
│       ├── audio/
│       └── ...
components/
└── (apps)/
    ├── chat/
    ├── audio/
    └── ...
```

### After (New Structure)
```
app/
└── (apps)/
    ├── chat/
    │   ├── api/          # API routes moved here
    │   ├── components/   # Components moved here
    │   └── [app files]
    ├── audio/
    │   ├── api/
    │   ├── components/
    │   └── [app files]
    └── ...
```

## What Changed

### 1. File Structure Changes

Each app now contains its own:
- **API routes**: Moved from `app/api/(apps)/[app]/*` to `app/(apps)/[app]/api/*`
- **Components**: Moved from `components/(apps)/[app]/*` to `app/(apps)/[app]/components/*`

### 2. API Route Path Changes

All API endpoints have been updated:

| Old Path | New Path |
|----------|----------|
| `/api/chat` | `/chat/api/chat` |
| `/api/pdf/upload` | `/pdf/api/upload` |
| `/api/audio/transcribe` | `/audio/api/transcribe` |
| `/api/voice/text-to-speech` | `/voice/api/text-to-speech` |
| `/api/vision/upload` | `/vision/api/upload` |
| `/api/image-ai` | `/image-ai/api` |

### 3. Import Path Changes

Component imports have been updated to use relative paths:

```typescript
// Before
import { Chat } from "@/components/(apps)/chat/chat";

// After (from within the same app)
import { Chat } from "./components/chat";

// After (from a subdirectory)
import { Chat } from "../components/chat";
```

## Affected Apps

The following apps were migrated:
- `chat` - Chat application with AI tools
- `audio` - Audio recording and transcription
- `claude` - Claude AI interface
- `dalle` - DALL-E image generation
- `gpt` - GPT interface
- `grok` - Grok AI interface
- `image-ai` - Image AI playground
- `groq` - Groq AI interface (formerly llama)
- `pdf` - PDF chat and analysis
- `studio` - GPT Image Studio
- `vision` - Vision/image analysis
- `voice` - Text-to-speech

## Benefits

1. **Better Organization**: Each app is self-contained with its own API routes and components
2. **Easier Navigation**: All app-related code is in one place
3. **Clearer Dependencies**: Components and APIs are colocated with their app
4. **Simplified Imports**: Relative imports within apps are shorter and clearer

## Additional Changes

### Groq App (formerly Llama)
- The `llama` app has been renamed to `groq`
- All references updated from `/apps/llama` to `/apps/groq`
- The groq API route is now at `/groq/api/groq`

### SDXL Removal
- The sdxl API type has been removed from the codebase
- All sdxl references in `generateAIResponse` and input components have been cleaned up

## Notes

- Shared components remain in `components/(apps)/dashboard/` as they're used across multiple apps
- The migration preserves all existing functionality
- All TypeScript compilation checks pass
- All API routes maintain their functionality with updated paths