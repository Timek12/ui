# LunaGuard UI

A modern authentication system built with Next.js, React 19, and ShadCN UI components.

## Features

- 🔐 Modern login and signup forms with ShadCN UI
- 🌙 Dark mode support with Tailwind CSS
- 📱 Responsive design for all devices
- ⚡ Built with Next.js 15 and React 19
- 🎨 Beautiful UI components with Tailwind CSS v4

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js app router pages
  - `/login` - Login page
  - `/signup` - Sign up page
- `/components` - Reusable UI components
  - `/ui` - ShadCN UI components
  - `login.tsx` - Login form component
  - `sign-up.tsx` - Sign up form component
  - `logo.tsx` - Logo component
- `/lib` - Utility functions and configurations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN UI
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Development

The project uses ShadCN UI components for consistent and accessible UI elements. All forms include proper validation and responsive design.

### Prerequisites

Before running the frontend, ensure your Go backend is properly configured:

1. **Backend Setup**: Your Go backend should be running on `http://localhost:8080`
2. **Environment Variables**: Make sure your backend has these environment variables set:

   ```env
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   SESSION_SECRET=your-very-long-random-session-secret-key-32-chars-minimum
   ```

## License

MIT
