# Campaign Challenge Web

Angular 19 frontend for the Campaign Challenge participant signup workflow. The standalone Angular application talks directly to the Rails API.

## Local development

Start the Rails API first. From the Rails API project:

```bash
bin/rails server -p 3000
```

The API must allow browser requests from `http://localhost:4200` through CORS. The Angular development API URL is configured in [src/environments/environment.ts](src/environments/environment.ts).

For Angular live reload on its own port, install dependencies and start Angular:

```bash
npm install
npm start
```

Once the Angular server is running, open `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Tests use Brave's Chromium binary by default on macOS. If Brave is installed in a different location, set `CHROME_BIN` to its executable path before running `ng test`.

## API contract

The frontend expects:

- `GET /api/v1/participants` returning a bare participant array.
- `POST /api/v1/participants` accepting a flat participant payload and returning `{ participant, message }` with `201 Created`.
- `422 Unprocessable Entity` responses shaped as `{ errors: { field: string[] } }`.

The production environment currently uses the same API URL placeholder. Set `apiBaseUrl` in [src/environments/environment.production.ts](src/environments/environment.production.ts) for a deployed Rails API.
