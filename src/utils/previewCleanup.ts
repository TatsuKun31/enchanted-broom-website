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
      console.log(`Operation failed, retrying... (${retries} attempts left)`);
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
    console.log('Starting preview cleanup...');
    
    // First, get all service bookings for the user with retry logic
    const { data: bookings, error: bookingsError } = await retry(async () => 
      await supabase
        .from('service_bookings')
        .select('id')
        .eq('user_id', userId)
    );

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return;
    }

    if (bookings) {
      console.log(`Found ${bookings.length} bookings to clean up`);
      
      // Delete booking_addons first (they reference booking_rooms)
      for (const booking of bookings) {
        const { data: rooms, error: roomsError } = await retry(async () =>
          await supabase
            .from('booking_rooms')
            .select('id')
            .eq('booking_id', booking.id)
        );
          
        if (roomsError) {
          console.error('Error fetching rooms:', roomsError);
          continue;
        }

        if (rooms) {
          console.log(`Found ${rooms.length} rooms to clean up for booking ${booking.id}`);
          
          for (const room of rooms) {
            const { error: addonsError } = await retry(async () =>
              await supabase
                .from('booking_addons')
                .delete()
                .eq('booking_room_id', room.id)
            );

            if (addonsError) {
              console.error('Error deleting addons:', addonsError);
            }
          }
        }
      }

      // Then delete booking_rooms
      for (const booking of bookings) {
        const { error: roomsDeleteError } = await retry(async () =>
          await supabase
            .from('booking_rooms')
            .delete()
            .eq('booking_id', booking.id)
        );

        if (roomsDeleteError) {
          console.error('Error deleting rooms:', roomsDeleteError);
        }
      }
    }

    // Now we can safely delete service_bookings
    const { error: bookingsDeleteError } = await retry(async () =>
      await supabase
        .from('service_bookings')
        .delete()
        .eq('user_id', userId)
    );

    if (bookingsDeleteError) {
      console.error('Error deleting bookings:', bookingsDeleteError);
    }

    // Delete service preferences
    const { error: preferencesError } = await retry(async () =>
      await supabase
        .from('service_preferences')
        .delete()
        .eq('user_id', userId)
    );

    if (preferencesError) {
      console.error('Error deleting preferences:', preferencesError);
    }

    // Delete properties
    const { error: propertiesError } = await retry(async () =>
      await supabase
        .from('properties')
        .delete()
        .eq('user_id', userId)
    );

    if (propertiesError) {
      console.error('Error deleting properties:', propertiesError);
    }

    // Delete user profile
    const { error: profileError } = await retry(async () =>
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
    );

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // Sign out and delete the user
    try {
      await retry(async () => {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
        if (deleteError) throw deleteError;
      });
    } catch (error) {
      console.error('Error with user deletion:', error);
      // Fallback to just signing out if deletion fails
      await supabase.auth.signOut();
    }
    
    console.log('Preview cleanup completed successfully');
  } catch (error) {
    console.error('Preview cleanup error:', error);
    // Ensure we at least sign out the user even if cleanup fails
    await supabase.auth.signOut();
  }
};