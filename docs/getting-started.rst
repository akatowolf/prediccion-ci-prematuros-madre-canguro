Getting started
===============

This is where you describe how to get set up on a clean install, including the
commands necessary to get the raw data (using the `sync_data_from_s3` command,
for example), and then how to make the cleaned, final data sets.

Backend and frontend setup
--------------------------

1. Install the Python dependencies:

```bash
pip install -r requirements.txt
pip install -e .
```

2. Start the backend API:

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

3. Install Node dependencies and start the frontend:

```bash
npm install
npm run dev
```

4. Open the Vite development URL in your browser.

Documentation links
-------------------

- See the clustering analysis documentation in :doc:`clustering`.
- See model inference and predictor details in :doc:`predictive-model`.
- The repository contains notebook sources for domain clustering in
  `notebooks/clustering-models/`.

Docker / Production
-------------------

We provide a `docker-compose.yml` that builds and runs both the API and the
frontend (served by nginx). This is the recommended quick way to run the
application locally or in a containerized environment.

Build and start everything:

```bash
docker compose up --build
```

By default the services are exposed at:

- Backend: `http://localhost:8000`
- Frontend (nginx): `http://localhost:3000`

Runtime frontend configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The frontend supports runtime injection of the API URL so you don't need to
rebuild the static files when pointing to a different backend. The nginx
container writes `/env-config.js` into the served files; the app loads it from
`/env-config.js` and sets `window.__API_URL`.

Example HTML snippet to set the API URL at deploy time (insert before
loading the app):

```html
<script>
  // runtime override (example)
  window.__API_URL = "https://mi-backend.example.com";
</script>
<script type="module" src="/src/main.jsx"></script>
```

See also the repo-level Docker notes in the `REPO_DOCUMENTATION.md` file.
