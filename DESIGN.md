---
name: Companion
description: A backcountry trip companion laid out like a technical spec sheet with a Swiss map sheet's rigor.
colors:
  signal-lime: "#d6f25c"
  signal-lime-pressed: "#c8e646"
  graphite: "#1c1f22"
  graphite-hover: "#33383c"
  ink-secondary: "#454b50"
  ink-muted: "#5c6267"
  field-stroke: "#8c9295"
  hairline: "#d9dcdb"
  hairline-soft: "#e8eae9"
  cool-stone: "#f1f2f1"
  rail-stone: "#e7e9e8"
  rail-stone-hover: "#dfe2e1"
  well: "#f6f7f6"
  paper-white: "#ffffff"
  overview-ink: "#f4f4f1"
  overview-muted: "#a9afb3"
  overview-rule: "#363a3e"
  done-green: "#3d6a12"
  danger-rust: "#a3321b"
  danger-wash: "#fbeae5"
  flag-wash: "#fde7e2"
  flag-line: "#e3a897"
  flag-ink: "#8c2b17"
  problem-sky: "#5fb8e6"
  problem-sand: "#d9b37a"
  problem-rose: "#e59a9a"
  band-near: "#eceeee"
  band-below: "#d7dbdc"
  debriefed-grey: "#8f969b"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(42px, 5vw, 66px)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  page-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.3
  group-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.07em"
  record-code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.93em"
    fontWeight: 600
    letterSpacing: "0"
rounded:
  hair: "2px"
  sm: "3px"
  md: "4px"
  lg: "6px"
  xl: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.graphite-hover}"
  button-accent:
    backgroundColor: "{colors.signal-lime}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-accent-hover:
    backgroundColor: "{colors.signal-lime-pressed}"
  button-quiet:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  input:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.graphite}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "7px 10px"
    height: "36px"
  card:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.md}"
    padding: "20px"
  overview-card:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.overview-ink}"
    rounded: "{rounded.lg}"
    padding: "20px 20px 16px"
    width: "344px"
  top-bar:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper-white}"
    height: "56px"
    padding: "0 24px"
  trip-rail:
    backgroundColor: "{colors.rail-stone}"
    textColor: "{colors.graphite}"
    width: "272px"
  picker-chip:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.hair}"
    size: "36px x 30px"
  picker-chip-pressed:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper-white}"
  badge:
    backgroundColor: "{colors.well}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.hair}"
    padding: "0 7px"
    height: "22px"
  badge-flag:
    backgroundColor: "{colors.flag-wash}"
    textColor: "{colors.flag-ink}"
    rounded: "{rounded.hair}"
---

# Design System: Companion

## Overview

**Creative North Star: "The Trip Spec Sheet"**

Every trip reads like a technical spec sheet drawn with a Swiss topographic sheet's rigor. The ground is cool stone, the work happens in self-contained white cards with hairline borders, and one graphite overview card summarizes the trip in the margin the way a sheet's legend does. The chrome (top bar, overview card, landing close) is graphite; the paper is white; a single signal lime marks what is done, current or ready to start.

Density is that of a working document, not a dashboard: 14px body, tabular figures everywhere, numbered sections (1.0 to 5.0), record codes (OBS-01, TEST-01, NOTE-01) and sheet numbers set in monospace. The map-sheet vocabulary arrives through the aspect-elevation rose (which is also the picker), the 3x3 compass picker for snow-test aspect, and the section numbering, not through decoration. The system rejects the generic SaaS sidebar-and-cards look and the endless scrolling form: work is broken into cards you open one at a time while the overview fills in.

**Key Characteristics:**
- Cool stone ground, white hairline cards, graphite chrome, one lime accent.
- System UI sans for everything; monospace only for record codes and measurements.
- Tabular numerals globally.
- Flat surfaces; shadow appears only on the open section card and the graphite overview card.
- Shape carries status (square, dot, diamond); colour reinforces it.
- The aspect-elevation rose is the signature graphic. In Plan it is the picker itself, and the overview copy redraws live from it.

## Colors

A near-monochrome cool-grey sheet with one acid-lime signal and a separate four-colour palette reserved for avalanche problems.

