This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Security
Don't put secrets in .env* files. Why?
- AI agents can read them
- read [that article](https://github.com/Infisical/infisical)
- in simple words: **put secrets in memory**

But that's not enough. 
As developer, you need to take care of not exposing
memory stored secrets into LMM context.
- read [that article](https://auth0.com/blog/want-ai-agents-that-don-t-spill-secrets-don-t-give-them-secrets/)
- so, also **review** AI generated code if AI has not exposed envvars, like: `print(os.environ["PUSH_SERVER_KEY"])` 

### simplest handling of secrets
- export them as envvars inside terminal where you start your app
- but **remember to prefix export by space**
  ```bash
  export DB_PASSWORD=123passwd_example456   # wrong
   export DB_PASSWORD=123passwd_example456  # good
  ```
  - that way this command won't land in history (including history files: `~/.zsh_history`, `~/.bash_history` )
  - test it with `history` command
- so, it should look something like:
  ```bash
   export DB_PASSWORD=123passwd_example456
  npn run dev
  ```
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
