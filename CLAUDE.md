# Project 5 – React Advanced (Units 9–14)

Full-Stack Web Development course project — Lev Academic Center, 2025–2026.

## Project Overview

A React SPA that fetches and manages data from a local JSON-Server (modeled after jsonplaceholder.typicode.com).  
Technologies: **React Router, React Hooks, React Forms, JS Fetch, Async/Await**.

## Tech Stack

- **Frontend**: React 19 + Vite 8
- **Routing**: React Router (not yet installed — `npm install react-router-dom`)
- **Backend**: JSON-Server running on a local `db.json` file
- **State**: React Hooks only (no Redux)
- **Persistence**: Local Storage for the logged-in user session

## Server Setup

The local JSON-Server mirrors the structure of jsonplaceholder.typicode.com:

| Resource  | Relationship |
|-----------|-------------|
| users     | root entity |
| todos     | belong to a user (`userId`) |
| posts     | belong to a user (`userId`) |
| comments  | belong to a post (`postId`) |
| albums    | belong to a user (`userId`) |
| photos    | belong to an album (`albumId`) |

Run the server: `npx json-server --watch db.json --port 3000`

**Note**: Replace placeholder image URLs with working external image URLs.

## Authentication Rules

- **Login credentials**: `username` field as username, `website` field as password (from the users resource).
- Unauthorized login → show error message, stay on `/login`.
- Authorized login → save user object to Local Storage, redirect to `/home`.
- **Register**: `username` must not already exist in the server. On success → collect full user details → save to server + Local Storage → redirect to `/home`.
- **Logout**: clear Local Storage, redirect to `/login`.
- All routes except `/login` and `/register` require an authenticated user (guard with redirect).

## Routes & URL Structure

| Path | Page |
|------|------|
| `/login` | Login form |
| `/register` | Registration form |
| `/home` | User home page |
| `/users/:userId/todos` | Todos list |
| `/users/:userId/posts` | Posts list |
| `/users/:userId/posts/:postId/comments` | Post comments |
| `/users/:userId/albums` | Albums list |
| `/users/:userId/albums/:albumId/photos` | Album photos |

URLs must be informative and reflect the resource hierarchy.

## Page Requirements

### Login (`/login`)
- Fields: `username`, `password`
- On failure: display error, stay on page
- On success: save to Local Storage, go to `/home`

### Register (`/register`)
- Fields: `username`, `password`, `password-verify`
- Validate passwords match and username is unique on the server
- On success: go to a second form to complete full user profile details
- After completing profile: POST new user to server, save to Local Storage, go to `/home`

### Home (`/home`)
- Header displays the logged-in user's full name
- Sidebar or top nav with 5 buttons/links: **Info**, **Todos**, **Posts**, **Albums**, **Logout**
- **Info**: opens a modal overlay with the user's personal details
- **Logout**: clears Local Storage, redirects to `/login`
- **Todos / Posts / Albums**: navigate to their respective routes

### Todos (`/users/:userId/todos`)
- List each todo: `id`, `title`, `completed` checkbox
- Sort dropdown: by `id` / `title` / `completed`
- Search/filter: by `id`, `title`, or `completed` status
- CRUD: add new todo, delete, edit title, toggle completed

### Posts (`/users/:userId/posts`)
- Review mode list: show only `id` + `title` per post
- Search/filter: by `id` or `title`
- CRUD: add, delete, update post content
- Clicking a post expands it showing full content
- Expanded post has a button to load its comments
- Any user can add a comment (identified by current user)
- Only the comment owner can edit or delete their comment

### Albums (`/users/:userId/albums`)
- Review mode list: show only `id` + `title` per album
- Search/filter: by `id` or `title`
- Each album is a link to `/users/:userId/albums/:albumId/photos`
- Photo display: **do not load all at once** — use pagination, scroll, a "load more" button, or a slider
- CRUD for albums: create new albums for the current user
- CRUD for photos: add, delete, update photos within the user's albums

## Challenge Extensions

- **Page refresh resilience**: preserve current route, component state, and displayed data across browser refresh (compatible with React patterns — use Local Storage or session storage thoughtfully).
- **Client-side data cache**: avoid redundant server requests for already-fetched resources. Implement within React (e.g., a context/ref cache).
- **Cross-user data protection**: prevent a logged-in user from accessing another user's data — combine React route guards, JSON-Server capabilities, and DB-level ownership checks.

## Development Notes

- Do not share code between pairs.
- Each partner must participate in all parts of the project.
- Keep API calls in dedicated service/fetch modules, not inline in components.
- Use `async/await` with `try/catch` for all fetch calls.
- Photo URLs in `db.json` must be real, working image URLs (not placeholder.com stubs).
