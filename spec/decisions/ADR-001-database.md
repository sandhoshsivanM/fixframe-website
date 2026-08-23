# ADR-001 · Database → PostgreSQL

**Status:** ACCEPTED
**Supersedes:** V1 Part H1, which left the choice open as "PostgreSQL/SQL Server"

## Context

V1 named two candidates and never chose. The choice is not cosmetic — it determines how `ENT-ProjectBlock` is modelled, whether global admin search needs a second system, and whether the cost model carries a licensing line.

Three requirements in V1 constrain the decision:

- **F07** specifies "structured `ProjectBlock` table/JSON with controlled block types" — a heterogeneous, ordered, versioned content-block structure.
- Admin search appears on six screens (E02, E04, E05, E08, F02 and the global search the audit found missing), across text fields of varying length.
- **L2** treats the database as a cost centre with no licensing assumption stated.

## Decision

**PostgreSQL.**

## Rationale

| Requirement | How Postgres answers it |
|---|---|
| `ProjectBlock` polymorphism | `jsonb` column with a `type` discriminator and a CHECK constraint on the allowed block types. Typed at the application boundary, indexed with GIN where queried. Avoids either an EAV table or one nullable column per block variant. |
| Admin + public search | Native full-text search (`tsvector`, `pg_trgm` for fuzzy title match) covers every search surface in the spec without introducing Elasticsearch or Meilisearch — a whole additional service, backup target and failure mode. |
| Cost model | No licensing line. Managed Postgres is available from more vendors at small scale than managed SQL Server, which matters for L2's `₹[0–2,000]/month` band. |
| .NET integration | Npgsql + EF Core is first-class. Nothing in ASP.NET Core prefers SQL Server that materially applies here. |
| Operational | `pg_dump`/PITR are well-understood, and J1's "automated backup + restore test" is straightforward to automate and verify. |

## Consequences

- Entity definitions in `reference/entities.md` assume Postgres types (`uuid`, `jsonb`, `timestamptz`, `text`, `citext` for email).
- **All timestamps are `timestamptz` stored in UTC.** V1 E07 left timezone as `[TBD]`; the storage decision is settled here regardless of which display timezone is chosen — see `UNRESOLVED-002`.
- `citext` for email means uniqueness is case-insensitive without application-layer normalisation.
- Migrations are EF Core migrations, checked into the repo and applied in CI, never by hand.

## Override condition

Revisit if the studio has existing Microsoft licensing that makes SQL Server free at the margin, or in-house T-SQL depth that outweighs the above. The entity definitions are portable; `jsonb` would become `nvarchar(max)` with application-side validation and the full-text strategy would change. Estimated rework if flipped after Increment 1: the entity reference and any migration code — not the business logic.

## Alternatives considered

**SQL Server.** Rejected on cost and hosting availability at this scale, not on capability. Its JSON support is weaker than `jsonb` for the block model (no native indexing of JSON paths in the same way), which is the specific place this project needs it.

**Postgres + a dedicated search service.** Rejected as premature. Portfolio and lead volumes in this business do not justify a second stateful service; `pg_trgm` will carry it well past the scale in `UNRESOLVED-006`. Revisit only if that assumption is exceeded.
