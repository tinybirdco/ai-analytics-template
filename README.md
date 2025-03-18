# AI Analytics Template

This is a template for a Logs Explorer web application. It is built with Next.js and Tinybird.

Use this template to bootstrap a multi-tenant, user-facing LLM analytics dashboard and cost calculator. Fork it and make it your own!

## Live Demo

https://ai-analytics.tinybird.app

## Local Development

Get started by forking the GitHub repository and then customizing it to your needs.

Start Tinybird locally:

```
curl -L https://tbrd.co/fwd | sh
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
NEXT_PUBLIC_TINYBIRD_API_KEY=<YOUR_TINYBIRD_READ_PIPES_TOKEN>
NEXT_PUBLIC_TINYBIRD_API_URL=http://localhost:7181
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

To use the AI features, click on Settings in the dashboard and in put an Open AI API key
