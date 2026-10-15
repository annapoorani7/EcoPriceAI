# Local MongoDB Replica Set

Booking creation updates room availability and inserts the booking in one MongoDB transaction. MongoDB standalone servers do not support this operation; do not disable the transaction to work around the error.

On Windows, stop the existing local MongoDB service and restart `mongod` with replica-set support. Reuse the existing server's data directory to preserve its data; do not point the service at a new empty directory unless you intentionally want a fresh database. For a fresh local database only:

```powershell
New-Item -ItemType Directory -Force C:\data\ecopriceai-rs0
mongod --replSet rs0 --port 27017 --dbpath C:\data\ecopriceai-rs0
```

In a second terminal, initialize the set once:

```powershell
mongosh --port 27017
```

```javascript
rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '127.0.0.1:27017' }] })
rs.status()
```

Wait for the member state to become `PRIMARY`. Set the server's local `MONGO_URI` to:

```text
mongodb://127.0.0.1:27017/ecopriceai?replicaSet=rs0
```

The repository's `server/.env.example` shows this URI. Keep credentials in your local environment file; do not put them in source control. For an authenticated deployment, keep the existing credentials and add `replicaSet=rs0` as a URI query parameter (or `&replicaSet=rs0` when a query string already exists).