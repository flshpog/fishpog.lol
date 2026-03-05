# Your Horizon – Master Build Specification

Comprehensive Development Roadmap for Claude Code

---

# PROJECT OVERVIEW

**Project Name:** Your Horizon
**Purpose:**
A desktop-focused, high-performance web platform that consolidates the most powerful Animal Crossing: New Horizons utilities into one cohesive system.

This document defines:

* Architecture
* Data strategy
* Feature modules
* Development phases
* Quality constraints
* Implementation order
* Rules Claude must follow

Claude must complete each phase fully before moving to the next.

---

# GLOBAL RULES (MANDATORY)

1. Do NOT manually hardcode large datasets.
2. All large datasets must be ingested from structured external sources (JSON/CSV/API).
3. System must support 25,000+ indexed entries efficiently.
4. All features must be modular.
5. No emojis.
6. Use publicly available official-style icons wherever possible.
7. All third-party logic must be credited.
8. No placeholder mock data unless explicitly allowed.
9. Prioritize correctness over speed of output.
10. Do not begin implementation until architecture is finalized.

---

# TECH STACK (FIXED)

Claude must use:

Frontend:

* Next.js (App Router)
* TypeScript
* TailwindCSS (custom ACNH-inspired theme)
* Zustand (state management)

Data:

* Static JSON ingestion
* Indexed search via MiniSearch or Fuse.js
* Local persistence via IndexedDB (Dexie.js)

3D Rendering:

* Three.js

No backend unless explicitly added later.

---

# PHASE 1 — SYSTEM ARCHITECTURE

Claude must first generate:

## 1. Folder Structure

Define complete project structure including:

* /app
* /components
* /modules
* /lib
* /data
* /hooks
* /store
* /styles
* /public/assets
* /public/icons
* /types

Each module must be isolated and self-contained.

---

## 2. Core Architectural Decisions

Claude must define:

* Global app layout structure
* Navigation system (top, side, responsive behavior)
* Data loading lifecycle
* Caching strategy
* Search indexing lifecycle
* State boundaries (global vs module-scoped)
* Performance safeguards for large datasets

No feature implementation yet.

---

# PHASE 2 — DATA INGESTION SYSTEM

Claude must design a scalable ingestion system for:

* Items (~23,000)
* DIY Recipes (~1,800)
* Songs (~110)
* Reactions (~88)
* Villagers (413)
* Fish
* Bugs
* Sea Creatures
* Fossils
* Art
* Events
* Mystery Islands
* Flowers

## Requirements

1. Identify reliable public datasets.
2. Convert data to normalized JSON schema.
3. Create unified indexing format.
4. Implement search keys:

   * name
   * category
   * season
   * availability
   * size
   * price
   * personality (villagers)
5. Build reusable data loader utility.
6. Build indexing pipeline executed on first load.
7. Persist indexed data in IndexedDB.

Claude must provide:

* Schema definitions
* Data normalization strategy
* Indexing strategy
* Lazy loading plan

---

# PHASE 3 — CORE UI FOUNDATION

Claude must build:

## 1. Design System

* ACNH-inspired color palette
* Typography system
* Reusable card component
* Grid layout system
* Badge system (collected, donated, favorite)
* Progress bars
* Toggle button system
* Icon wrapper system

No emojis.
All icons must be image-based.

---

# PHASE 4 — FEATURE MODULES (ORDER MATTERS)

Each module must be implemented separately and fully tested before moving forward.

---

## MODULE 1 — Profile System

Features:

* Character name
* Island name
* Hemisphere
* Native fruit
* Switch code
* Creator code
* Profile image upload

Profile must:

* Persist locally
* Be readable by other modules
* Not require backend

---

## MODULE 2 — Villager Database

Requirements:

* Full 413 villagers
* Search by:

  * name
  * species
  * personality
  * hobby
  * birthday
  * gender
* Mark as:

  * On island (max 10)
  * Favorite (unlimited)

On-island villagers must reflect in Home dashboard.

Images must be externally sourced and credited.

---

