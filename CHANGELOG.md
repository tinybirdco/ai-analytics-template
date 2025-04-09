All notable changes to this project will be documented in this file.

Types of changes:

- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Fixed` for any bug fixes.
- `Removed` for now removed features.
- `Security` in case of vulnerabilities.
- `Fixed` Improve error feedback when Explain feature fails

2025-04-08
==========

- Added: Support a `token` parameter so you can use the hosted application at `llm-tracker.tinybird.live` with your own Tinybird workspace:

```
curl https://tinybird.co | sh
tb login
tb --cloud deploy --template https://github.com/tinybirdco/llm-performance-tracker/tree/main/tinybird
tb token copy read_pipes && TINYBIRD_TOKEN=$(pbpaste)
open https://llm-tracker.tinybird.live\?token\=$TOKEN
```

See [how to instrument your LLM calls](https://github.com/tinybirdco/llm-performance-tracker?tab=readme-ov-file#instrumentation) and you are done!

2025-04-07
==========

- Added: Live demo mode. When setting your OpenAI key you can filter your own LLM calls from the application. Use the AI cost calculator or the "Ask AI..." filter and click `Your LLM calls` (no personal data is saved).

[![LLM Calls Demo](https://img.youtube.com/vi/dF0kCYdf7QA/0.jpg)](https://youtu.be/dF0kCYdf7QA)

- Added: Support multiple selections to compare
- Added: Add loading states
- Added: Added a component to resize the results table
- Added: Added a component to choose visible columns in the result table
- Fixed: Changing tabs does not reload the whole page
- Changed: Show less columns by default in the data table
- Changed: Update the floating component
- Changed: Reset table on clear input search
- Changed: AI cost calculator requests on clicking an example query

