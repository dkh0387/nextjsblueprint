This is the starting code for this tutorial.

**IMPORTANT**: After cloning the repo, open the command line inside the project and run `npm i --legacy-peer-deps`.

# Create from scratch:

- Make sure you have installed Node.js >= 20, npm
- Switch into the directory where the project should live and run `npx create-next-app@<version>`
- Follow along by selecting TypeScript, ESLint, Tailwind CSS, src/, App Router, NO Turbopack, NO customize the default
  import alias
- After creating open the project in IDE and run `npm run dev` in CLI
- Installing packages:

  ```
  npm i lucia @lucia-auth/adapter-prisma prisma @prisma/client @tanstack/react-query @tanstack/react-query-devtools @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/pm uploadthing @uploadthing/react arctic date-fns ky next-themes react-cropper react-image-file-resizer react-intersection-observer react-linkify-it stream-chat stream-chat-react --legacy-peer-deps
  ```

- NOTE: we need `--legacy-peer-deps` at the end, because some packages are not compatible with Node.js 15 yet
- All installed packages are in `package.json`
- Dev dependencies install command:
  `npm i -D prettier eslint-config-prettier prettier-plugin-tailwindcss --legacy-peer-deps`
- Shadcn components:
    - Add command:
      `npx --legacy-peer-deps shadcn-ui@latest add button dialog dropdown-menu form input label skeleton tabs textarea toast tooltip`
    - Shadcn is a component library for all checkboxes, buttons, etc. with source code included, so we do not worry
      about changes in look and feel, see https://ui.shadcn.com/
    - After installation Shadcn creates `components.json` as a config file, adds CSS to `global.css` and makes changes
      on`tailwind.config.ts`
    - We can either copy themes from https://ui.shadcn.com/themes or use own themes
    - Code for all installed components can be found here: `src/components/ui` and modified any time
- Enable `prettier-plugin-tailwindcss`: create a new config file `prettier.config.js` in the root directory:

    ```
    module.exports = {
     plugins: ["prettier-plugin-tailwindcss"],
    };
    ```
- Make ESLint work together with Prettier to edit `eslintrc.json`:

    ```
    {
     "extends": ["next/core-web-vitals", "prettier"]
    }
    ```

- Wrapping the whole layout of the app: use `src/app/layout.tsx` file to set title, etc.
- Pages caching clientsides (for 30 sec): adit `next.config.mjs`:

    ```
    ...
    staleTimes: {
      dynamic: 30,
    },
    ...
    ```

# Deployment platform

- Use vercel (https://vercel.com/) as a platform for set up the database as well as deployment the app
- Especially for the postgres db, we use
  Neon: https://console.neon.tech/app/projects/royal-math-04615317?database=neondb

# ORM

- We use prisma: https://www.prisma.io/
- Run `npx prisma init` to create `schema.prisma` and edit `.env` files
- Enable full text search explicitly: add `previewFeatures = ["fullTextSearch"]` to `schema.prisma`
- Prisma client config: `src/lib/prisma.ts` (
  see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help for non singleton issues)
- All migration scripts are in `schema.prisma`
- We run `npx prisma db push` to execute a migration

# Authentication

- We use Lucia: https://lucia-auth.com/
- After creating users and sessions in the database (see `schema.prisma`) we need `/src/auth.ts` file, containing the
  whole authentication logic
- Validation:
    - schemas are placed in `lib/validation.ts` (attributes like email are valid after log-in, etc.)
    - Validation library: https://zod.dev/
- We do need to add `serverExternalPackages: ["@node-rs/argon2"]` in `next.config.mjs` for Lucia to work

# Project structure

- Separate the app in two parts: ath part and main part, since auth part does not need a frame
- Directory naming: `(auth)\signup`: router ignores the `(auth)` part for the url
- Backend in NexJS: we use server actions (functions, which generate requests for CRUD, etc.), see
  `(auth)/signup/actions.ts` as example
- 