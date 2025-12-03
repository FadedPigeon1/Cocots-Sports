import { createClient } from './client'

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signUp({ email, password })
}

export async function signOut() {
  const supabase = createClient()
  return await supabase.auth.signOut()
}
