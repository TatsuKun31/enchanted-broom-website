import { supabase } from "@/integrations/supabase/client";
import { PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";

// Utility function for delayed retry
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic retry wrapper for database operations
async function retryOperation<T>(
  operation: () => Promise<PostgrestResponse<T>>,
  maxRetries = 3,
  delay = 1000
): Promise<PostgrestResponse<T>> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await operation();
      if (result.error) throw result.error;
      return result;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await wait(delay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError;
}

// Delete booking addons for a specific booking
async function deleteBookingAddons(bookingRoomId: string) {
  return await supabase
    .from('booking_addons')
    .delete()
    .eq('booking_room_id', bookingRoomId);
}

// Delete booking rooms for a specific booking
async function deleteBookingRooms(bookingId: string) {
  return await supabase
    .from('booking_rooms')
    .delete()
    .eq('booking_id', bookingId);
}

// Delete service bookings for a user
async function deleteServiceBookings(userId: string) {
  return await supabase
    .from('service_bookings')
    .delete()
    .eq('user_id', userId);
}

// Delete service preferences for a user
async function deleteServicePreferences(userId: string) {
  return await supabase
    .from('service_preferences')
    .delete()
    .eq('user_id', userId);
}

// Delete properties for a user
async function deleteProperties(userId: string) {
  return await supabase
    .from('properties')
    .delete()
    .eq('user_id', userId);
}

// Delete user profile
async function deleteProfile(userId: string) {
  return await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
}

// Main cleanup function
export async function cleanupUserData(userId: string) {
  if (!userId) return;

  try {
    // Get all bookings for the user
    const { data: bookings } = await supabase
      .from('service_bookings')
      .select('id')
      .eq('user_id', userId);

    if (bookings) {
      // Delete all booking related data
      for (const booking of bookings) {
        const { data: rooms } = await supabase
          .from('booking_rooms')
          .select('id')
          .eq('booking_id', booking.id);

        if (rooms) {
          for (const room of rooms) {
            await deleteBookingAddons(room.id);
          }
        }

        await deleteBookingRooms(booking.id);
      }
    }

    // Delete user data in correct order
    await deleteServiceBookings(userId);
    await deleteServicePreferences(userId);
    await deleteProperties(userId);
    await deleteProfile(userId);

    // Clear any stored session data
    await supabase.auth.signOut({ scope: 'local' });
    localStorage.clear();
    sessionStorage.clear();

  } catch (error) {
    console.error('Preview cleanup error:', error);
    throw error;
  }
}