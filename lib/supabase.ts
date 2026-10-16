import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://fsgtqraeluphacvikeus.supabase.co'
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZ3RxcmFlbHVwaGFjdmlrZXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMjg0NzksImV4cCI6MjEwNzcwNDQ3OX0.2vtSyqTdHfr0LemkpMCYzuJfIMJFcT9WE249f0lwRXU'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseUrl = envUrl && !envUrl.includes('placeholder') ? envUrl : DEFAULT_SUPABASE_URL
const supabaseAnonKey = envKey && !envKey.includes('placeholder') ? envKey : DEFAULT_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
