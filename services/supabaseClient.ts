import { createClient } from '@supabase/supabase-js';

// TODO: REPLACE THESE WITH YOUR ACTUAL SUPABASE PROJECT CREDENTIALS
// You can find these in your Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://bsoycjudezjsclrlfcnt.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzb3ljanVkZXpqc2NscmxmY250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODQ4NTQsImV4cCI6MjA4NTI2MDg1NH0.TItSukFXfUA1YTkHRpU0Cb8Mv2Om4_sWoH66rCNH4v0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check if DB is connected
export const isDbConnected = () => {
  // Returns true if the URL looks like a valid Supabase URL
  return !!SUPABASE_URL && SUPABASE_URL.includes('supabase.co');
};