### Primary
- **Signal Lime** (`signal-lime`): the only accent. It has exactly five roles: done segments of the overview progress bar; the count chip on the open, in-progress section card; the Plan status mark; the primary call to action (accent button, including "Start a trip" and "Open trips"); the active top-bar underline and the wordmark dot. Pressed/hover state uses `signal-lime-pressed`.

### Neutral
- **Graphite** (`graphite`): primary text, the top bar, the overview card, the landing close band, the primary ink button, pressed picker chips, the selected segment of the Plan / Ride / Debrief control, and the ink rule that heads grouped rows.
- **Ink Secondary / Ink Muted** (`ink-secondary`, `ink-muted`): supporting text, meta lines, help text, section numbers and record codes at rest.
- **Field Stroke** (`field-stroke`): borders of inputs, quiet buttons, picker chips and dashed add buttons. Darker than hairlines so controls read as controls.
- **Hairline / Hairline Soft** (`hairline`, `hairline-soft`): card borders and in-card row dividers respectively.
- **Cool Stone** (`cool-stone`): the page ground. **Rail Stone** (`rail-stone`) is the trip rail, a half step darker. **Well** (`well`): inset fills for section rules, callouts, guidance and "why it matters" notes. **Paper White** (`paper-white`): cards and fields.
- **Overview Ink / Muted / Rule** (`overview-ink`, `overview-muted`, `overview-rule`): text, secondary text and row rules on graphite surfaces.

### Semantic
- **Done Green** (`done-green`): "Done" counts and saved confirmations.
- **Danger Rust** (`danger-rust`, `danger-wash`): errors and invalid fields.
- **Flag** (`flag-wash`, `flag-line`, `flag-ink`): the red-flag badge on field observations.

### Avalanche problem palette
- Problems fill in order: Signal Lime, **Problem Sky** (`problem-sky`), **Problem Sand** (`problem-sand`), **Problem Rose** (`problem-rose`), mirrored by `--problem-1..4` in CSS and `PROBLEM_COLORS` in the rose component.
- Unselected rose rings are tinted by elevation band from the centre out: Paper White (above treeline), **Band Near** (`band-near`), **Band Below** (`band-below`).

### Named Rules
**The Five Roles Rule.** Lime appears only in the five roles listed under Primary. A new surface that wants lime must be one of those five things.

**The Separate Palettes Rule.** Phase marks stay outside the avalanche-problem palette: Ride is a graphite dot and Debriefed a **Debriefed Grey** (`debriefed-grey`) diamond, never sky, sand or rose.

## Typography

**Body Font:** the system UI sans stack (-apple-system, Segoe UI, system-ui, Helvetica Neue, Arial)
**Label/Mono Font:** ui-monospace, SFMono-Regular, Menlo, Consolas

**Character:** an engineering-document voice: the platform sans set tight and bold for headings, with monospace reserved for the codes a field book would print.

### Hierarchy
- **Display** (800, clamp 42-66px, 1.02, -0.03em): the landing hero headline only, white over the photo's sky, capped at 11ch.
- **Headline** (800, 40px, 1.08, -0.025em): landing section headings (34px for phase bands, 44px for the graphite close; 30-32px on narrow screens).
- **Page title** (700, 28px, 1.15, -0.02em): the trip name in the workspace header.
- **Title** (700, 15-17px): card titles (16px), section card titles (15px closed, 17px open), entry titles (15px), overview title (18px).
- **Body** (400, 14px, 1.45, tabular): all app copy; prose is held to 62-75ch. Landing body runs at 16-19px.
- **Label** (700, 13px): field labels and buttons.
- **Group label** (700, 12px, 0.07em, uppercase): headings for groups of rows inside a card, the rail groups ("In progress", "Debriefed") and overview sub-lists. They head content; they never sit above a headline.
- **Record code** (mono, 600, 0.93em): sheet numbers, OBS-01 / TEST-01 / NOTE-01, section numbers 1.0-5.0, trip numbers in the rail, step numbers.

### Named Rules
**The Mono Means Measured Rule.** Monospace is only for record codes and measurements. Never set prose, labels or headings in mono.

