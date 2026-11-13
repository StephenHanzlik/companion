# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Any backcountry ski tourer. That includes people with no formal avalanche
training, not only course graduates. They use Companion in three situations:

- **Before a tour**, at home, to prepare a trip: who's going, the objective and
  route, the forecast, the avalanche problems, the terrain plan and the
  emergency plan.
- **After a tour**, back home at a computer, to write up in full what they
  saw in the field (observations, snow profile tests, plan changes,
  risk-reduction tactics), working from the notes they jotted by hand on the
  tour.
- **After a tour**, to debrief: summarize the day, reflect on the decision
  points and capture lessons learned.

## Product Purpose

Companion gives each backcountry ski tour a structure and a record, organized
around the three-phase trip planning framework that avalanche education
programs teach: **Plan → Ride → Debrief**. It exists so that the preparation,
the field observations and the reflection for a trip live together in one
place and stay connected. A tourer should get better at decisions over time,
not just keep a log.

Success means a tourer finishes a trip with a complete, connected record:
a plan that was actually thought through, observations tied to that trip, and
a debrief that refers back to specific observations. That record should go
well beyond what the brief prompts in a paper field book have room for.

## Positioning

It's the in-depth desk companion to a paper field book, not a replacement for
it, and not a forecast app or a route planner. The field book's concepts are
all here, but with much more room to work through each one. The paper book
still goes on the tour. The three phases are linked records in one trip. A
debrief refers to the specific observations it reflects on. Field reminders, such as
the departure check and the "Stay aware" loop, sit next to the data, so the
framework's prompts and the tourer's own record are in the same place. It's
an independent hobby project and isn't affiliated with or endorsed by any
avalanche education organization.

## Operating Context

Companion is used at a computer, before and after the tour. A paper field
book carries the plan into the field and carries the observations back:

1. **Plan** at a computer before the tour, in depth.
2. **Copy the essentials** of the plan into the paper field book before
   leaving.
3. **In the field**, write observations by hand in the notebook.
4. **Back home**, enter those notes at the desktop and write them up in
   full in Ride.
5. **Debrief** afterward, also at the desk.

Live entry on a phone in the field is **not** the current assumption. There
is no offline sync, and building one would be a deliberate future decision.
- Trip lifecycle: `planning → active → debriefed`.
- Weather comes from NWS (nearest station, with its distance from the
  selected point shown) and elevation from the USGS elevation service. The
  Weather POC is exploratory and isn't attached to trips yet.
- Deployed at `avycompanion.coldmountainsoftware.com`.

## Capabilities and Constraints

- **Trips**: name, US state, start and end dates, party, status.
- **Plan**: assemble the group, anticipate the hazard (avalanche problems),
  choose and manage avalanche terrain, plan the emergency, go/no-go checklist,
  sign-off. Parts of the Plan form are still mocked on the frontend.
- **Ride**: a departure check (gear, time plan, communication plan, beacon
  function check). The "Stay aware" loop, repeated at each juncture. Timestamped
  observations (weather, terrain, avalanche, red flag, general). Snow profile
  tests (compression test, extended column test, propagation saw test, pit
  profile). Field notes on plan changes and risk-reduction tactics. Each entry
  can have a location and a note on why it matters.
- **Debrief**: summary, decision-point reflections, lessons learned.
  Submission to an external observation feed is planned but not built.
- No authentication yet. A single seeded demo user owns everything.
- Terminology: **Plan, Ride, Debrief** are the phase names. A **trip** is the
  unit, and the field terms (avalanche problem, ECT, PST, red flag) are
  standard avalanche-education vocabulary.
- **Possible direction:** more weather features in the Plan phase. Today
  weather lives only in the separate Weather POC, and `Plan.weather_forecast`
  is an unused JSONB column. This is under consideration, not committed.
- **Future action:** a short Plan summary sized for copying into the paper
  field book before the tour. This is noted for later and isn't scheduled.
- **Open decision:** whether Companion will ever flag concerns, for example a
  high forecast danger or a logged red flag. For now it only prompts and
  records, but the door is deliberately left open.

## Brand Commitments

- Product name: **Companion** (the domain uses "avycompanion"). Published under
  Cold Mountain Software.
- **Naming constraint (binding):** never name or spell out the avalanche
  education organization whose field book inspired the Plan/Ride/Debrief
  structure. This applies to code, comments, docs, commit messages and UI copy.
  Use generic language instead, such as "a structured trip planning framework"
  or "avalanche education programs". See `CLAUDE.md`.
- Voice so far: plain, direct and imperative, written like field-book prompts
  ("Prepare before you leave", "Conduct a departure check", "Stay aware").

## Evidence on Hand

- Hero photo: `frontend/public/images/hero-pine-trees.jpg`, by Doug Duffee on
  Unsplash. The credit is shown on the landing page and must stay with the
  photo.
- Real product screenshots: `frontend/public/images/preview-plan.png`,
  `preview-ride.png`, `preview-debrief.png`.
- **None of the following exists, and none may be invented:** testimonials,
  user counts, partner or organization endorsements, safety outcome claims,
  accuracy claims about forecasts.

## Product Principles

1. **The judgment stays with the group.** Companion prompts, structures and
   records. It doesn't make go/no-go calls or rate a party's risk. If it ever
   flags concerns, it should surface conditions and leave the conclusion to
   the user.
2. **Support training, don't replace it.** Users may have no formal training,
   so field terms need plain-language context where they appear. Nothing
   should imply that using the app stands in for avalanche education or
   experience.
3. **The record connects.** Plan, observations and debrief belong to one trip
   and refer to each other. Features should strengthen those links, not add
   isolated logs.
4. **Be honest about where data comes from.** Show the source and how
   representative a reading is, such as station distance or elevation source.
   Never present a valley reading as conditions on the slope.
5. **Depth at the desk, brevity in the field.** Companion is where the
   field book's brief prompts get worked through thoroughly. It's denser than
   the paper book on purpose. The paper book stays the tool on the tour, so
   Companion works with it rather than competing with it.
