import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
import * as schema from './schema';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

// Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database client for Drizzle ORM
const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });

// Export schema for use in other parts of the application
export * from './schema';
