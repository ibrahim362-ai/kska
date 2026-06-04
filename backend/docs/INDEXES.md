# Database Index Audit

This document tracks the database indexes in `prisma/schema.prisma` and the queries they support.

## Indexes by Model

### User
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([email])` | Login, signup check, search | Unique already covers this |
| `@@index([username])` | Profile lookup, signup check | Unique already covers this |
| `@@index([role])` | Admin user lists, RBAC checks | |

### Post
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([userId])` | "Posts by user" feed | |
| `@@index([type])` | Filter by ANNOUNCEMENT/EVENT/etc | |
| `@@index([createdAt])` | Sort by newest | |
| `@@index([isTrending])` | Trending feed | |
| `@@index([userId, createdAt])` | User's posts, sorted | **Added** |

### Comment
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([userId])` | User's comments | |
| `@@index([postId])` | Comments on a post | |

### Like / Save
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@unique([userId, postId])` | Like/save lookup | Composite unique |
| `@@index([postId])` | Like/save count per post | |

### Vote
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([creatorId])` | Votes by creator | |
| `@@index([isActive])` | Active vote lists | |
| `@@index([endsAt])` | Scheduled cleanup jobs | |

### VoteRecord
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@unique([voteId, userId])` | Prevent double vote | |
| `@@index([voteId])` | Vote tallies | |
| `@@index([userId])` | User's voting history | |

### Membership
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([planType])` | Filter by FREE/SILVER/GOLD | |

### UserMembership
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([userId])` | User's memberships | |
| `@@index([membershipId])` | Membership subscribers | |
| `@@index([expiresAt])` | Cron to deactivate expired | |

### Ticket
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([creatorId])` | Employer's tickets | |
| `@@index([status])` | Active ticket lists | |
| `@@index([eventDate])` | Upcoming events | |

### TicketPurchase
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([ticketId])` | Sold count, attendees | |
| `@@index([userId])` | "My tickets" | |
| `@@index([status])` | Pending confirmations | |
| `@@index([ticketId, status])` | **Added** — Sold count by status | |

### Notification
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([userId])` | User notifications | |
| `@@index([isRead])` | Unread count | |
| `@@index([createdAt])` | Sort newest first | |
| `@@index([userId, isRead])` | **Added** — "Unread for me" | |

### Payment
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([userId])` | User's payments | |
| `@@index([reference])` | Webhook lookup | Unique already |
| `@@index([status])` | Pending/Completed | |

### ManualPaymentProof
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([paymentId])` | Lookup by payment | Unique already |
| `@@index([userId])` | User's proofs | |
| `@@index([status])` | Pending proofs (admin) | |
| `@@index([createdAt])` | Sort newest first | |
| `@@index([userId, status])` | **Added** — User's proofs by status | |

### Report
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([reporterId])` | User's reports | |
| `@@index([status])` | Pending reports (admin) | |

### Session / RefreshToken
| Index | Query Path | Notes |
|-------|-----------|-------|
| `@@index([token])` | Token lookup | Unique already |
| `@@index([userId])` | User's sessions | |
| `@@index([expiresAt])` | Cleanup cron | |

## Composite Indexes Added (this audit)

1. `Post(userId, createdAt)` — User profile feeds
2. `Notification(userId, isRead)` — Unread count badge
3. `TicketPurchase(ticketId, status)` — Sold count by status
4. `ManualPaymentProof(userId, status)` — User's proof history

## When to Add More

- **When query times > 100ms** — Check `EXPLAIN ANALYZE` on the slow query
- **When table size > 100K rows** — Most queries need indexes
- **For full-text search** — Use Postgres `tsvector` + GIN index (not yet implemented)

## Monitoring

Postgres slow query log:
```sql
ALTER SYSTEM SET log_min_duration_statement = '100ms';
SELECT pg_reload_conf();
```

Then watch Docker logs:
```bash
docker compose logs -f postgres | grep "duration:"
```
