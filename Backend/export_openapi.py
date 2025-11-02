import json
from app.main import app

# Force generate OpenAPI schema (this will initialize app but not start a server)
schema = app.openapi()

with open("openapi.json", "w", encoding="utf-8") as f:
    json.dump(schema, f, indent=2)

print("Wrote Backend/openapi.json (OpenAPI schema)")
