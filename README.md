# Smartalock Configuration Studio

A static HTML/CSS/JS prototype for designing, configuring and documenting Smartalock locker system deployments. No build step — open any page directly in a browser, or serve the folder with any static file server.

## Start here

Open `index.html` at the project root — this is the entry point. It lets the client choose which product line they're configuring (**Smartalock** or **Floorsense**), each with a description, icon and a live-switching preview panel, before routing into that product's configuration flow.

Choosing **Smartalock** routes into the **10-step configuration wizard** under `pages/`, named `smartalock-<module>-0X.html`:

| # | File | Module |
|---|------|--------|
| 00 | `smartalock-templates-00.html` | Project Registration |
| 01 | `smartalock-reservation-type-01.html` | Reservation Type |
| 02 | `smartalock-it-configuration-02.html` | IT Configuration & Integrations |
| 03 | `smartalock-locker-behaviour-03.html` | Locker Door Behaviour |
| 04 | `smartalock-locker-types-04.html` | Locker Types |
| 05 | `smartalock-locker-policy-05.html` | Locker Policy |
| 06 | `smartalock-user-policy-06.html` | User Policy |
| 07 | `smartalock-kiosk-customisation-07.html` | Kiosk Customisation |
| 08 | `smartalock-configuration-summary-08.html` | Configuration Summary |
| 09 | `smartalock-access-methods-09.html` | Initial Locker Access Methods |

Every wizard page's top progress bar links to all the others, and module 00's back-arrow returns to `index.html`. Choosing **Floorsense** on the entry page instead routes to `pages/floorsense-templates.html`, that product line's own configuration engine.

`pages/dashboard.html` and `pages/reports.html` both link back to `index.html` via a **"Configuration Wizard"** nav item, and their **"Summary"** nav item links to `smartalock-configuration-summary-08.html`.

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

- `index.html` — the site's home page (see "Start here" above). It no longer links to Dashboard, Configuration Engine, Implementation Ready, or Reports — those pages predate the product-picker flow and are currently only reachable by opening their file directly (`pages/dashboard.html`, `pages/reports.html`, `pages/smartalock-wizard.html`, `pages/smartalock-templates.html`) or via each other's own top nav.
- `pages/dashboard.html`, `pages/reports.html` — surrounding app shell (predates the wizard work above).
- `pages/smartalock-wizard.html` — a separate reference/spec document (not part of the numbered wizard family) that the wizard's field definitions were originally researched from.
- `pages/register.html`, `pages/project-home.html`, `pages/floorsense-templates.html`, `pages/ai-policy-workshop.html`, `pages/smartalock-templates.html` — other standalone app pages, unrelated to the wizard.
- `assets/`, `css/`, `js/` — shared images/icons, stylesheets and scripts for the pages above. Each of the 10 wizard pages is self-contained (styles and script inlined in the page itself) and doesn't depend on `css/`/`js/`.
- `data/`, `docs/`, `output/` — supporting data files, spec docs, and generated report output; not touched by the wizard work.

## Housekeeping notes

- Three earlier generations of this same wizard (`-v3`, `-v4`, `-v6` suffixed pages, plus an older unversioned `configuration-summary.html`) were removed as of this handover — the numbered `smartalock-<module>-0X.html` family above is the only one still live and linked from the main nav.
- The old marketing-style `index.html` (Dashboard / Configuration Engine / Implementation Ready / AI Policy Workshop cards) has been replaced by the Smartalock/Floorsense product picker described in "Start here". `pages/configuration-start.html` was moved to the root as the new `index.html` rather than living alongside the wizard pages.
- A few files could not be permanently deleted due to a filesystem restriction in the environment this cleanup was done in; they were moved to a git-ignored `_removed-for-handover/` folder instead. That folder is safe to delete outright from Finder/Terminal — it isn't referenced by anything and isn't tracked in git.
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