**The Tabular Rule.** Figures are tabular everywhere (`font-variant-numeric: tabular-nums` on the root), including date and time inputs.

## Layout

The app shell is a 56px sticky graphite top bar over a two-column page: a 272px sticky trip rail and the content. Inside, the workspace is a grid with named areas: the trip header (title, mono sheet and meta, Plan / Ride / Debrief segmented control) and the work column on the left, and a 344px sticky overview card on the right, 28px gutter, max width 1320px.

The work column is a stack of cards with a 10px gap. Section cards indent their body to a 72px left edge so content aligns past the section number.

Responsive behaviour: below 1180px the overview card moves above the work (roses reflow to an auto-fill grid); below 900px the rail is hidden, the overview drops below the work, gutters go to 16px and multi-column rows stack; below 560px the segmented control goes full width and two-up field grids collapse.

The landing runs a full-bleed photo hero (viewport height minus the bar, 620-880px) with the copy left and an example overview card floating at the bottom right, then a 1240px wrap with a five-step flow strip, alternating phase bands (4:7 text to figure) and a graphite close band.

Spacing rhythm is 4/8/12/16/20/28 with in-between steps (6, 10, 14, 18, 22) used for optical tuning inside components; card padding is 20px (16px narrow).

## Elevation & Depth

Flat by default. Depth comes from tone (stone ground, white cards, graphite chrome) and hairlines, not shadow. Three shadows exist and each has a single job.

### Shadow Vocabulary
- **Open section** (`0 10px 28px -18px rgba(28,31,34,0.45)`): the one open section card, paired with an ink border.
- **Overview** (`0 18px 40px -28px rgba(0,0,0,0.6)`): the graphite overview card; on the landing hero it deepens to `0 30px 60px -30px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.2)`.
- **Figure** (`0 40px 80px -48px rgba(28,31,34,0.5)`): landing screenshot and example panels only.

### Named Rules
**The Lift Means Focus Rule.** Only the open section and the overview card lift off the page in the app. Closed cards, inputs and rows stay flat.

## Shapes

Small, square-ish corners throughout: 2px for picker chips, badges and tags; 3px for buttons, inputs, callouts and the segmented control; 4px for cards; 6px for the overview card and the landing flow strip; 8px for landing figures. The overview card carries a small punched hole (an 11px stone-coloured circle at its top right), like a sheet ready for a ring binder.

Status is carried by shape: a 9px square for Plan (lime with an ink ring), a 9px graphite dot for Ride, an 8px grey diamond for Debriefed. Problem keys are 11px squares with an ink ring. Rows inside a card are divided by hairlines under a 1px graphite rule, never boxed.

## Components

### Buttons
Compact, bold and square-cornered.
- **Shape:** 3px radius, 36px tall (32px small, 46px large), 13px bold label, 6px icon gap.
- **Primary (ink):** graphite fill, white text; hover lightens to graphite-hover. The default action button ("New trip", saves).
- **Accent:** lime fill, graphite text, a faint 12% graphite border. Reserved for the primary CTA.
- **Quiet:** white fill, field-stroke border, border goes graphite on hover.
- **Dashed:** transparent with a dashed field-stroke border for "add another" actions; turns solid white on hover.
- **Ghost on photo:** translucent navy fill with a 75% white border and white text, used only over the hero photo.
- **Disabled:** 45% opacity. **Focus:** 2px graphite outline, 2px offset (lime outline on graphite surfaces).

### Inputs / Fields
- **Style:** white fill, 1px field-stroke border, 3px radius, 36px min height, 14px text; labels above in 13px bold with inline muted help.
- **Hover / Focus:** border darkens on hover; focus becomes a graphite border plus 1px graphite ring, no glow.
- **Error:** danger-rust border.
- **Date, time and select:** native controls re-skinned with the same stroked 16px calendar, clock and chevron glyphs in graphite.

