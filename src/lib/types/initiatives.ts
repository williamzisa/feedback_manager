import { Database } from "../supabase/database.types";

export type InitiativeType = "SOFT" | "STRATEGY" | "EXECUTION";

export type Initiative = Database["public"]["Tables"]["initiatives"]["Row"] & {
  question?: {
    id: string;
    description: string;
    type: InitiativeType;
  };
  user?: {
    id: string;
    name: string;
    surname: string;
  };
};

export type InitiativeInsert = Database["public"]["Tables"]["initiatives"]["Insert"];

export type InitiativeUpdate = Database["public"]["Tables"]["initiatives"]["Update"]; 