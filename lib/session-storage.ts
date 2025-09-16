// Database-based stack operations using PostgreSQL
// Replaces the old in-memory storage system

import { queryDb } from "@/lib/db-connection";

// Helper function to get stack data from database
export const getStackData = async (slug: string) => {
  const query = `SELECT * FROM stacks WHERE slug = $1`;
  const { data, error } = await queryDb(query, [slug]);
  
  if (error || !data || data.length === 0) {
    console.error(`Stack not found for slug: ${slug}`, error);
    return null;
  }
  
  return data[0];
};

// Get all available stacks
export const getAllStacks = async () => {
  const query = `SELECT * FROM stacks ORDER BY created_at DESC`;
  const { data, error } = await queryDb(query, []);
  
  if (error) {
    console.error(`Error fetching stacks:`, error);
    return [];
  }
  
  return data || [];
};