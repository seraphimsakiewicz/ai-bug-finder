# AI Bug Finder (Frontend)

A modern web application for finding and analyzing bugs in codebases using AI-powered analysis. Built with Next.js 15 and React 19.

**Note**: This frontend application requires the [ai-bug-finder-backend](https://github.com/seraphimsakiewicz/ai-bug-finder-backend) repository to be running for full functionality.

## Project is deployed [here](https://ai-bug-finder-beta.vercel.app/)

## Prerequisites

- **Node.js**: >= 22.6.0 (required for backend's `--experimental-strip-types` support)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/seraphimsakiewicz/ai-bug-finder
cd ai-bug-finder
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables (optional):
```bash
cp .env.example .env.local
```

Edit `.env.local` to point to your backend URL:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

4. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

```bash
pnpm build
```

## Production

```bash
pnpm start
```
