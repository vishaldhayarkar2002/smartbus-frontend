# Verdict on Gemini's normalization review + ERD update

Gemini's analysis is **mostly correct** — 5 of its 6 points are real issues in our ERD and worth adopting. One point is a judgement call, and Gemini's own "corrected" schema has one gap (it mentions a REVIEWS table but never includes it).

## Point-by-point verdict

1. **rating / total_reviews on SCHEDULES — correct.** Ratings come from passenger reviews, not the schedule itself. Remove both columns; add a REVIEWS table (user_id, schedule_id, rating, comment, created_at) and aggregate at query time.
2. **duration on SCHEDULES — correct.** It is derivable (arrival − departure). Drop it from SCHEDULES. Keep `estimated_duration` on ROUTES — that one is genuine route metadata, not derived.
3. **seat_number on BOOKING_PASSENGERS — judgement call.** Gemini is right that it duplicates SEATS, but keeping it is a deliberate historical snapshot: an e-ticket must still show the original seat number even if the bus layout is edited later. Keep it, documented as intentional denormalization.
4. **payment_method on BOOKINGS — correct.** It can disagree with PAYMENTS when a first attempt fails and a retry uses another method. Remove it from BOOKINGS; the method comes from the successful PAYMENTS row. Also change PAYMENTS.success (boolean) to a status enum (INITIATED, SUCCESS, FAILED) as Gemini suggests.
5. **STOP_POINTS linked to schedule_id — correct, real improvement.** The same Pune–Mumbai stops would be duplicated for every daily schedule. Replace with ROUTE_STOPS (route_id, stop_name, type BOARDING/DROPPING, stop_order, offset_minutes, landmark); a stop's time on a given schedule = departure_time + offset_minutes.
6. **SEAT_LOCKS missing unique constraint — correct.** Add UNIQUE(schedule_id, seat_id, journey_date) so a seat can't be locked twice for the same journey; expired locks are cleaned up or excluded by checking locked_until.

## Changes to make

1. Create **SmartBus_ERD_v2.mmd** (new versioned file, original kept) with the normalized schema:
   - SCHEDULES: remove rating, total_reviews, duration
   - New REVIEWS table (USERS ||--o{ REVIEWS, SCHEDULES ||--o{ REVIEWS})
   - New ROUTE_STOPS replacing STOP_POINTS, linked to ROUTES; BOOKINGS references ROUTE_STOPS for boarding/dropping
   - BOOKINGS: remove payment_method
   - PAYMENTS: success boolean → status enum
   - SEAT_LOCKS and BOOKING_PASSENGERS: add the unique-constraint notes
   - Keep BOOKING_PASSENGERS.seat_number with a comment marking it as an intentional ticket snapshot
2. Update the README's database/ERD section to match the v2 schema and add a short "Normalization notes" paragraph (why duration/ratings are derived, why seat_number is kept as a snapshot) — useful viva material.
3. No app code changes: the frontend mock services already behave this way (ratings are just mock display data, payment method is read from the payment result), so this is a documentation/design-artifact update only.
