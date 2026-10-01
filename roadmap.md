# SmartBus refactor roadmap

- [ ] Replace Redux with validated, versioned Zustand persistence for auth and booking drafts.
- [ ] Move trip search and journey date state into validated route search parameters.
- [ ] Move async service reads and writes to TanStack Query with stable keys and invalidation.
- [ ] Add collision-safe booking IDs, idempotent payment/booking attempts, and lock revalidation.
- [ ] Harden mock authentication, persistence recovery, and document production authorization contracts.
- [ ] Simplify dependencies and code paths; format and verify lint/build/diff.
- [ ] Manually verify search reload, persisted/expired drafts, duplicate payment, and route guards.
