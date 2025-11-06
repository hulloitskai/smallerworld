# Business Intelligence Playbook

How to handle Smaller World’s BI-style requests safely, efficiently, and
repeatably.

## 1. Understand the Request

- Confirm output shape: timeline vs. aggregates vs. anomaly hunts.
- Nail the timeframe: ask for timezone when absent. Default to UTC; switch to
  `America/New_York` when the user says “EST.”
- Capture exclusions up front (e.g., skip “welcome posts,” omit drafts, ignore
  auto-generated content).
- Restate privacy expectations: default to paraphrasing and redacting
  names/handles unless the user instructs otherwise.

## 2. Prepare the Data Plan

- Identify the Supabase project once per session with `list_projects`; reuse the
  ID.
- Only call `list_tables` when you truly need orientation. Prefer
  `information_schema` queries to inspect structures.
- Validate joins before querying. Example: `posts` joined to `users` to compare
  author metadata.
- Sketch the SQL before executing so you know which columns justify inclusion.
  Pull the smallest useful set (ids + timestamps + content fields).

## 3. Execute Queries Deliberately

- **Schema sniff**
  ```sql
  select column_name, data_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'posts';
  ```
- **Daily snapshot (UTC by default)**
  ```sql
  select id, created_at, type, title, body_html
  from posts
  where created_at::date = current_date
  order by created_at;
  ```
- **Weekly range (local week, Monday–Sunday EST)**

  ```sql
  with bounds as (
    select date_trunc('week', timezone('America/New_York', now())) as week_start,
           date_trunc('week', timezone('America/New_York', now())) + interval '7 days' as week_end
  )
  select p.id,
         timezone('America/New_York', p.created_at) as created_at_est,
         p.type, p.title, p.body_html
  from posts p
  join users u on u.id = p.author_id
  cross join bounds
  where timezone('America/New_York', p.created_at) >= bounds.week_start
    and timezone('America/New_York', p.created_at) < bounds.week_end
    and not (
      p.updated_at is not null
      and p.updated_at between u.created_at and u.created_at + interval '1 minute'
    )
  order by created_at_est;
  ```

  - The `updated_at` window removes auto-generated welcome posts (learned
    2025-11-03).
  - Adjust intervals/timezones per request.

- When result sets are long, page with `limit … offset …` or add `row_number()`
  to keep sequencing without over-fetching.

## 4. Interpret & Summarize

- Strip HTML to meaning. Describe activities, themes, or sentiments; avoid
  quoting sensitive paragraphs verbatim.
- Convert timestamps to the requested timezone and mention the offset when it
  helps.
- Group longer recaps by day, but keep individual bullets chronologically
  ordered.
- Describe shared links (“linked to an Instagram reel about the demo”) instead
  of pasting URLs unless clearly intended for distribution.
- Only state inferences (emotion, risk) when the text is unmistakable; otherwise
  stick to observed facts.

## 5. Privacy & Safety Guardrails

- Never output names, handles, phone numbers, or emails from the database.
- Generalize references to trauma, health, or interpersonal conflict.
- When unsure if content is sensitive, omit or paraphrase lightly and note the
  omission.
- Flag high-risk themes carefully (“mentioned coping with grief”) without
  amplifying graphic details.

## 6. Quality Checklist Before Responding

- [ ] Timeframe and timezone match the user’s ask.
- [ ] Exclusions applied (welcome posts, drafts, etc.).
- [ ] Summary flows chronologically and stays free of PII.
- [ ] Key activities/themes captured; no obvious gaps.
- [ ] Uncertainties or assumptions surfaced so the user can clarify.

## 7. Lessons Logged (keep current)

- 2025-11-02: Weekly recap required EST boundaries across Monday–Sunday; compute
  bounds with `timezone('America/New_York', …)` before truncation.
- 2025-11-02: Removing welcome posts needs an author join to compare
  `posts.updated_at` with `users.created_at`.
- 2025-11-03: Weeks can surface ~50 posts; chunk with `limit/offset` or
  `row_number()` to stay organized while summarizing.

Use this playbook whenever the user asks for reporting, analytics, or “detective
work” on Supabase data. Append to the Lessons section after each meaningful
engagement so the next run starts smarter.
