# Campaign Challenge Web

Angular frontend for the Campaign Challenge participant signup workflow.

## Requirements

- Node.js and npm. The repository does not pin Node.js or npm versions.
- Angular 19.2.x, with Angular CLI 19.2.27 configured in `package.json`.
- TypeScript 5.7.2.
- A Chromium browser for the Karma test suite. The configured npm test script uses Brave on macOS.

## Repository layout

The web frontend must run alongside the sibling Rails API repository:

```text
Code/
├── campaign-challenge-api/
└── campaign-challenge-web/
```

## Local development

Two servers must run at the same time. From `Code/campaign-challenge-api/`, start the Rails API in one terminal:

```bash
cd ../campaign-challenge-api
bin/setup
bin/rails server -p 3000
```

From `Code/campaign-challenge-web/`, install dependencies and start Angular in a second terminal:

```bash
cd ../campaign-challenge-web
npm install
npm start
```

Open the application at [http://localhost:4200/](http://localhost:4200/). The Rails API runs at [http://localhost:3000](http://localhost:3000).

The Angular development server is configured in [proxy.conf.json](proxy.conf.json) to proxy `/api/*` requests to `http://localhost:3000`. The current environment configuration uses `http://localhost:3000` as the API base URL, so the frontend's API service currently makes direct browser requests to Rails. The Rails API must allow `http://localhost:4200` through CORS.

## Install, build, and test

Install frontend dependencies:

```bash
npm install
```

Start the Angular development server:

```bash
npm start
```

Build the application:

```bash
npm run build
```

Build artifacts are generated under `dist/campaign-challenge-web/`.

Run the configured frontend test suite:

```bash
npm test
```

The test script runs Angular tests with Karma and `ChromeHeadless`, using the Brave executable at `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser` on macOS.

## API contract

The frontend uses the Rails API endpoints below.

### List participants

```http
GET /api/v1/participants
```

Successful responses are a bare participant array:

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

The request body is a flat participant payload:

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

A successful request returns `201 Created` with this shape:

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
