import { supabase } from "@/integrations/supabase/client";
import { PostgrestBuilder, PostgrestSingleResponse } from "@supabase/postgrest-js";

// Utility function for delayed retry
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic retry wrapper for database operations
async function retryOperation<T>(
  operation: () => PostgrestBuilder<T>,
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

// Verify no bookings exist for user
async function verifyNoBookings(userId: string): Promise<boolean> {
  try {
    // Check for any remaining bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('service_bookings')
      .select('id')
      .eq('user_id', userId);

    if (bookingsError) {
      console.error('Error verifying bookings cleanup:', bookingsError);
      return false;
    }

    // Check for any remaining booking rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('booking_rooms')
      .select('id')
      .eq('booking_id', bookings?.map(b => b.id) || []);

    if (roomsError) {
      console.error('Error verifying rooms cleanup:', roomsError);
      return false;
    }

    // Check for any remaining addons
    const { data: addons, error: addonsError } = await supabase
      .from('booking_addons')
      .select('id')
      .eq('booking_room_id', rooms?.map(r => r.id) || []);

    if (addonsError) {
      console.error('Error verifying addons cleanup:', addonsError);
      return false;
    }

    // Return true only if no bookings, rooms, or addons were found
    return !bookings?.length && !rooms?.length && !addons?.length;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
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

// Sign out user completely and clear all local data
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

    // Verify all bookings are deleted
    const isCleanupComplete = await verifyNoBookings(userId);
    if (!isCleanupComplete) {
      console.error('Warning: Some booking data may still exist after cleanup');
      // Attempt cleanup one more time if verification failed
      await deleteServiceBookings(userId);
    }

    // Complete sign out and clear all local data
    await signOutCompletely();

  } catch (error) {
    console.error('Preview cleanup error:', error);
    throw error;
  }
}