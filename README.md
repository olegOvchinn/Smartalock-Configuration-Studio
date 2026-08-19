# Smartalock Configuration Studio

A static HTML/CSS/JS prototype for designing, configuring and documenting Smartalock locker system deployments. No build step — open any page directly in a browser, or serve the folder with any static file server.

## Start here

Open `smartalock-templates-00.html` (**Project Registration**) — this is the site's actual starting page, and it now lives at the project **root**, not under `pages/`. It has no back-arrow at all (nothing comes before it, and rather than disabling the arrow it's removed outright).

From there the flow is:

1. `smartalock-templates-00.html` (root) — Project Registration
2. `pages/smartalock-it-configuration-02.html` — IT Configuration & Integrations
3. `pages/pick-a-product.html` — the product picker, reached only after 00 → 02, not before

`pages/pick-a-product.html` (formerly `index.html` — renamed and moved into `pages/` since it's no longer the entry point) lets the client choose which product line to configure next (**Smartalock** or **Floorsense**), each with a description, icon and a live-switching preview panel. It also has its own "← Back" link to `smartalock-it-configuration-02.html`, since it's no longer the first page in the flow. Choosing **Smartalock** here resumes the wizard at `smartalock-access-methods-09.html` (skipping 00/02, since those are already done) and continues through the rest of the **10-step configuration wizard** under `pages/`, named `smartalock-<module>-0X.html`:

| # | File | Module |
|---|------|--------|
| 00 | `smartalock-templates-00.html` (project root) | Project Registration *(site entry point — done before pick-a-product.html)* |
| 01 | `smartalock-reservation-type-01.html` | Reservation Type |
| 02 | `smartalock-it-configuration-02.html` | IT Configuration & Integrations *(done before pick-a-product.html)* |
| 03 | `smartalock-locker-behaviour-03.html` | Locker Door Behaviour |
| 04 | `smartalock-locker-types-04.html` | Locker Types |
| 05 | `smartalock-locker-policy-05.html` | Locker Policy |
| 06 | `smartalock-user-policy-06.html` | User Policy |
| 07 | `smartalock-kiosk-customisation-07.html` | Kiosk Customisation |
| 08 | `smartalock-configuration-summary-08.html` | Configuration Summary |
| 09 | `smartalock-access-methods-09.html` | Initial Locker Access Methods *(pick-a-product.html's Smartalock card lands here)* |

The actual click-through order (module numbers don't match navigation order) is: **00 → 02 → pick-a-product.html → 09 → 03 → 04 → 01 → 05 → 06 → 07 → 08**. Every wizard page's top progress bar still links to all the others regardless of this navigation order — except 00 and 02, which no longer show a progress bar at all (00 is the entry page and 02 immediately precedes the product picker, so neither needed the full-wizard segment list). Choosing **Floorsense** on the product picker instead routes into its own wizard, `pages/floorsense-<module>-0X.html`:

| # | File | Module |
|---|------|--------|
| 00 | `floorsense-setup-path-00.html` | **Core Setup Complete** — a card-free confirmation/transition step (no more Relaxed/Pre-Configured/Strict/Build Your Own choice); confirms the core policy is done and hands off to the summary |
| 01 | `floorsense-reservation-types-01.html` | Desk Allocation Method (Dedicated Workstations / Reserved by User as Needed / Team Leader Allocated / Booked on Behalf) *(Floorsense wizard entry point — pick-a-product.html's Floorsense card lands here)* |
| 02 | `floorsense-checkin-methods-02.html` | Check-in Methods |
| 03 | `floorsense-desk-user-groups-03.html` | Desk Groups (Neighbourhoods) &amp; User Groups |
| 04 | `floorsense-prebooking-advance-04.html` | Prebooking — How Far In Advance |
| 05 | `floorsense-business-hours-05.html` | Business Hours (standard opening/closing time used for most users) |
| 06 | `floorsense-optional-features-06.html` | **Optional Features** — a hub page listing every optional module below with an on/off switch, off by default |
| 07 | `floorsense-default-reservation-times-07.html` | Default Reservation Times (default booking start, end and duration) |
| 08 | `floorsense-checkin-window-08.html` | Check-in Window (how early/late a user can check in) |
| 09 | `floorsense-idle-release-09.html` | Auto-Release on Idle *(optional; off by default; skipped in click-through unless switched on)* |
| 10 | `floorsense-reservation-length-10.html` | Default Reservation Length |
| 11 | `floorsense-nsnp-11.html` | No Swipe No Power — NSNP *(optional; requires NSNP relay units installed at each desk; skipped unless switched on)* |
| 12 | `floorsense-fme-12.html` | Follow Me Ergonomics — FME *(optional; save/apply a custom sit-stand desk height via the FS mobile app; skipped unless switched on)* |
| 13 | `floorsense-anti-desk-hogging-13.html` | Anti Desk Hogging *(optional, off by default; restricts booking the same desk repeatedly within a set time window; skipped unless switched on)* |

As with the Smartalock wizard, module numbers don't match click-through order here either: the actual path is **01 → 02 → 03 → 04 → 05 → 06 → 00 → `floorsense-out-of-box-policy.html`**. `floorsense-reservation-types-01.html` is the true entry page (its back-arrow returns to `pick-a-product.html`), then continues through Check-in Methods, Desk & User Groups, Prebooking, Business Hours, and the Optional Features hub — every setting that applies to everyone by default — and finally to Setup Path (module 00), which is no longer a decision point (see below) but a confirmation step whose Continue button leads straight to `floorsense-out-of-box-policy.html`, the read-only summary. `floorsense-default-reservation-times-07.html` onward (07–13: Default Reservation Times, Check-in Window, Auto-Release on Idle, Reservation Length, NSNP, FME, Anti Desk Hogging) are **not** part of this enforced click-through path — they're fully built and still reachable directly from the progress bar (which, as always, lists every module in its fixed 00–13 numeric order regardless of click-through order), just no longer auto-visited by Next/Continue. The four optional pages among them (09, 11, 12, 13) still carry their own `NAV_SEQUENCE`/`seqResolve()` skip-logic for when they're reached directly via the progress bar, so their own internal Next/Back still transparently skips whichever of the four is switched off on the Optional Features hub. Its state lives under `project.floorsense.wizard` in the same `configurationProject` localStorage key described below — `setupPath`, `reservationTypes`, `checkinMethods`, `deskUserGroups`, `prebookingAdvance`, `businessHours`, `defaultReservationTimes`, `checkinWindow`, `idleRelease`, `reservationLength`, `nsnp`, `fme` and `antiDeskHogging` respectively; the Optional Features hub (module 06) introduces no state object of its own — its four switches read and write those same existing `idleRelease.enabled`/`nsnp.mode`/`fme.mode`/`antiDeskHogging.mode` fields directly, only recording its own `moduleStatus` entry for the progress bar.

Setup Path (module 00) no longer offers a Relaxed/Pre-Configured/Strict/Build Your Own choice — that entire branching decision was removed once the page moved to the end of the core click-through chain (see the paragraph above and the file's own NOTE for the full history of both changes). It's now a single card-free confirmation screen: a short message confirming the core policy (desk allocation, check-in methods, desk & user groups, prebooking window, business hours, optional features) is configured and applies to everyone by default, plus a note that the upcoming summary also lets you save the configuration as a General Policy and layer on neighbourhood-specific policies for individual Desk Groups. Its Continue button is the wizard's one remaining path into `floorsense-out-of-box-policy.html`, reached with no `?preset=` query string (that page already defaults to its "recommended" copy when no preset param is present). The progress-bar tooltip for this module was renamed from "Setup Path" to "Core Complete" across all 15 Floorsense pages to match; the underlying `data-module="setup-path"` key is unchanged.

Desk Groups (Neighbourhoods) & User Groups (module 03) — originally inserted between Check-in Methods and Setup Path, and now sitting between Check-in Methods (02) and Prebooking (04) in click-through order since Setup Path moved to the end of the core chain — was, at the time it was added, the newest addition to the main flow (not one of the optional tail-end modules). It covers two independent topics with the same shape: a multi-select checkbox grid (`.group-check-card`, ported from Check-in Methods' `.desk-check-card`) — "not use", "provide a list/floorplan (or spreadsheet, for User Groups)", and "apply different override policy" — where "not use" is mutually exclusive with the other two but those two can combine freely; and a conditional policy textarea that only appears once the "apply different policy" option is ticked, alongside an amber caution notice (ported from Setup Path's `.setup-notice`) warning that policy overrides complicate setup and maintenance. Desk Group Setup defaults to "not use" (no concrete example was supplied for it); User Group Setup defaults to "provide" + "policy" both checked, since the brief supplied a real example override policy ("Only Client Care can book desks in the Client Care area; Only HR can book desks in the HR area"), prefilled into that field.

Prebooking (module 03) and Business Hours (module 04) swapped numbers per a later reorder request, so Prebooking now immediately follows Check-in Methods/Setup Path and Business Hours comes right after it. Business Hours is a single-topic page in the same one-card, one-timeline explainer style as Check-in Window: one card with a live diagram driven by a time drum on either side (Opens / Closes), setting the standard business hours used as a default for most users. Default Reservation Times (module 07, formerly 05) and Check-in Window (module 08, formerly 06) were originally one combined page ("Check-in Policy") hosting two numbered sections; they were later split into their own single-topic pages, each built as a single explainer card: an icon + description, a live diagram, and a footer strip with supporting context. Default Reservation Times comes right after Business Hours (and, since the Optional Features hub was inserted, right after that hub too) so its default start time is already saved by the time a user reaches Check-in Window, whose own worked example depends on it. Auto-Release on Idle (module 09, formerly 07) uses the same card pattern but as its own single-topic page too, since it was originally going to be a third numbered section on the combined page before being split out — its card and diagram were later restyled to match Check-in Window's/Default Reservation Times' Apple Clock time-drum look (a single duration drum driving a fixed "Reserved" pin and an enlarged "Released" pin), replacing an earlier static SVG flowchart and inline number field.

NSNP (module 11, formerly 10), appended after Reservation Length, was the wizard's first genuinely optional module: "No Swipe No Power" cuts power to a desk's outlets when it's occupied without a valid badge swipe, and requires NSNP relay units installed at each desk to function. Rather than the single-explainer-card pattern, it uses the same 4-option radio-card grid as Setup Path (`.path-check-grid`/`.path-check-card`) to choose a rollout mode — all desks, a client-supplied list of enabled desks, not using NSNP at all (the default), or a free-text "Other" — plus a supplementary Apple Clock-style "Power grace period" drum diagram (5-to-240-minute range, defaulting to 60 min) that only appears once a non-"none" mode is selected.

Auto-Release on Idle (module 09) was later made the wizard's second optional module, off by default: its explainer card gained an on/off `.switch` control (the same toggle pattern used on `smartalock-kiosk-customisation-07.html`) in the card header, and its `.timeline-card` diagram plus footer are now wrapped in a `.idle-body` element that stays hidden until the switch is turned on — the same show/hide convention (not opacity dimming) used for NSNP's conditional grace-period block. Its progress-bar tooltip now reads "Auto-Release on Idle (Optional)" across all pages, and its state gained a new `enabled` boolean (`project.floorsense.wizard.idleRelease = { enabled, idleHours }`), defaulting to `enabled: false`.

Follow Me Ergonomics (module 12, formerly 11), appended after NSNP, is the wizard's third optional module: it lets end users save and apply a custom sit-stand desk height via the FS mobile app. It reuses NSNP's `.path-check-grid` radio-card pattern but simplified to 3 modes instead of 4 — "All sit-stand desks", "We will provide a list of desk types" (assumed supplied separately, same as NSNP's own list option), and "We will not enable mobile app FME" (the default, off) — with no "Other" option and no supplementary numeric setting, since the brief didn't call for either.

Anti Desk Hogging (module 13, formerly 12), appended after FME, is the wizard's fourth optional module and restricts users from repeatedly booking the same desk, to encourage cross-team interaction. It uses the simplest 2-mode version of the `.path-check-grid` pattern — "We will enable this feature" vs. "We will NOT enable this feature" (the default, off) — and, when enabled, reveals two Apple Clock-style value drums ("Time Window", 1–14 days, default 2; "Number of Same Desk Bookings", 1–7 times, default 1) rather than the rail/pin timeline diagram used elsewhere, since "book the same desk N times in a window" has no natural before/after moment to plot on a timeline. A live summary line mirrors the brief's own example phrasing ("This would allow a user to book the same desk twice every 5 days").

Optional Features (module 06), inserted between Business Hours and Default Reservation Times, is a control hub rather than a feature of its own: a single card listing all four optional modules above (Auto-Release on Idle, NSNP, FME, Anti Desk Hogging) as stacked rows, each with a one-line description and the same `.switch` on/off control used on Auto-Release on Idle's own page, all off by default. It reads and writes the exact same state fields each feature's own page already uses (no duplicate state key), so toggling here and toggling from the feature's own page always agree; switching a feature on for the first time seeds it with a sensible non-off default (`'all'` for NSNP/FME's mode, `'enable'` for Anti Desk Hogging's mode, `true` for Auto-Release's `enabled`) without disturbing any other saved settings on that feature. This hub is also what makes the four optional pages skippable: `floorsense-checkin-window-08.html`, `floorsense-reservation-length-10.html`, `floorsense-nsnp-11.html`, `floorsense-fme-12.html`, and `floorsense-anti-desk-hogging-13.html` each carry a duplicated `NAV_SEQUENCE` array plus a `seqResolve(key, direction)` walker that skips any neighboring optional page whose switch is off, so Next/Back always lands on the nearest enabled (or non-optional) page. The progress bar itself is unaffected — it always shows and links to all 14 modules no matter which switches are on.

`pages/dashboard.html` and `pages/reports.html` both link back to `pages/pick-a-product.html` via a **"Configuration Wizard"** nav item, and their **"Summary"** nav item links to `smartalock-configuration-summary-08.html`.

### Conventions used across the 10 wizard pages

- **Shell markup**: `.page-main` > `.panel-topbar` (`.top-frame` with `.brand` + horizontal `.progress-bar`) + `.panel-intro` (hero title/subtext) → `.panel-scroll` (the actual form content) → `.action-bar` (Reset / Save & continue).
- **Progress bar**: `.progress-seg` per module; `.saved` = previously completed, `.current` = active page, hover shows a tooltip with the module name.
- **Typography**: Inter throughout. Hero titles are 76px/weight 200, forced onto a single line via `white-space: nowrap` + a `width:100vw; left:50%; transform:translateX(-50%)` breakout so long titles don't get clipped by their column.
- **State**: each page reads/writes a single `localStorage` key, `configurationProject`, shaped roughly as:
  ```
  {
    id, created, updated,
    registration: { customer, site, projectName, contact, email, phone, ... },
    smartalock: {
      configured, templates,
      wizard: {
        moduleStatus: { registration: true, it: true, ... },  // drives the progress bar
        it: {...}, accessMethods: { selected: [...], cardAssignMethod, pinAssignMethod }, ...
      }
    },
    floorsense: { configured, templates, wizard: {} }
  }
  ```
  Each page's own section of `wizard` is independent — check the `<script>` block at the bottom of any page for its exact fields.
- **Images/diagrams**: pages with a right-hand visual panel (e.g. IT Configuration's architecture diagram) swap the `<img src>` via JS based on form selections — see `ARCH_VISUAL` in `smartalock-it-configuration-02.html` for the pattern.

## The rest of the site

- `smartalock-templates-00.html` (project root) — the site's actual entry point (see "Start here" above).
- `pages/pick-a-product.html` — the product picker (formerly the root `index.html`; renamed and moved into `pages/` since 00 → 02 now happen before it). It no longer links to Dashboard, Configuration Engine, Implementation Ready, or Reports — those pages predate the product-picker flow and are currently only reachable by opening their file directly (`pages/dashboard.html`, `pages/reports.html`, `pages/smartalock-wizard.html`, `pages/smartalock-templates.html`) or via each other's own top nav.
- `pages/dashboard.html`, `pages/reports.html` — surrounding app shell (predates the wizard work above).
- `pages/smartalock-wizard.html` — a separate reference/spec document (not part of the numbered wizard family) that the wizard's field definitions were originally researched from.
- `pages/register.html`, `pages/project-home.html`, `pages/ai-policy-workshop.html`, `pages/smartalock-templates.html` — other standalone app pages, unrelated to the wizard.
- `assets/`, `css/`, `js/` — shared images/icons, stylesheets and scripts for the pages above. Each of the 10 wizard pages is self-contained (styles and script inlined in the page itself) and doesn't depend on `css/`/`js/`.
- `data/`, `docs/`, `output/` — supporting data files, spec docs, and generated report output; not touched by the wizard work.

## Housekeeping notes

- Three earlier generations of this same wizard (`-v3`, `-v4`, `-v6` suffixed pages, plus an older unversioned `configuration-summary.html`) were removed as of this handover — the numbered `smartalock-<module>-0X.html` family above is the only one still live and linked from the main nav.
- The old marketing-style `index.html` (Dashboard / Configuration Engine / Implementation Ready / AI Policy Workshop cards) was replaced by the Smartalock/Floorsense product picker described in "Start here" (`pages/configuration-start.html` was moved to the root as that generation's `index.html`). Since then, the flow was restructured again: `smartalock-templates-00.html` and `smartalock-it-configuration-02.html` were promoted ahead of the product picker, and the picker itself was renamed from root `index.html` to `pages/pick-a-product.html`. There is no `index.html` anywhere in the project any more — the root now holds `smartalock-templates-00.html` instead.
- A few files could not be permanently deleted due to a filesystem restriction in the environment this cleanup was done in; they were moved to a git-ignored `_removed-for-handover/` folder instead (including the old root `index.html`, at `_removed-for-handover/index.html.old`). That folder is safe to delete outright from Finder/Terminal — it isn't referenced by anything and isn't tracked in git.
- If you're picking this up on a machine with GitHub access already configured, remember to `git push origin main` — recent work was committed locally but may not be pushed yet.

## Status

Wizard flow (10 modules above): feature-complete prototype, actively maintained.
Rest of the app: earlier-stage scaffolding.

## Technologies

- HTML5, CSS3 (Inter via Google Fonts), vanilla JavaScript
- `localStorage` for state — no backend
- Lottie (`lottie-web` via CDN) for the Locker Door Behaviour animations

## Author

Oleg Ovchinnikov
