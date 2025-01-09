import { supabase } from "@/integrations/supabase/client";

// PREVIEW ONLY - Remove this file before production deployment
export const cleanupUserData = async (userId: string) => {
  if (!userId) return;
  
  try {
    console.log('Starting preview cleanup...');
    
    // First, get all service bookings for the user
    const { data: bookings, error: bookingsError } = await supabase
      .from('service_bookings')
      .select('id')
      .eq('user_id', userId);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return;
    }

    if (bookings) {
      // Delete booking_addons first (they reference booking_rooms)
      for (const booking of bookings) {
        const { data: rooms, error: roomsError } = await supabase
          .from('booking_rooms')
          .select('id')
          .eq('booking_id', booking.id);
          
        if (roomsError) {
          console.error('Error fetching rooms:', roomsError);
          continue;
        }

        if (rooms) {
          for (const room of rooms) {
            const { error: addonsError } = await supabase
              .from('booking_addons')
              .delete()
              .eq('booking_room_id', room.id);

            if (addonsError) {
              console.error('Error deleting addons:', addonsError);
            }
          }
        }
      }

      // Then delete booking_rooms
      for (const booking of bookings) {
        const { error: roomsDeleteError } = await supabase
          .from('booking_rooms')
          .delete()
          .eq('booking_id', booking.id);

        if (roomsDeleteError) {
          console.error('Error deleting rooms:', roomsDeleteError);
        }
      }
    }

    // Now we can safely delete service_bookings
    const { error: bookingsDeleteError } = await supabase
      .from('service_bookings')
      .delete()
      .eq('user_id', userId);

    if (bookingsDeleteError) {
      console.error('Error deleting bookings:', bookingsDeleteError);
    }

    // Delete service preferences
    const { error: preferencesError } = await supabase
      .from('service_preferences')
      .delete()
      .eq('user_id', userId);

    if (preferencesError) {
      console.error('Error deleting preferences:', preferencesError);
    }

    // Delete properties
    const { error: propertiesError } = await supabase
      .from('properties')
      .delete()
      .eq('user_id', userId);

    if (propertiesError) {
      console.error('Error deleting properties:', propertiesError);
    }

    // Delete user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // Sign out and delete the user
    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error('Error deleting user:', deleteError);
      }
    } catch (error) {
      console.error('Error with user deletion:', error);
      // Fallback to just signing out if deletion fails
      await supabase.auth.signOut();
    }
    
    console.log('Preview cleanup completed');
  } catch (error) {
    console.error('Preview cleanup error:', error);
  }
};