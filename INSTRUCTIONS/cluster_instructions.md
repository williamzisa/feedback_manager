# Cluster Management Overview

This guide provides a comprehensive overview of the cluster management functionality within the admin frontend, implemented using Next.js 14, TypeScript, and Supabase. The cluster management feature is designed to handle the creation, editing, and display of cluster data, leveraging a modular and component-based architecture.

## Key Components and Logic

### ClustersPage
The `ClustersPage` serves as the main entry point for managing clusters. It utilizes `React Query` to fetch cluster data from Supabase and displays statistics using the `StatCard` component. The page structure includes a header, a statistics section, and a view for clusters.

### Cluster Dialogs
- **CreateClusterDialog**: Provides a dialog interface for creating new clusters. It captures cluster details through a form and interacts with Supabase via the `queries.clusters.create` function.
- **EditClusterDialog**: Allows editing of existing clusters. Similar to the create dialog, it uses a form to update cluster data using `queries.clusters.update`.

### ClustersView and ClustersTable
- **ClustersView**: Offers a search interface and displays clusters in a table format. It includes functionality to open the `CreateClusterDialog` and filter clusters based on user input.
- **ClustersTable**: Renders a table of clusters, enabling users to initiate edits via the `EditClusterDialog`.

### ClusterForm and Schema
- **ClusterForm**: Utilizes `react-hook-form` with `zodResolver` for form validation. It supports both creation and editing modes and integrates with Supabase to fetch user data for leader selection.
- **ClusterSchema**: Defined using `zod`, it ensures data integrity by enforcing validation rules for cluster fields.

## Data Types and Queries
- **Cluster Interface**: Outlines the structure of cluster data, including fields like `id`, `name`, `level`, `leader`, and `team_count`.
- **Supabase Queries**: The `queries` object contains methods for interacting with the Supabase database, such as fetching, creating, updating, and deleting clusters.

## Implementation Guidelines
- **Data Fetching**: Leverage `React Query` for efficient data fetching and caching.
- **Dialogs and Forms**: Implement create and edit dialogs using the `Dialog` component from the UI library. Use forms for data entry, ensuring validation and error handling.
- **Styling**: Apply Tailwind CSS for consistent styling across components.
- **Component Architecture**: Follow a modular approach with a clear separation of concerns, optimizing for React Server Components.

This guide serves as a reference for understanding and extending the cluster management functionality within the admin frontend, ensuring consistency and scalability across the application.