This is a template for an LLM performance tracker dashboard and LLM cost calculator. It is built with Next.js, [Tinybird](https://tinybird.co) and [Clerk](https://clerk.com)

Use this template to bootstrap a multi-tenant, user-facing LLM analytics dashboard and cost calculator.

Features:

- Track LLM costs, requests, tokens and duration by model, provider, organization, project, environment and user
- Multi-tenant user-facing dashboard
- AI cost calculator
- Vector search
- Ask AI integration

Fork it and make it your own! You can track your own metrics and dimensions.

Tech stack:

- [Next.js](https://nextjs.org/) - Application
- [Tinybird](https://tinybird.co) - Analytics
- [OpenAI](https://openai.com/) - AI features
- [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction) - AI features
- [Vercel](https://sdk.vercel.ai/docs/introduction) - Application deployment
- [Clerk](https://clerk.com/) - User management and auth
- [Tremor](https://tremor.so/) - Charts

## Live Demo

- https://llm-tracker.tinybird.live

## Quick Start

Get started by forking the [GitHub repository](https://github.com/tinybirdco/llm-performance-tracker) and then customizing it to your needs.

Start Tinybird locally:

```
curl https://tinybird.co | sh
cd tinybird
tb local start
tb login
tb dev
token ls  # copy the read_pipes token
```

Configure the Next.js application:

```
cd dashboard/ai-analytics
cp .env.example .env
Edit the .env file with your Tinybird API key and other configuration.
```

```
NEXT_PUBLIC_TINYBIRD_API_URL=http://localhost:7181
# read_pipes token
NEXT_PUBLIC_TINYBIRD_API_KEY=
```

Start the Next.js application:

```
cd dashboard/ai-analytics
npm install
npm run dev
```

Open the application in your browser:

```
http://localhost:3000
```

## Instrumentation

Instrument your LLM calls and send events to Tinybird. Some examples:

- [LiteLLM (python)](https://www.tinybird.co/docs/get-data-in/guides/ingest-litellm)
- [Vercel AI SDK (typescript)](https://www.tinybird.co/docs/get-data-in/guides/ingest-vercel-ai-sdk)

## Deployment

- Fork and connect this repository to Vercel.
- Set the environment variables in Vercel.
- Configure your `TINYBIRD_HOST` and `TINYBIRD_TOKEN` in the [CI/CD GitHub actions](https://github.com/tinybirdco/llm-performance-tracker/tree/main/.github/workflows) to deploy to Tinybird.

## Multi-tenancy

Create a Clerk project and set up these environment variables in your Next.js application:

```
# workspace ID for multi-tenant JWT tokens
TINYBIRD_WORKSPACE_ID=
# workspace admin token for multi-tenant JWT tokens
TINYBIRD_JWT_SECRET=

# Clerk publishable key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
# Clerk secret key
CLERK_SECRET_KEY=
# Clerk sign in URL
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

The [middleware](https://github.com/tinybirdco/llm-performance-tracker/blob/main/dashboard/ai-analytics/src/middleware.ts) will get the `org:name` permission from the Clerk user and use it to create a Tinybird JWT token with the `organization` dimension fixed to that value. Read more about Tinybird JWT tokens [here](https://www.tinybird.co/docs/forward/get-started/authentication#json-web-tokens-jwts).

[Watch a video of the Clerk + Tinybird JWT token flow](./assets/clerk-tinybird-jwt.mp4)

## Mock Data

For local testing, generate mock data with the following commands:

```sh
cd tinybird/mock
npm install
npm run generate -- --start-date 2025-02-01 --end-date 2025-03-31 --events-per-day 100 --output ../fixtures/llm_events.ndjson
```

The [generate-llm-events.js](https://github.com/tinybirdco/llm-performance-tracker/blob/main/tinybird/mock/generate-llm-events.js) script generates the embeddings.
