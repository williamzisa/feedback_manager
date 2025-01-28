# Current Directory Structure

## Core Components

\\\
|-- INSTRUCTIONS
|   |-- cluster_instructions.md
|   |-- comandi_utili.txt
|   |-- db_structure
|   |-- directory_structure.md
|   |-- memberships_instructions.md
|   |-- questions_instructions.md
|   |-- team_instructions.md
|   -- update_directory.ps1
|-- public
|   |-- file.svg
|   |-- globe.svg
|   |-- next.svg
|   |-- vercel.svg
|   -- window.svg
|-- src
|   |-- app
|   |   |-- (auth)
|   |   |   -- login
|   |   |       -- page.tsx
|   |   |-- (routes)
|   |   |   -- admin
|   |   |       |-- clusters
|   |   |       |   -- page.tsx
|   |   |       |-- feedback-management
|   |   |       |   -- page.tsx
|   |   |       |-- levels
|   |   |       |   -- page.tsx
|   |   |       |-- memberships
|   |   |       |   -- page.tsx
|   |   |       |-- pre-session-analysis
|   |   |       |   -- page.tsx
|   |   |       |-- processes
|   |   |       |   -- page.tsx
|   |   |       |-- questions
|   |   |       |   -- page.tsx
|   |   |       |-- rules
|   |   |       |   -- page.tsx
|   |   |       |-- session-results
|   |   |       |   -- page.tsx
|   |   |       |-- sessions
|   |   |       |   -- page.tsx
|   |   |       |-- teams
|   |   |       |   -- page.tsx
|   |   |       |-- users
|   |   |       |   -- page.tsx
|   |   |       |-- layout.tsx
|   |   |       -- page.tsx
|   |   |-- @admin
|   |   |   |-- clusters
|   |   |   |   -- components
|   |   |   |       |-- dialogs
|   |   |   |       |   |-- create-cluster-dialog.tsx
|   |   |   |       |   -- edit-cluster-dialog.tsx
|   |   |   |       |-- forms
|   |   |   |       |   |-- cluster-form.tsx
|   |   |   |       |   -- cluster-schema.ts
|   |   |   |       |-- clusters-table.tsx
|   |   |   |       -- clusters-view.tsx
|   |   |   |-- feedback-management
|   |   |   |   -- components
|   |   |   |       -- feedback-management-view.tsx
|   |   |   |-- levels
|   |   |   |   -- components
|   |   |   |       |-- dialogs
|   |   |   |       |   |-- create-level-dialog.tsx
|   |   |   |       |   -- edit-level-dialog.tsx
|   |   |   |       |-- forms
|   |   |   |       |   -- level-form.tsx
|   |   |   |       |-- levels-table.tsx
|   |   |   |       -- levels-view.tsx
|   |   |   |-- memberships
|   |   |   |   -- components
|   |   |   |       |-- dialogs
|   |   |   |       |   |-- create-membership-dialog.tsx
|   |   |   |       |   -- edit-membership-dialog.tsx
|   |   |   |       |-- forms
|   |   |   |       |   |-- membership-form.tsx
|   |   |   |       |   -- membership-schema.ts
|   |   |   |       |-- memberships-table.tsx
|   |   |   |       -- memberships-view.tsx
|   |   |   |-- pre-session-analysis
|   |   |   |   -- components
|   |   |   |       |-- dialogs
|   |   |   |       |   -- generate-feedback-dialog.tsx
|   |   |   |       |-- pre-session-analysis-view.tsx
|   |   |   |       -- pre-session-feedbacks-table.tsx
|   |   |   |-- processes
|   |   |   |   -- components
|   |   |   |       |-- dialogs
|   |   |   |       |   |-- create-process-dialog.tsx
|   |   |   |       |   -- edit-process-dialog.tsx
|   |   |   |       |-- forms
|   |   |   |       |   -- process-form.tsx
|   |   |   |       |-- processes-table.tsx
|   |   |   |       -- processes-view.tsx
|   |   |   |-- questions
|   |   |   |   -- components
|   |   |   |       |-- dialogs
|   |   |   |       |   |-- create-question-dialog.tsx
|   |   |   |       |   -- edit-question-dialog.tsx
|   |   |   |       |-- forms
|   |   |   |       |   |-- question-form.tsx
|   |   |   |       |   -- question-schema.ts
|   |   |   |       |-- questions-table.tsx
|   |   |   |       -- questions-view.tsx
|   |   |   |-- rules
|   |   |   |   -- components
|   |   |   |       |-- dialogs
|   |   |   |       |   |-- create-rule-dialog.tsx
|   |   |   |       |   -- edit-rule-dialog.tsx
|   |   |   |       |-- forms
|   |   |   |       |   |-- rule-form.tsx
|   |   |   |       |   -- rule-schema.ts
|   |   |   |       |-- rules-table.tsx
|   |   |   |       -- rules-view.tsx
|   |   |   |-- session-results
|   |   |   |   -- components
|   |   |   |       |-- session-results-table.tsx
|   |   |   |       -- session-results-view.tsx
|   |   |   |-- sessions
|   |   |   |   -- components
|   |   |   |       |-- dialogs
|   |   |   |       |   |-- create-session-dialog.tsx
|   |   |   |       |   -- edit-session-dialog.tsx
|   |   |   |       |-- forms
|   |   |   |       |   -- session-form.tsx
|   |   |   |       |-- sessions-table.tsx
|   |   |   |       -- sessions-view.tsx
|   |   |   |-- teams
|   |   |   |   -- components
|   |   |   |       |-- dialogs
|   |   |   |       |   |-- create-team-dialog.tsx
|   |   |   |       |   -- edit-team-dialog.tsx
|   |   |   |       |-- forms
|   |   |   |       |   |-- team-form.tsx
|   |   |   |       |   -- team-schema.ts
|   |   |   |       |-- teams-table.tsx
|   |   |   |       -- teams-view.tsx
|   |   |   |-- users
|   |   |   |   -- components
|   |   |   |       |-- dialogs
|   |   |   |       |   |-- create-user-dialog.tsx
|   |   |   |       |   -- edit-user-dialog.tsx
|   |   |   |       |-- forms
|   |   |   |       |   |-- user-form.tsx
|   |   |   |       |   -- user-schema.ts
|   |   |   |       |-- users-table.tsx
|   |   |   |       -- users-view.tsx
|   |   |   -- default.tsx
|   |   |-- people
|   |   |   -- page.tsx
|   |   |-- profile
|   |   |   -- page.tsx
|   |   |-- session
|   |   |   |-- [id]

