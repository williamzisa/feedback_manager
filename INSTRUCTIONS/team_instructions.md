# Team Management Overview

This guide provides a comprehensive overview of the team management functionality within the admin frontend, implemented using Next.js 14, TypeScript, and Supabase. The team management feature is designed to handle the creation, editing, and display of team data, leveraging a modular and component-based architecture.

## Key Components and Logic

### TeamsPage
The `TeamsPage` serves as the main entry point for managing teams. It utilizes `React Query` to fetch team data from Supabase and displays statistics using the `StatCard` component. The page structure includes a header, a statistics section, and a view for teams.

### Team Dialogs
- **CreateTeamDialog**: Provides a dialog interface for creating new teams. It captures team details through a form and interacts with Supabase via the `queries.teams.create` function.
- **EditTeamDialog**: Allows editing of existing teams. Similar to the create dialog, it uses a form to update team data using `queries.teams.update`.

### TeamsView and TeamsTable
- **TeamsView**: Offers a search interface and displays teams in a table format. It includes functionality to open the `CreateTeamDialog` and filter teams based on user input.
- **TeamsTable**: Renders a table of teams, enabling users to initiate edits via the `EditTeamDialog`.

### TeamForm and Schema
- **TeamForm**: Utilizes `react-hook-form` with `zodResolver` for form validation. It supports both creation and editing modes and integrates with Supabase to fetch data for leader and cluster selection.
- **TeamSchema**: Defined using `zod`, it ensures data integrity by enforcing validation rules for team fields.

## Data Types and Queries
- **Team Interface**: Outlines the structure of team data, including fields like `id`, `name`, `clusterId`, `leaderId`, and membership details.
- **Supabase Queries**: The `queries` object contains methods for interacting with the Supabase database, such as fetching, creating, updating, and deleting teams.

## Implementation Guidelines
- **Data Fetching**: Leverage `React Query` for efficient data fetching and caching.
- **Dialogs and Forms**: Implement create and edit dialogs using the `Dialog` component from the UI library. Use forms for data entry, ensuring validation and error handling.
- **Styling**: Apply Tailwind CSS for consistent styling across components.
- **Component Architecture**: Follow a modular approach with a clear separation of concerns, optimizing for React Server Components.

This guide serves as a reference for understanding and extending the team management functionality within the admin frontend, ensuring consistency and scalability across the application.
