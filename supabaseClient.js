import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://tzdogfvislvfiyepjpid.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZG9nZnZpc2x2Zml5ZXBqcGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjU3NTYsImV4cCI6MjA2OTA0MTc1Nn0.Pxz56EZFXrKSCuMc7Q76RMiDXV95OBiSvz0aY2Bb3NQ";

export const supabase = createClient(supabaseUrl, supabaseKey);