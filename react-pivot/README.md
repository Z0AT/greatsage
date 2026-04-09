# React Pivot Prototype

React + React Flow prototype for Desire Cache.

## Purpose

This is the pivot branch from the earlier SvelteKit experiment. It keeps `/api/items` as the canonical backend seam while testing a more graph-native browsing model.

## Stack

- React + Vite + TypeScript
- React Flow for graph layout, zooming, and node interaction
- Beautiful Skill Tree installed as a comparison/reference library, not yet the active renderer

## Environment

Copy `.env.example` to `.env` if the API is not same-origin:

```bash
VITE_DESIRE_CACHE_API_BASE_URL=http://127.0.0.1:5000
```

## Commands

```bash
npm install
npm run dev
npm run build
```