## MODULE 3 — Museum & Critter System

Features:

* Fish
* Bugs
* Sea Creatures
* Fossils
* Art

Must support:

* Mark as caught
* Mark as donated
* Filter by availability (month + hour)
* Hemisphere-aware filtering

Home dashboard must show:

* “Catchable Now” grid
* Color-coded outlines:

  * Grey = not caught
  * Yellow = caught not donated
  * Green = donated

---

## MODULE 4 — Collection Progress

Must track:

* DIY Recipes
* Songs
* Items
* Reactions

Requirements:

* Progress bars
* Search
* Filter by category
* Toggle collected

Must handle 25k+ entries without UI lag.

---

## MODULE 5 — Turnip Calculator

Claude must:

1. Research pattern logic.
2. Either:

   * Implement own predictor
     OR
   * Integrate logic from an existing open-source project with proper credit.

UI Requirements:

* Previous pattern selector
* First-time buyer toggle
* Purchase price input
* Daily AM/PM price inputs
* Probability output
* Best sell window prediction

Must persist weekly data.

---

## MODULE 6 — Event System

Features:

* Auto timezone detection (default GMT-5)
* Current month event list
* Calendar view
* Next upcoming event indicator

Claude must validate event dates from reliable sources.

---

## MODULE 7 — NPC Visitor Tracker

Track 11 visiting NPCs.

Features:

* Mark visit
* View visit history
* Display last seen date

Data must persist.

---

## MODULE 8 — Flower Breeding Guide

Features:

* 8 flower types
* Hybrid paths
* Cross combinations
* Visual diagrams
* Probability indicators

Must be data-driven.

---

## MODULE 9 — Mystery Islands

Track 18 island types.

Display:

* Image
* Name
* Resource details
* Spawn rate
* Native fruit info
* Rock count

Allow checklist tracking.

---

## MODULE 10 — Weather Seed Tool

Claude must:

1. Study logic of:
   https://wuffs.org/acnh/weather/
2. Recreate seed prediction logic.
3. Build UI for pattern matching.

Credit original source.

---

## MODULE 11 — Island Designer

Two phases:

### Phase A:

Recreate 2D grid planner:

* Terrain editing
* Water tools
* Path tools
* Building placement
* Toggleable grid overlay

### Phase B:

Three.js preview mode:

* Generate terrain mesh
* Render water
* Render elevation
* Place structures
* Simple lighting

Performance must remain smooth on mid-tier hardware.

---

# PHASE 5 — NAVIGATION REFINEMENT

Claude must:

* Evaluate UX
* Possibly consolidate tabs
* Ensure intuitive desktop layout
* Make sidebar modular
* Ensure accessibility

---

# PHASE 6 — SETTINGS & CREDITS

Settings:

* Timezone
* Hemisphere
* Data reset
* Theme toggle (light/dark seasonal)

Credits:

* Data sources
* Algorithms used
* Icon sources
* Open-source libraries
* External logic integrations

Must be thorough and visible.

---

# PERFORMANCE REQUIREMENTS

* Initial load under 3 seconds (excluding asset images)
* No blocking rendering during indexing
* Debounced search
* Virtualized lists for large collections
* Code splitting for heavy modules (Island Designer)

---

# QUALITY CONTROL

Before finishing, Claude must:

* Verify dataset completeness
* Confirm no hardcoded bulk lists
* Confirm all modules are isolated
* Confirm no emojis used
* Confirm credits included
* Confirm persistent state works
* Confirm no console errors

---

# DEVELOPMENT STRATEGY

Claude must work sequentially:

1. Architecture
2. Data layer
3. UI foundation
4. Modules (in order)
5. Navigation refinement
6. Settings & credits
7. Final optimization pass

No skipping phases.

---

# FINAL GOAL

Your Horizon should feel like:

* A professional ACNH companion
* Highly performant
* Visually authentic
* Modular and expandable
* The definitive all-in-one desktop ACNH tool

Claude must prioritize structure, correctness, and scalability over speed.

---

END OF SPECIFICATION
