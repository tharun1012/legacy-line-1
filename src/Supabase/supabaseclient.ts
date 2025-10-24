import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mowugexywvklirxwzpdh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vd3VnZXh5d3ZrbGlyeHd6cGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTYzOTEsImV4cCI6MjA3NDg3MjM5MX0.eJnBHRcnZ-3MPw9HYgGPXSfuAT_QnuarmOI2ogaCQeg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);