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
- Example of transactions: `src/app/api/posts/[postId]/likes/route.ts`

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

- NOTE: if we render a component inside a server component, it has to be annotated with `"use client"`
- NOTE: hooks can only be called in client components, example of a hook:
  `src/app/(main)/messages/useInitializeChatClient.ts`
- NOTE: metadata can only be set in a server component, so if we need a client component being shown in a separate page
  with metadata, we need to wrap it in a server page component: `src/app/(main)/messages/page.tsx`
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

# Routing

- Directory naming:
    - `(auth)/signup`: router ignores the `(auth)` part for the url
    - `api/users/[userId]/followers`: square brackets mark a placeholder for the url parameter
- Idea: we create serverside endpoints springlike and make requests to them using ReactQuery (see below)
- Example for endpoints: `src/app/api/posts/for-you/route.ts`
- We can then call endpoints with `kyInstance` by using the directory path to the `route.ts`:

  ```
  kyInstance.delete(`api/users/${props.userId}/followers`)
  ```
- NOTE: if we want to cache the result, we wrap the call with `useQuery({})`; if we want update in place we use
  `useMutation({})` (`OptimisticUpdate`).
  See "Cache" and "ReactQuery" sections below

# Component referencing

- We can use our own components inside the others
- We just need to create `.tsx` files for an euch component
- If we need to provide references from a parent component into an internal element of a child component, we do need to
  use `React.forwardRef`
- Example for that: `PasswordInput` child component inside the `SignUpForm`
- Any child component of a client component is automatically a client component, so no explicitly annotation
  `use client` needed

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
- Usage of groups inside a component: `src/components/posts/Post.tsx`

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
- NOTE: we can only use client components within server components!
- NOTE: we can only call hooks within client components!
- All child components automatically inherit component type from parent
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
- Usage of ReactQuery (see below)

# React Query

- See `tanstack.com`
- Goal: Fetching and managing data from server
- Data caching, avoiding raise conditions, infinite loading, optimistic updates, etc.
- Similar to state libs like redux
- Completely responsible for server states, runs on the server side
- Example of fetching and caching data from endpoint: `src/app/(main)/ForYouFeed.tsx`
- Structure:
    - `ReactQueryPrivider.tsx`: client component as a context provider for ReactQuery. We wrap the whole context inside,
      see `src/app/layout.tsx`
    - `route.ts`: endpoints for fetching data from server
    - `...tsx`: client components where data are fetched and cached
- Using Ky: https://github.com/sindresorhus/ky/tree/4a427011ad7b4ab98bb5f02ecaa5375fba5addca
- Example of using Ky converting strings into Date: `lib/ky.ts`
- Mutation:
    - Problem: after submitting a new post, we want to show it without reloading the page
    - Solution: mutation, see example `src/components/posts/editor/mutations.ts`
    - Example for argument binding between mutation function and mutation call:
      `src/components/posts/DeletePostDialog.tsx`
    - Example of `OptimisticUpdate`: `src/components/FollowButton.tsx`
- Polling/Refetching data: `src/app/(main)/NotificationsButton.tsx`

# Infinite Loading

- We want to automatically load data by scrolling the page
- For that we create an auto scrolling container: `components/InfiniteScrollContainer.tsx` (it is generic since children
  are any data you pass in)
- It takes care of autoloading by scrolling the page
- Usage: `src/app/(main)/ForYouFeed.tsx`

# Set a loading delay

- Just for test purpose: `await new Promise(r => setTimeout(r, 2000));`

# Dialog

- Example of a confirmation dialog: `src/components/posts/DeletePostDialog.tsx`
- Example of a dialog with bindings and optimistic update: `src/app/(main)/users/[username]/EditProfileDialog.tsx`
- Dialog for upload images: `src/components/CropImageDialog.tsx`

# Reading `.env` variables in code

- See `src/app/api/uploadthing/core.ts` as example

# File upload

- We use https://uploadthing.com/
- Wrapper around AWS S3, but easier to use
- We need to set up the file uploader like `src/app/api/uploadthing/core.ts`
- NOTE: app id env variable has to have the prefix `NEXT_PUBLIC`
- A unique upload url is needed to restrict from external usage
- We need a `route.ts` file for upload endpoints
- Usage of UI components:
    - Modify `tailwind.config.ts` file: `export default withUt(config)`
    - Exporting hooks for uploading: `src/lib/uploadthing.ts`
    - Add SSR plugin to the `src/app/layout.tsx`: `<NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />`
- Example of usage: `src/components/posts/editor/useMediaUpload.ts`
- Example of drag&drop and copy&paste by upload: `src/components/posts/editor/PostEditor.tsx`
- Uploadthing endpoints usage: `src/app/api/clear-uploads/route.ts` (deleting media based on auth and cron via
  `vercel.json`; PROD only)

# Error handling

- HydrationWarning:
    - If we show data with timestamp, where there is a delay between server and client time, we get it
    - Solution: use `suppressHydrationWarning` inside the tag, see `src/components/posts/Post.tsx`

# UseState

- Concept of tracking changes on child components clientside
- Example: a button has to trigger some state change depending on click
- See: `src/components/posts/Post.tsx`

# General React concept of E2E component creation:

- Usecase: we want to create a new comment on a post-component
- Backend:
    - `actions.ts`: submit a new comment using prisma after user validation and return it
    - `route.ts`: GET endpoint for fetching comments from the database using prisma
    - `Comments.tsx`: client component for showing comments. We use ReactQuery and kyInstance to fetch data over the
      endpoint and paginate it
    - `mutation.ts`: ReactQuery mutation for optimistic updating the cache after submitting a new comment (makes sure
      the data are available on all pages). IMPORTANT: the returned new comment from `actions.ts` is the one being used
      onSuccess callback in `mutation.ts`
    - `CommentInput.tsx`: client component for submitting a new comment. Here we call `mutation.ts` hook on submitting
      to update the cache optimistic
    - `Comment.tsx`: client component for a single comment for showing in `Comments.tsx`
    - `DeleteCommentDialog.tsx`: confirm dialog for deleting a comment. Here we use `mutation.ts` delete hook to
      optimistically update the cache
    - `CommentMoreButton.tsx`: three dot button for opening the delete-confirm dialog for deleting a comment.
      Here we bind the comment to the dialog, so later, if we render the button on each comment, we want which one is to
      delete

# Server actions vs. routing

- We can either use `actions.ts` or `route.ts` for CRUD operations, etc.
- Technically both work, but actions have some weird behavior like blocking navigation while running
- So, it depends on usecase which one to use: for creating a post, actions might be ok, since the user has to wait. For
  marking a notification, as read endpoint works better, because the user navigates further immediately

# Messaging

- We use: https://getstream.io/
- Stream server client: `src/lib/stream.ts`
- Getting a token: `src/app/api/get-token/route.ts`
- Stream Chat client frontend: `src/app/(main)/messages/useInitializeChatClient.ts`
- Styling for the Streamer messenger: see `src/app/globals.css`