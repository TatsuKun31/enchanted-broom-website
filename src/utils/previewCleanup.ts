import { supabase } from "@/integrations/supabase/client";
import { PostgrestFilterBuilder, PostgrestSingleResponse } from "@supabase/supabase-js";

// Utility function for delayed retry
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic retry wrapper for database operations
async function retryOperation<T>(
  operation: () => PostgrestFilterBuilder<T>,
  maxRetries = 3,
  delay = 1000
): Promise<PostgrestSingleResponse<T>> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await operation();
      return result as PostgrestSingleResponse<T>;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await wait(delay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError;
}

// Delete booking addons for a specific booking room
async function deleteBookingAddons(bookingRoomId: string) {
  return retryOperation(() =>
    supabase
      .from('booking_addons')
      .delete()
      .eq('booking_room_id', bookingRoomId)
      .single()
  );
}

// Delete booking rooms for a specific booking
async function deleteBookingRooms(bookingId: string) {
  const { data: rooms } = await supabase
    .from('booking_rooms')
    .select('id')
    .eq('booking_id', bookingId);

  if (rooms) {
    for (const room of rooms) {
      await deleteBookingAddons(room.id);
    }
  }

  return retryOperation(() =>
    supabase
      .from('booking_rooms')
      .delete()
      .eq('booking_id', bookingId)
      .single()
  );
}

// Delete all service bookings for a user
async function deleteServiceBookings(userId: string) {
  const { data: bookings } = await supabase
    .from('service_bookings')
    .select('id')
    .eq('user_id', userId);

  if (bookings) {
    for (const booking of bookings) {
      await deleteBookingRooms(booking.id);
    }
  }

  return retryOperation(() =>
    supabase
      .from('service_bookings')
      .delete()
      .eq('user_id', userId)
      .single()
  );
}

// Delete service preferences for a user
async function deleteServicePreferences(userId: string) {
  return retryOperation(() =>
    supabase
      .from('service_preferences')
      .delete()
      .eq('user_id', userId)
      .single()
  );
}

// Delete properties for a user
async function deleteProperties(userId: string) {
  return retryOperation(() =>
    supabase
      .from('properties')
      .delete()
      .eq('user_id', userId)
      .single()
  );
}

// Delete user profile
async function deleteProfile(userId: string) {
  return retryOperation(() =>
    supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
      .single()
  );
}

// Sign out user completely
async function signOutCompletely() {
  try {
    const { error } = await supabase.auth.signOut({
      scope: 'global'  // This ensures complete sign out across all tabs/windows
    });
    if (error) throw error;
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any session cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Main cleanup function
export async function cleanupUserData(userId: string) {
  if (!userId) return;

  try {
    // Delete in correct order to respect foreign key constraints
    await deleteServiceBookings(userId);
    await deleteServicePreferences(userId);
    await deleteProperties(userId);
    await deleteProfile(userId);

    // Complete sign out
    await signOutCompletely();

  } catch (error) {
    console.error('Preview cleanup error:', error);
    throw error;
  }
}