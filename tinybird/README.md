This is a [Tinybird project](https://www.tinybird.co/docs/forward) for the AI analytics template.

It has a single table `llm_events` that stores LLM events with usage metrics, costs, and metadata.

Endpoints:

- `generic_counter` shows cost by several dimensions.
- `llm_usage` is used to build time series charts.
- `llm_messages` is used to build the vector search.

## Local development

Start Tinybird locally:

```
curl https://tinybird.co | sh
cd tinybird
tb local start
tb login
tb dev
```

Generate mock data:

```
cd tinybird/mock
npm install
npm run generate -- --start-date 2025-02-01 --end-date 2025-03-31 --events-per-day 100 --output ../fixtures/llm_events.ndjson
```

## Deploy to cloud

Use the [CI/CD GitHub actions](https://github.com/tinybirdco/ai-analytics-template/tree/main/.github/workflows) in this repository to deploy to Tinybird or the Tinybird CLI:

```
tb --cloud deploy
```
