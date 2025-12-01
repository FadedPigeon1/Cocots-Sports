"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        username: formData.get("username") as string,
        full_name: formData.get("full_name") as string,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: {
  username?: string
  full_name?: string
  avatar_url?: string
  favorite_team_id?: number
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/profile")
  return data
}

export async function addFavoriteTeam(userId: string, teamId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("user_favorites")
    .insert({
      user_id: userId,
      team_id: teamId,
    })

  if (error) throw error

  revalidatePath("/favorites")
}

export async function removeFavoriteTeam(userId: string, teamId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("team_id", teamId)

  if (error) throw error

  revalidatePath("/favorites")
}

export async function getUserFavorites(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_favorites")
    .select(`
      *,
      team:teams(*),
      player:players(*)
    `)
    .eq("user_id", userId)

  if (error) throw error
  return data
}
