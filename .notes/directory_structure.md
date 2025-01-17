# Current Directory Structure

## Core Components

\\\
public/{file.svg, globe.svg, next.svg, vercel.svg, window.svg}
src/{
app/{
(routes)/{
admin/{clusters/{page.tsx}, levels/{page.tsx}, memberships/{page.tsx}
processes/{page.tsx}, questions/{page.tsx}, rules/{page.tsx}
sessions/{page.tsx}, teams/{page.tsx}, users/{page.tsx}, layout.tsx, page.tsx}}
favicon.ico, globals.css, layout.tsx, page.tsx}
components/{
clusters/{dialogs/{create-cluster-dialog.tsx, edit-cluster-dialog.tsx}
forms/{cluster-form.tsx, cluster-schema.ts}, clusters-table.tsx
clusters-view.tsx}
layout/{admin-header.tsx}, levels/{levels-table.tsx, levels-view.tsx}
memberships/{memberships-table.tsx, memberships-view.tsx}
processes/{processes-table.tsx}, questions/{questions-table.tsx}
rules/{rules-table.tsx}, sessions/{sessions-table.tsx}, stats/{stat-card.tsx}
teams/{dialogs/{create-team-dialog.tsx, edit-team-dialog.tsx}
forms/{team-form.tsx, team-schema.ts}, teams-table.tsx, teams-view.tsx}
ui/{button.tsx, checkbox.tsx, dialog.tsx, form.tsx, input.tsx, label.tsx, select.tsx
sheet.tsx, table.tsx, tabs.tsx}
users/{users-table.tsx}}
hooks/{}
lib/{supabase/{config.ts, database.types.ts, queries.ts}
types/{clusters.ts, teams.ts}, utils.ts}}
.env.local, .gitignore, .windsurfrules, comandi_utili.txt, components.json
eslint.config.mjs, middleware.ts, next-env.d.ts, next.config.ts
package-lock.json, package.json, postcss.config.mjs, README.md
tailwind.config.ts, tsconfig.json, update_directory.ps1
\\\