### Cards / Containers
- **Card:** white, 1px hairline border, 4px radius; head and foot bands at 14px x 20px separated by soft hairlines; body 20px.
- **Section card (Plan):** a disclosure whose header row is mono section number, title, one-line summary, status count and chevron. Closed: plain card. Open: graphite border, the open-section shadow, larger title, lime count chip while incomplete, a well-filled rule line under the header, and a body indented to the title edge. Completed sections show a green "Done" check.
- **Grouped rows:** avalanche problems, decision-point reflections and checklists sit inside a card as rows under a graphite top rule with hairline dividers between them.

### Overview card (signature)
The graphite summary that sits beside the work and is never editable: white title, muted meta with mono sheet number, the punched hole, a segmented progress bar (6px segments, 3px gaps: lime done, off-white current, rule-grey ahead), then label/value rows divided by graphite rules with muted empty values. Under the hazard section it shows one aspect-elevation rose per avalanche problem with a coloured key square and an elevation-band legend, and closes with a small note.

### Aspect-elevation rose and pickers (signature)
The rose draws eight aspects around and three elevation bands from the centre outward (above treeline in the middle, below treeline outside), cells stroked in graphite, unselected cells tinted by band, selected cells filled with that problem's colour; cell fills transition over 180ms. A problem's location is a set of individual cells (`NE:ALP`, `NE:NTL`), never an aspect list crossed with a band list, so a problem can sit on N and NE above treeline but only NE near treeline.

In Plan the rose is the picker. Every cell is a focusable checkbox (click, Enter or Space toggles it, hover darkens it, focus thickens its stroke), the eight aspect letters toggle a whole wedge, and a row of ALP / NTL / BTL chips with band-tint swatches toggles a whole ring, followed by a Clear link and a plain-text summary ("Above treeline: N, NE. Near treeline: NE."). The overview card shows the same rose read-only with N, E, S, W only. Snow tests in Ride still pick a single aspect from a 3x3 compass of 36x30 chips laid out as on a map, with a graphite hub dot at the centre. Chips are white with a field-stroke border and turn graphite with white text when pressed.

### Navigation
- **Top bar:** graphite, 56px, mountain mark plus "Companion." wordmark with a lime dot; links muted grey turning white on hover, the current page white with a 3px lime underline.
- **Trip rail:** rail-stone column with a search field, uppercase group labels, and trip rows of mono trip number, bold title, muted date and phase, and a status mark at the right. The current trip is a white row with a 3px graphite left edge.
- **Phase control:** a graphite-outlined segmented control; the selected phase fills graphite with white text.

### Badges, callouts and field records
- **Badge:** 22px, 2px radius, well fill with an inset hairline, 12px bold. The flag variant uses flag-wash and flag-ink for red flags.
- **Callout:** well fill, hairline border, 3px radius, 13px with a leading icon; ok and error variants tint green and rust.
- **Field record entry:** a 96px time column (mono code above bold time) beside the body (badge, title, place with a pin icon, text, a well-filled "why it matters" note, and fact pairs of muted term over bold value). Entries are hairline-divided rows.
- **Linked-entry pick:** a selectable row of mono code, title and time; pressed state takes a graphite border and graphite code.

### Icons
One stroked set on a 24-unit grid at 1.75 stroke, 16px default, inheriting text colour.

## Do's and Don'ts

### Do:
- **Do** keep lime to its five roles: progress done segments, the open in-progress section's count chip, the Plan status mark, the primary CTA, and the active top-bar underline and wordmark dot.
- **Do** set record codes and measurements in mono (sheet numbers, OBS-01 / TEST-01 / NOTE-01, section numbers 1.0-5.0) and everything else in the system sans.
- **Do** group items inside a card as hairline-divided rows under a 1px graphite rule.
- **Do** carry status with shape first (square, dot, diamond) and colour second.
- **Do** keep the overview card graphite, read-only and beside the work, filling in as sections complete.
- **Do** keep figures tabular.

### Don't:
- **Don't** use coloured side stripes on cards, rows, callouts or entries.
- **Don't** nest bordered cards inside cards.
- **Don't** give phase marks a colour from the avalanche-problem palette (sky, sand, rose).
- **Don't** add shadows to closed cards, rows or inputs; lift is reserved for the open section and the overview card.
- **Don't** use monospace for prose, labels or headings.
