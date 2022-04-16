### RUN (Terminal 1 Main)
```
cp ./.env.example .env
npm install
npm run migrate up
npm run start
```

### RUN (Terminal 2 Worker)
```
npm run worker
```