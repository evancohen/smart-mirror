# Tennis snapshots

An optional view of current tennis matches, refreshed every 15 minutes by default.
It shows player names, games by set, points, the server and interrupted-match
status. These are occasional snapshots, not point-by-point live coverage. The
fetch time remains visible, including when a refresh fails. Missing scores are
shown as unavailable, not as 0–0.

## Configuration

Get a free key from <https://livetennisapi.com/subscribe/free> (no card required).
Use a key dedicated to this mirror: the budget cannot account for another app or
mirror using the same key. No paid plan is needed.

Add the following to `config.json`, alongside the other plugin settings:

```json
"tennis": {
  "key": "YOUR_FREE_KEY",
  "refreshInterval": 15,
  "maxMatches": 3
}
```

Add this entry to the existing `plugins` array to choose its position:

```json
{
  "name": "tennis",
  "area": "top-right",
  "order": "3",
  "active": true
}
```

Settings are also available in the remote configuration page. Restart the mirror
after configuration changes. With an empty or missing key the plugin is hidden
and makes no requests. Setting the plugin's `active` value to `false` also disables
it. Keep `config.json` private, as with other plugins' credentials.

`refreshInterval` is in minutes and is clamped to 15–1440 even for hand-edited
configuration. `maxMatches` is clamped to 1–10 and only changes the display.
All views share a single request, cache and timer. The plugin requests only the
first page (up to 200 matches), showing a selection notice when results are omitted.

## Request budget and failures

The plugin uses `GET /matches?status=live&limit=200` with the `X-API-Key` header.
It never requests rankings, history, market data or additional pages. The free
tier allows 100 requests/day; spacing all attempts by at least 15 minutes limits
this mirror to 96/day, including failed requests. There are no immediate retries.
HTTP 429 responses extend the wait using `Retry-After` (24 hours if absent).

The next allowed request time and last successful snapshot are saved in the
mirror's local storage, without the API key. Reloading or restarting preserves
the cooldown; a failed refresh preserves the dated snapshot. Updates pause if
the cooldown cannot be stored. Clearing the mirror's application data removes
that budget record, so preserve the configured interval and any outstanding
`Retry-After` delay before restarting afterward.

## Checks

`npm test` runs the project's ESLint check and the offline tennis regressions.
They cover score orientation, missing data, shared requests, persistence,
failure handling and free-tier pacing without an API key or display hardware.
