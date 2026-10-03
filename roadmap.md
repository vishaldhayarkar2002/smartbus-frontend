# SmartBus refactor roadmap

- [x] Replace Redux with validated, versioned Zustand persistence for auth and booking drafts.
- [x] Move trip search and journey date state into validated route search parameters.
- [~] Move async service (search, bookings, ticket done; admin pages left) reads and writes to TanStack Query with stable keys and invalidation.
- [x] Add collision-safe booking IDs, idempotent payment/booking attempts, and lock revalidation.
- [~] Harden mock authentication, persistence recovery, and document production authorization contracts.
- [x] Simplify dependencies and code paths; format and verify lint/build/diff.
- [ ] Manually verify search reload, persisted/expired drafts, duplicate payment, and route guards.
