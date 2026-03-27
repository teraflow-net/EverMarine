import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const PROJECT_ID = 'evermarine'

export type ReviewComment = {
  id: string
  project_id: string
  page_url: string
  x_percent: number
  y_percent: number
  content: string
  status: 'open' | 'in_progress' | 'resolved'
  author_name: string
  image_url: string | null
  github_issue_number: number | null
  created_at: string
  resolved_at: string | null
}
