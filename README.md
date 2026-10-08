# emma-companionship

Next.js app for companionship registry and related workflows.

## Prerequisites

- **Node.js** (see project tooling / `package.json`)
- **Docker** and Docker Compose (local Postgres)
- **Python 3.10+** available as `python3` — required for `npm run db:*` operator scripts (stdlib only; no pip packages for those scripts)

## Security

Don't put secrets in `.env*` files. Why?

- AI agents can read them
- read [that article](https://github.com/Infisical/infisical)
- in simple words: **put secrets in memory**

But that's not enough.
As developer, you need to take care of not exposing
memory stored secrets into LLM context.

- read [that article](https://auth0.com/blog/want-ai-agents-that-don-t-spill-secrets-don-t-give-them-secrets/)
- so, also **review** AI generated code if AI has not exposed envvars, like: `print(os.environ["PUSH_SERVER_KEY"])`

### simplest handling of secrets

- export them as envvars inside terminal where you start your app
- but **remember to prefix export by space**

  ```bash
  export DB_PASSWORD=123passwd_example456   # wrong
   export DB_PASSWORD=123passwd_example456  # good
  ```

  - that way this command won't land in history (including history files: `~/.zsh_history`, `~/.bash_history`)
  - test it with `history` command
- so, it should look something like:

  ```bash
   export DB_PASSWORD=123passwd_example456
  npm run dev
  ```

For staging/production DB access, prefer leaving `DB_USER` / `DB_PASSWORD` / `DB_HOST` blank in `.env.staging` / `.env.production` and exporting them in the shell. Details: [db/README.md](db/README.md).

## Getting Started

1. Copy env templates — see [`.env.example`](.env.example):
   - `.env.local` — Auth.js / Google / shared flags
   - `.env.development` — local Docker `DB_*` (Next loads this with `next dev`)
2. Start the database and apply migrations:

   ```bash
   npm run db:start
   npm run db:migrate:dev
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

Database commands, export/import between environments, and troubleshooting: **[db/README.md](db/README.md)**. 
Architecture overview: [docs/current-architecture.md](docs/current-architecture.md).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
