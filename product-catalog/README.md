# Product Catalog (with Redis Cache)

Local full-stack example app demonstrating Redis caching for product data.

Requirements: Docker, Docker Compose, Git

Quickstart:

```bash
git clone <repo-url>
cd product-catalog
docker-compose up --build -d
# seed DB (optional):
docker-compose exec backend npm run seed
```

Services:
- `redis` - Redis Stack used as cache (official image `redis/redis-stack`).
- `db` - PostgreSQL database for persistent product storage.
- `backend` - Node.js/Express REST API with Redis caching logic.
- `frontend` - React/Vite frontend (dev server exposed on port 5173).

Redis caching behavior:
- On GET `/api/products/:id` the backend first checks Redis key `product:{id}`.
- If found -> response includes `cache: 'hit'` and product is returned from Redis.
- If not found -> product fetched from Postgres, stored in Redis with TTL 600s and response includes `cache: 'miss'`.
- On product update/delete the backend deletes the `product:{id}` key to invalidate cache.

Testing:
- Add/update/delete products via the frontend UI.
- Click "Detail (shows cache)" for a product to see `hit` / `miss` in a popup.

Stop and remove data:

```bash
docker-compose down -v
```
