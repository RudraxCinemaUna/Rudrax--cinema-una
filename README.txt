RUDRAX CINEMA - FIXED BOOKING SYSTEM

index.html now uses the shared booking key rudraxCinemaBookingsV1.

A booking is locked by:
Movie + Date + Show Time + Seat.

Example:
18/08/2026 + 09:00 PM - 12:00 AM + C1 + C2
=> C1 and C2 become grey and disabled for that exact show.

This version uses localStorage, so admin.html and index.html must be opened
from the same browser/site origin to share bookings. For different phones or
devices, connect both pages to a hosted database such as Firebase/Supabase.
