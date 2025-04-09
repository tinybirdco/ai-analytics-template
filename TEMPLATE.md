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

Deploy the template, instrument and use the hosted version to track.

1. Deploy:

```bash
# install the tinybird CLI
curl https://tinybird.co | sh

# select or create a new workspace
tb login

# deploy the template
tb --cloud deploy --template https://github.com/tinybirdco/llm-performance-tracker/tree/main/tinybird
```

2. Instrumentation:

Send your data to Tinybird using the [Events API](https://www.tinybird.co/docs/get-data-in/ingest-apis/events-api). Some examples:

- [LiteLLM (Python)](https://www.tinybird.co/docs/get-data-in/guides/ingest-litellm)
- [Vercel AI SDK (TypeScript)](https://www.tinybird.co/docs/get-data-in/guides/ingest-vercel-ai-sdk)

3. Use the hosted tracker:

```bash
# copy the token to the clipboard
tb token copy read_pipes && TINYBIRD_TOKEN=$(pbpaste)

# use the hosted dashboard with your data
open https://llm-tracker.tinybird.live\?token\=$TINYBIRD_TOKEN
```

## Build and deploy your own LLM tracker

See [README.md](https://github.com/tinybirdco/llm-performance-tracker)