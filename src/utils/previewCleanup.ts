import { supabase } from "@/integrations/supabase/client";

const MAX_RETRIES = 3;
const RETRY_DELAY = 200; // ms

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retry = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await sleep(RETRY_DELAY);
      return retry(operation, retries - 1);
    }
    throw error;
  }
};

// PREVIEW ONLY - Remove this file before production deployment
export const cleanupUserData = async (userId: string) => {
  if (!userId) return;
  
  try {
    // Delete booking_addons first (they reference booking_rooms)
    await retry(async () => {
      const { data: bookings } = await supabase
        .from('service_bookings')
        .select('id')
        .eq('user_id', userId);

      if (bookings) {
        for (const booking of bookings) {
          const { data: rooms } = await supabase
            .from('booking_rooms')
            .select('id')
            .eq('booking_id', booking.id);
            
          if (rooms) {
            for (const room of rooms) {
              await supabase
                .from('booking_addons')
                .delete()
                .eq('booking_room_id', room.id);
            }
          }
        }
      }
    });

    // Delete booking_rooms
    await retry(async () => {
      const { data: bookings } = await supabase
        .from('service_bookings')
        .select('id')
        .eq('user_id', userId);

      if (bookings) {
        for (const booking of bookings) {
          await supabase
            .from('booking_rooms')
            .delete()
            .eq('booking_id', booking.id);
        }
      }
    });

    // Delete service_bookings
    await retry(async () => {
      await supabase
        .from('service_bookings')
        .delete()
        .eq('user_id', userId);
    });

    // Delete service preferences
    await retry(async () => {
      await supabase
        .from('service_preferences')
        .delete()
        .eq('user_id', userId);
    });

    // Delete properties
    await retry(async () => {
      await supabase
        .from('properties')
        .delete()
        .eq('user_id', userId);
    });

    // Delete user profile
    await retry(async () => {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
    });

    // Sign out
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('Preview cleanup error:', error);
    // Ensure we at least sign out the user even if cleanup fails
    await supabase.auth.signOut();
  }
};