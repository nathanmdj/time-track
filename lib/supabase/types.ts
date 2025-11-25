export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          email: string | null
          hourly_rate: number
          pay_cycle_interval: 'weekly' | 'biweekly' | 'monthly' | null
          pay_cycle_start_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          hourly_rate: number
          pay_cycle_interval?: 'weekly' | 'biweekly' | 'monthly' | null
          pay_cycle_start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          hourly_rate?: number
          pay_cycle_interval?: 'weekly' | 'biweekly' | 'monthly' | null
          pay_cycle_start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          id: string
          client_id: string
          description: string | null
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          description?: string | null
          start_time: string
          end_time?: string | null
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          description?: string | null
          start_time?: string
          end_time?: string | null
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Client = Database["public"]["Tables"]["clients"]["Row"]
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"]
export type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"]

export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"]
export type TimeEntryInsert = Database["public"]["Tables"]["time_entries"]["Insert"]
export type TimeEntryUpdate = Database["public"]["Tables"]["time_entries"]["Update"]

export type TimeEntryWithClient = TimeEntry & {
  clients: Client
}

export type PayCycleInterval = 'weekly' | 'biweekly' | 'monthly'
