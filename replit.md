# AnotherWrapper - AI Demo Apps Platform

## Overview

AnotherWrapper is a comprehensive Next.js starter kit that provides 10+ AI demo applications for rapid AI product development. The platform serves as an all-in-one solution for building AI-powered applications with pre-built components, authentication, database integration, and multiple AI service providers. It's designed to help developers launch AI startups quickly by providing production-ready templates and boilerplate code.

The application features a modular architecture where each AI demo app is self-contained with its own API routes and components, allowing for easy customization and extension. The platform includes integrations with major AI providers (OpenAI, Anthropic, Replicate, Groq, etc.) and provides essential infrastructure components like authentication, file storage, and database management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router for modern React development
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom theming support and DaisyUI integration
- **Animation**: Framer Motion for smooth animations and transitions
- **State Management**: React hooks and context for local state, form handling with React Hook Form

### Backend Architecture
- **API Routes**: Next.js API routes co-located with each app in the new self-contained structure
- **Authentication**: Supabase Auth with magic link email login and session management
- **Middleware**: Custom middleware for session updates and route protection
- **File Handling**: Support for file uploads with Cloudflare R2 integration
- **Content Management**: Contentlayer for MDX blog content processing

### Database and Storage
- **Primary Database**: Supabase (PostgreSQL) for user data, application data, and vector embeddings
- **File Storage**: Cloudflare R2 for images, PDFs, and other file assets
- **Vector Storage**: Supabase for PDF embeddings and semantic search capabilities
- **Session Storage**: Supabase for user session management

### AI Integration Architecture
- **Multi-Provider Support**: Unified AI SDK supporting OpenAI, Anthropic, Google, Groq, Replicate, DeepSeek, and XAI
- **Streaming**: Real-time AI response streaming with React hooks
- **Specialized Services**: 
  - Text generation (GPT-4o, Claude, LLaMA)
  - Image generation (SDXL, DALL-E)
  - Audio transcription (Whisper)
  - Document processing with vector embeddings
  - Vision analysis (GPT-4o Vision)

### App Structure
- **Self-Contained Apps**: Each AI demo app contains its own API routes, components, and logic
- **Modular Design**: Apps can be easily added, removed, or modified independently
- **Shared Components**: Common UI components and utilities shared across apps
- **Route Rewrites**: Clean URLs with `/apps/:path*` rewriting to `/:path*`

## External Dependencies

### Core Services
- **Supabase**: Authentication, database, and vector storage
- **Vercel**: Hosting and deployment platform
- **Cloudflare R2**: Object storage for files and media

### AI Providers
- **OpenAI**: GPT models, DALL-E, Whisper, and vision capabilities
- **Anthropic**: Claude models for text generation
- **Replicate**: SDXL and other open-source models
- **Groq**: Fast inference for open-source models
- **Google AI**: Gemini models
- **DeepSeek**: Alternative text generation
- **XAI**: Additional AI capabilities

### Development Tools
- **TypeScript**: Type safety and developer experience
- **ESLint & Prettier**: Code quality and formatting
- **ContentLayer**: MDX processing for blog content
- **Geist Font**: Typography from Vercel

### Third-Party Integrations
- **Loops**: Email marketing and contact management
- **PostHog**: Analytics and user tracking
- **React Dropzone**: File upload handling
- **Langchain**: Advanced document processing and embeddings
- **Streamdown**: Markdown streaming for AI responses

### UI and Animation Libraries
- **Radix UI**: Headless component primitives
- **Tabler Icons**: Icon library for UI elements
- **Magic UI**: Custom animated components
- **Framer Motion**: Animation library for smooth interactions