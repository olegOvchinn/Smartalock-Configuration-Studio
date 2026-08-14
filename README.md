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
| 00 | `floorsense-setup-path-00.html` | Setup Path (Relaxed / Pre-Configured / Strict / Build Your Own) |
| 01 | `floorsense-reservation-types-01.html` | Desk Allocation Method (Dedicated Workstations / Reserved by User as Needed / Team Leader Allocated / Booked on Behalf) *(Floorsense wizard entry point — pick-a-product.html's Floorsense card lands here)* |
| 02 | `floorsense-checkin-methods-02.html` | Check-in Methods |
| 03 | `floorsense-checkin-policy-03.html` | Check-in Policy (check-in window, plus default reservation start/end/duration times) |
| 04 | `floorsense-idle-release-04.html` | Auto-Release on Idle |
| 05 | `floorsense-prebooking-advance-05.html` | Prebooking — How Far In Advance |
| 06 | `floorsense-reservation-length-06.html` | Default Reservation Length |

As with the Smartalock wizard, module numbers don't match click-through order here either: the actual path is **01 → 02 → 00 → 03 → 04 → 05 → 06**. `floorsense-reservation-types-01.html` is the true entry page (its back-arrow returns to `pick-a-product.html`), then continues to `floorsense-checkin-methods-02.html`, then to `floorsense-setup-path-00.html`, then on through Check-in Policy, Auto-Release on Idle, Prebooking, and Reservation Length in numeric order. The progress bar still lists all seven modules in their fixed 00–06 numeric order regardless of this click-through order — the same convention used for the Smartalock wizard's 00/02 reorder. Its state lives under `project.floorsense.wizard` in the same `configurationProject` localStorage key described below — `setupPath`, `reservationTypes`, `checkinMethods`, `checkinPolicy`, `idleRelease`, `prebookingAdvance` and `reservationLength` respectively. Module 06 is currently the last one built, so its next-arrow is disabled.

Module 00 also branches: choosing **Relaxed**, **Pre-Configured**, or **Strict** all route to `floorsense-out-of-box-policy.html` — an unnumbered, read-only summary of Floorsense's default policy that skips the rest of the walkthrough entirely (Relaxed/Strict pass a `?preset=` query string so the page can reflect the choice in its heading, though the underlying numbers are currently shared with Pre-Configured pending distinct values). Choosing **Build Your Own** continues into module 03 (Check-in Policy), since desk allocation and check-in methods were already collected on modules 01 and 02 before reaching this page.

Check-in Policy (module 03) hosts two numbered sections on one page — "1. Check-in Window" and "2. Default Reservation Times" — each built as a single explainer card: an icon + description with the actual settings editable inline in the sentence, a shaded "EXAMPLE" panel with a small diagram, and a footer strip with supporting context. Auto-Release on Idle (module 04) uses the same card pattern but as its own single-topic page, since it was originally going to be a third numbered section on module 03 before being split out.

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