|   |   |   -- page.tsx
|   |   |-- session_results
|   |   |   |-- comment
|   |   |   |   -- page.tsx
|   |   |   |-- feedback
|   |   |   |   -- page.tsx
|   |   |   -- page.tsx
|   |   |-- favicon.ico
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   -- page.tsx
|   |-- components
|   |   |-- layout
|   |   |   -- admin-header.tsx
|   |   |-- navigation
|   |   |   |-- bottom-nav.tsx
|   |   |   |-- header.tsx
|   |   |   -- user-menu.tsx
|   |   |-- stats
|   |   |   -- stat-card.tsx
|   |   -- ui
|   |       |-- badge.tsx
|   |       |-- button.tsx
|   |       |-- calendar.tsx
|   |       |-- card.tsx
|   |       |-- checkbox.tsx
|   |       |-- command.tsx
|   |       |-- dialog.tsx
|   |       |-- dropdown-menu.tsx
|   |       |-- form.tsx
|   |       |-- input.tsx
|   |       |-- label.tsx
|   |       |-- multi-select.tsx
|   |       |-- popover.tsx
|   |       |-- select.tsx
|   |       |-- sheet.tsx
|   |       |-- skeleton.tsx
|   |       |-- table.tsx
|   |       |-- tabs.tsx
|   |       -- tooltip.tsx
|   |-- lib
|   |   |-- data
|   |   |   -- mock-people.ts
|   |   |-- supabase
|   |   |   |-- client.ts
|   |   |   |-- config.ts
|   |   |   |-- database.types.ts
|   |   |   |-- queries.ts
|   |   |   |-- schema.sql
|   |   |   -- server.ts
|   |   |-- types
|   |   |   |-- clusters.ts
|   |   |   |-- feedbacks.ts
|   |   |   |-- levels.ts
|   |   |   |-- memberships.ts
|   |   |   |-- processes.ts
|   |   |   |-- questions.ts
|   |   |   |-- rules.ts
|   |   |   |-- sessions.ts
|   |   |   |-- teams.ts
|   |   |   -- users.ts
|   |   -- utils.ts
|   -- middleware.ts
|-- .cursorignore
|-- .cursorrules
|-- .env.local
|-- .gitignore
|-- components.json
|-- eslint.config.mjs
|-- next-env.d.ts
|-- next.config.ts
|-- package-lock.json
|-- package.json
|-- postcss.config.mjs
|-- README.md
|-- tailwind.config.ts
-- tsconfig.json
\\\

