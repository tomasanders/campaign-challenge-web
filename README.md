# Campaign Challenge Web

Angular frontend for the Campaign Challenge participant signup workflow.

## Quick start

The frontend expects the sibling Rails API project to be available at `http://localhost:3000`.

### 1. Start the API

In a terminal from the sibling `campaign-challenge-api` directory:

```bash
bin/setup
bin/rails server -p 3000
```

### 2. Start the frontend

In a second terminal, from this repository:

```bash
npm install
npm start
```

Open [http://localhost:4200/](http://localhost:4200/).

## Requirements

- Node.js and npm
- Angular 19.2.x and TypeScript 5.7.2 (installed through `package.json`)
- The sibling `campaign-challenge-api` Rails repository
- Brave or another Chromium browser for the test suite

The expected local repository layout is:

```text
Code/
├── campaign-challenge-api/
└── campaign-challenge-web/
```

## Common commands

Run these commands from the project root:

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npm start` | Start the Angular development server |
| `npm run build` | Build the application |
| `npm test` | Run the Karma test suite |

Build output is written to `dist/campaign-challenge-web/`.

## Configuration

The development server defines a proxy in [proxy.conf.json](proxy.conf.json) for `/api/*` requests to `http://localhost:3000`. The current environment configuration also sets the API base URL directly to `http://localhost:3000`, so the browser calls the Rails API directly. Make sure the Rails API allows `http://localhost:4200` through CORS.

On macOS, `npm test` uses the Brave executable at `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser` through the `CHROME_BIN` environment variable. Update the command in `package.json` if Brave is installed elsewhere or if you use a different Chromium browser.

## API contract

The frontend uses these Rails API endpoints.

### List participants

```http
GET /api/v1/participants
```

Returns a participant array:

```json
[
  {
    "id": 1,
    "first_name": "Ava",
    "last_name": "Martinez",
    "email": "ava@example.com",
    "age": 29,
    "country_code": "US",
    "marketing_opt_in": false
  }
]
```

### Create a participant

```http
POST /api/v1/participants
Content-Type: application/json
```

Request body:

```json
{
  "first_name": "Ava",
  "last_name": "Martinez",
  "email": "ava@example.com",
  "age": 29,
  "country_code": "US",
  "marketing_opt_in": false
}
```

A successful request returns `201 Created`:

```json
{
  "participant": {
    "id": 1,
    "first_name": "Ava",
    "last_name": "Martinez",
    "email": "ava@example.com",
    "age": 29,
    "country_code": "US",
    "marketing_opt_in": false
  },
  "message": "Signup successful"
}
```

Validation failures return `422 Unprocessable Entity`:

```json
{
  "errors": {
    "email": ["is invalid"],
    "age": ["must be less than or equal to 120"]
  }
}
```

## Copilot usage

GitHub Copilot was used to inspect the repository configuration and source code, verify the documented Angular and Rails API setup, and create and update this README. The application code and configuration were not modified as part of this documentation update.

## Improvements
The first thing I'd do is clean up the UX. I'm sort of happy with where it's at, given the time constraints, but I'd like to give it a thorough accessibility pass and feed the color palette through a WCAG assessor tool to make sure everything's good.

On the note of the UX, I'd also like to give it a more thorough testing on mobile. It works as-is, but would benefit from some mobile-specific adjustments.

The last thing would be to improve the AI in the tic-tac-toe game. It's *really* easy to win multiple games in a row, but it works as a proof of concept. If this was a real product, it'd definitely need to be harder to win or we'd have a scoreboard with scores in the hundreds, only ending because people got bored.
