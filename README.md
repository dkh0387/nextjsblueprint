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
    - By using a custom theme, we just customize the shadcn template and paste the code into `src/app/globals.css`
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

# ORM (Prisma)

- We use prisma: https://www.prisma.io/
- Run `npx prisma init` to create `schema.prisma` and edit `.env` files
- Enable full text search explicitly: add `previewFeatures = ["fullTextSearch"]` to `schema.prisma`
- Prisma client config: `src/lib/prisma.ts` (
  see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help for non singleton issues)
- All migration scripts are in `schema.prisma`
- We run `npx prisma db push` to execute a migration
- Inspecting a database: run `npx prisma studio` to open up a local hosted database manager
- Example of fetching data: `post/editor/PostEditor.tsx`
- Defining types of fetched objects including joined objects: `lib/types.ts`
- Example of using native SQL: `components/TrendSideBar.tsx`

# Authentication

- We use Lucia: https://lucia-auth.com/
- After creating users and sessions in the database (see `schema.prisma`) we need `/src/auth.ts` file, containing the
  whole authentication logic
- We do need to add `serverExternalPackages: ["@node-rs/argon2"]` in `next.config.mjs` for Lucia to work

# Validation

- schemas are placed in `lib/validation.ts` (attributes like email are valid after log-in, etc.)
- Validation library: https://zod.dev/
-

# Project structure

- Separate the app in two parts: ath part and main part, since the auth part does not need a frame
- Wrapping the whole layout of the app: use `src/app/layout.tsx` file to set title, etc.
- Purpose of `(...)` directories:
    - Any page inside those directories have an url without directory name itself
    - If we want a specific layout only applied to a specific group, we put an according `layout.tsx` into the group
      folder like `(auth)`
    - NOTE: if we do render multiple child components (like login and signup within `(auth)/layout.tsx`) we need to use
      an array notation in the method signature:

      ```
      export default async function Layout({
      children,
      }: {
      children: React.ReactNode;
      })
      ```

- Directory naming: `(auth)\signup`: router ignores the `(auth)` part for the url
- Backend in NexJS: we use server actions (functions, which generate requests for CRUD, etc.), see
  `(auth)/signup/actions.ts` as example
- Creating a page:
    - If we create a `page.tsx` file under `(auth)/signup` it will create a view under url `/signup`
    - Everything in `page.tsx` is rendered serversides, we try to pre render as much as possible; so page files are
      ***server components***
    - Since server components are all static, we need to inject JS components into it to make it interactive. We can do
      so by injecting ***client components***
    - Client components are rendered clientsides and need their own files
- In general, within a route we have
    - `page.tsx`: main serverside rendered content
    - `layout.tsx`: a frame for the content, everything here is applied to all the components within the route
    - `<components>.tsx`: components itself, rendered clientside
    - `actions.ts`: backend services
    - `lib/....ts`: lib files

# Component referencing

- We can use our own components inside the others
- We just need to create `.tsx` files for an euch component
- If we need to provide references from a parent component into an internal element of a child component, we do need to
  use `React.forwardRef`
- Example for that: `PasswordInput` child component inside the `SignUpForm`

# Context provider

- Providing content to client components on session example:
    - Problem: if we validate session, we trigger database traffic
    - This happens only clientsides, so if frontend components make calls
    - To avoid this, we can use a common `(main)/layout.tsx` file, where we fetch session once and provide it to all
      child
      clients
    - To do so we need a session provider (see `SessionProvider.tsx`)
    - A context provider is a client component, which provides a value context to the children
    - It can be called in an according `(main)/layout.tsx` file, which makes sure it is being applied to all client
      components defined within `(main)` directory (those are all pages except login and signup)
    - NOTE: event if a context provider is a client component, children of it could be server components!
    - So only the context is produced clientsides, providing overall possible!

# CSS

- ***NOTE:*** all CSS stuff is coming from Tailwind CSS classes
- Some explanation on CSS classes in `Navbar.tsx`

# React component

- Example with explanation: `components/UserButton.tsx`
- Client or server components, rendering depends
- Visibility: could live with `(...)` directories and only available there
- Typical structure:

    ```
     "use client";
 
     interface UserButtonProps {
     className?: string;
     }
    
     export default function UserButton({ className }: UserButtonProps) {}
    
    ```
- `export default`: means that the function is automatically imported if the component is
- `function UserButton()`: this is the component, can be used as HTML tag
- `({ className }: UserButtonProps)`: props provided to the component; by using as HTML tag we define those pros along
  the tag like CSS style

# Progressive enhancement

- Problem: some elements like search bar should work quickly in the browser, but sometimes JS is disabled
- For those cases, the browser will create a request with params from the HTML element
- This url is wrong if we do not define it explicitly and points to the wrong result
- So we need to configure explicitly: `<form onSubmit={handleSubmit} method="GET" action="/search">`
- See `components/SearchField.tsx` for an example

# Suspense indicator

- Components with db access: they have to be server components.
  We need a component in component pattern, where there is an async component where db fetching happens.
  Example: `components/TrendsSideBar.tsx`
- We need to provide a loading indicator while data is fetching:

```
      <Suspense fallback={<Loading />}>
        <WhoToFollow></WhoToFollow>
      </Suspense>
```

- NOTE: `<Suspense></Suspense>` only works for child components, so we need to extract an extra component where fetching
  happens!

# Caching

- `cache()`: function to cache clientside data for sharing between components. Example: `src/auth.ts`
- `unstable_cache()`: function to cache serverside data to avoid multiple db requests by page reloading. Example:
  `components/TrendSideBar.tsx`

# React Query

- See `tanstack.com`
- Goal: Fetching and managing data from server
- Data caching, avoiding raise conditions, infinite loading, optimistic updates, etc.
- Similar to state libs like redux
- Completely responsible for server states, runs on the server side
- Idea: we create serverside endpoints springlike and make requests to them using ReactQuery
- Example for such endpoints: `src/app/api/posts/for-you/route.ts`
- Example of fetching and caching data from endpoint: `src/app/(main)/ForYouFeed.tsx`
- Structure:
    - `ReactQueryPrivider.tsx`: client component as a context provider for ReactQuery. We wrap the whole context inside,
      see `src/app/layout.tsx`
    - `route.ts`: endpoints for fetching data from server
    - `...tsx`: client components where data are fetched and cached
- Using Ky: https://github.com/sindresorhus/ky/tree/4a427011ad7b4ab98bb5f02ecaa5375fba5addca
- Example of using Ky converting strings into Date: `lib/ky.ts`

# Infinite Loading

- We want to automatically load data by scrolling the page
- For that we create an auto scrolling container: `components/InfiniteScrollContainer.tsx` (it is generic since children
  are any data you pass in)
- It takes care of autoloading by scrolling the page
- Usage: `src/app/(main)/ForYouFeed.tsx`