---
version: 1
slug: "frontend-src-pages-tripworkspace-tsx"
primary_target: "frontend/src/pages/TripWorkspace.tsx"
related_targets: ["frontend/src/pages/TripsList.tsx","frontend/src/pages/Landing.tsx","frontend/src/pages/PlanTab.tsx","frontend/src/pages/RideTab.tsx","frontend/src/pages/DebriefTab.tsx"]
---

# Trips workspace and landing

Scope: the Trips workspace (trip rail, Plan / Ride / Debrief) in Operate mode, and the landing page in Persuade mode. The Weather POC only inherits the shell.

Audience: any backcountry tourer, working at a desk before and after the tour. Guiding services are a credibility bar only, with no guide features. The jobs on Trips are evenly split between resuming a trip, starting one, and reviewing the season.

Constraints: frontend-only iteration, with backend changes deferred. Plan drafts are kept in the browser until the plan data model is agreed. The hero photo and its Unsplash credit stay. Never name the training organization.

## Direction contract

THESIS: Each trip reads like a technical spec sheet with the Swiss map sheet's rigor: self-contained cards for the work, and one graphite overview card that summarizes the trip. It refuses the generic SaaS sidebar-and-cards look and the open-ended scrolling form.

OWN-WORLD: Cool stone ground (#f1f2f1), white cards with hairline borders, a graphite top bar and overview card (#1c1f22). Lime (#d6f25c) is the single accent, used for progress, the current section, the Plan status and the primary CTA. Avalanche problems use lime, sky, sand and rose. Rose rings are tinted cool grey by elevation band. The type is the system UI sans, with monospace only for record codes and measurements (sheet 014, OBS-01, 32°). All figures are tabular.

STORY: Visitors see where every trip stands from the rail. They work one section card at a time while the overview fills in, and they leave with a plan they can copy into the field book. After the tour they write the day up and link the debrief back to it.

FIRST VIEWPORT: The app has a graphite bar, a 272px trip rail, the trip header (title, sheet and meta, Plan / Ride / Debrief segmented control), the open section card with its count badge in lime, and the graphite overview card on the right with the per-problem aspect-elevation roses. The landing has a full-bleed hero photo, with the white headline over the sky, the lime "Start a trip" CTA, and an example overview card floating over the snow.

FORM: The Swiss Topographic Sheet (my pick, position 1 on the ordered list) is crossed with the Technical Spec Sheet (the assigned roll, position 4) at the user's steer. It keeps the spec palette, cards and overview from the Spec Sheet, and the aspect rose, compass picker and section numbering from the Swiss sheet. seed:c94807f5cad5a49c

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: the aspect-elevation rose redraws live as the compass and elevation pickers change.
