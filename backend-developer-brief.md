# Smartalock Configuration Studio — Backend Implementation Brief

**Audience:** the developer standing up the local-host server deployment.
**Status of the front end:** complete. It is a 29-page static HTML/CSS/JS prototype with no build step, no server, and no real database — every page reads and writes one shared object in the browser's own `localStorage`. Your job is to replace that client-only persistence with a real backend, add real email delivery, and add real per-project links, **without changing the field names the front end already reads and writes** (see "Data contract" below — that's the part you must not break).

---

## 1. What exists today (client-only)

- All state lives under one `localStorage` key, `configurationProject`, as a single JSON object (the "project"). Every page loads it, mutates its own slice, and saves it back — there is no API layer at all right now.
- Three separate "emails" exist today, and all three are `mailto:` links (they open the visitor's own mail client via `window.location.href = 'mailto:...'`) — **none of them are sent by a server**:
  1. Client summary email — built and opened when the client finishes either product's wizard.
  2. IT-contact email — built and opened from a "Send Email" button on the IT Configuration page.
  3. Tech Summary email to `oleg@smartalock.com` — **does not exist in code at all.** It's only described in a comment as the intended production behavior. You are building this from scratch.
- There is no unique project URL, no login, and no server-side ID. The project's `id` field is just `Date.now().toString()`, created by whichever page the client opens first.

Everything below tells you exactly what to build to turn this into a real, hosted, multi-client system.

---

## 2. Site map (29 pages, in flow order)

| Step | Page | Notes |
|---|---|---|
| Entry | `smartalock-registration.html` | Project Registration — shared by both products. |
| 1 | `pages/smartalock-it-configuration.html` | IT Configuration & Integrations — shared by both products, precedes the product picker. |
| 2 | `pages/pick-a-product.html` | Router only — sends the client to one of the two wizards below. Can be revisited to do the other product. |
| Smartalock branch | `pages/smartalock-access-methods.html` → `smartalock-locker-behaviour.html` → `smartalock-reservation-type.html` → `smartalock-locker-policy.html` → `smartalock-user-policy.html` → `smartalock-locker-types.html` → `smartalock-kiosk-customisation.html` → `smartalock-configuration-summary.html` | 7 modules + summary/finish page. |
| Floorsense branch | `pages/floorsense-setup-path.html` (URL-only, not linked from the progress bar) → `floorsense-reservation-types.html` → `floorsense-desk-user-groups.html` → `floorsense-checkin-methods.html` → `floorsense-business-hours.html` / `floorsense-default-reservation-times.html` / `floorsense-checkin-window.html` → `floorsense-prebooking-advance.html` → `floorsense-reservation-length.html` → `floorsense-optional-features.html` (hub for NSNP / Idle Release / FME / Anti Desk Hogging) → `floorsense-out-of-box-policy.html` | Out-of-box-policy is the Floorsense finish/summary page. |
| Client-facing output | `smartalock-locker-guide-live.html`, `floorsense-desk-booking-guide-live.html` | End-user guides, opened from each summary page's "View / Print Guide" button. Dynamically rendered from the same project object — no backend change needed beyond persistence. |
| Internal-only | `pages/tech-summary.html` | Never linked from the client-facing flow. Meant to be generated and emailed to `oleg@smartalock.com` only — see §4.3. |

---

## 3. Data contract — do not rename these keys

The front end reads/writes a single JSON object shaped like this (this is the actual shape, not the stale placeholder inside each page's own offline fallback — the registration page's real field list is longer than its own fallback comment suggests):

```jsonc
{
  "id": "string",              // currently Date.now().toString() — replace with a real server-issued ID (see §4.2)
  "created": "ISO 8601 string",
  "updated": "ISO 8601 string", // set on every save
  "registration": {
    "customer": "", "site": "", "email": "",
    "policyName": "", "policyEmail": "",
    "itName": "", "itEmail": "",
    "portalAccess": "",
    "trainingName": "", "trainingEmail": "",
    "supportName": "", "supportEmail": "",
    "facilitiesName": "", "facilitiesEmail": "",
    "installationDate": "", "completionDate": ""
  },
  "smartalock": {
    "configured": false,       // set true when the Smartalock summary is confirmed
    "templates": [],
    "wizard": {
      "moduleStatus": {},      // { [moduleKey]: true } — drives the progress bar
      "it": {},                // IT Configuration & Integrations (shared page, lives under smartalock)
      "accessMethods": {},
      "lockerBehaviour": {},
      "reservationType": {},
      "locker": {},            // Locker Policy
      "user": {},              // User Policy
      "lockerType": {},
      "kioskCustomisation": {}
    }
  },
  "floorsense": {
    "configured": false,       // set true when the Floorsense summary is confirmed
    "templates": [],
    "wizard": {
      "moduleStatus": {},
      "setupPath": {},
      "reservationTypes": {},
      "deskUserGroups": {},
      "checkinMethods": {},
      "businessHours": {},
      "defaultReservationTimes": {},
      "checkinWindow": {},
      "checkinPolicy": {},
      "prebookingAdvance": {},
      "reservationLength": {},
      "maxDesksPerUser": {},
      "nsnp": {},
      "idleRelease": {},
      "fme": {},
      "antiDeskHogging": {},
      "autoOccupancyCheckin": {},
      "noShowRelease": {},
      "remoteConfirm": {},
      "optionalFeatures": {},
      "outOfBoxPolicy": {},
      "corePolicyCard": {},
      "additionalPolicies": []  // array, up to 3 client-named policy overrides
    }
  }
}
```

Every `{}` above is itself an object whose exact field names are defined inline in that module's own page (open the relevant `pages/*.html` file and search for `const state = {` — each page's own script is the source of truth for its module's fields). `tech-summary.html` and both Configuration Summary pages read these exact keys by name to render their "setting key" columns (e.g. `book_adhoc`, `res_duration_type`, `desk_power_policy`) — **if a field gets renamed on the front end without updating those readers, or vice versa on the backend, the summary/tech-summary output silently breaks.** Treat this shape as an API contract between the static front end and whatever storage/API layer you build, not as something to freely restructure.

---

## 4. What you need to build

### 4.1 Real persistence (replace localStorage)

- Stand up a database (or even a simple per-project JSON file store, given this is a local/internal server, not public-facing) keyed by project ID.
- Every page currently has its own copy of `loadProject()`/`saveProject()` reading/writing `localStorage.getItem('configurationProject')`. These need to be swapped for real API calls (e.g. `GET /api/projects/:id`, `PUT /api/projects/:id`) that read/write the same JSON shape described in §3. This touches every page file identically — it's a mechanical, repeated change, not a design problem.
- `saveProject()` currently sets `project.updated = new Date().toISOString()` on every save — preserve that behavior server-side (or trust the client's value, your call).

### 4.2 Unique per-project ID and shareable URL

- Replace the client-generated `Date.now().toString()` ID with a real server-issued unique ID (UUID or similar) at the point a new project is first created (i.e., the first time `smartalock-registration.html` — or whichever page is hit first — is opened with no existing project).
- Add a `?project=<id>` (or equivalent path-based) route so a client can be sent a link back to their own project and have every page load *that* project's data instead of (or in addition to) local storage. Every page will need to read this param and use it to fetch the right project via the API from §4.1.
- This is genuinely new — there is no existing query-param-based project loading anywhere in the current code. (Don't confuse this with the existing `?return=summary&branch=...` param, which is a same-session "which page to return to after editing" flag, unrelated to project identity — it needs to keep working alongside whatever you add here.)
- Decide with Oleg whether this link needs any access control (a guessable sequential ID vs. an opaque token) since there's currently no authentication anywhere in the prototype.

### 4.3 Real email delivery — three flows

All three should move from `mailto:` (opens the visitor's own mail client, unreliable/absent on a server-hosted deployment) to real server-side sending (SMTP or a transactional email API — your call), unless Oleg tells you to keep `mailto:` for any of them.

1. **Client summary email.** Triggered when the client clicks "Save & Email Me Summary" on `smartalock-configuration-summary.html` or `floorsense-out-of-box-policy.html`. Recipient: `project.registration.email`. Content: currently a plain-text walk of every `.summary-group`/`.summary-row` on the page (see `buildSummaryText()`/`buildSummaryMailtoHref()` in either file for the exact copy/structure to preserve or improve on) plus links to the two end-user guide pages. This is also the point where `project.smartalock.configured` / `project.floorsense.configured` gets set to `true` — make sure your replacement still does this.
2. **IT-contact email.** Triggered by the "Send Email" button at the top of `smartalock-it-configuration.html`, and silently again every time "Save & continue" is pressed on that page. Recipient: `project.registration.itEmail`. Current behavior: if that field is empty, the explicit button click shows an alert asking the user to fill it in on Project Registration first; the silent auto-send on Save just no-ops instead. Preserve that distinction (or discuss changing it with Oleg).
3. **Tech Summary email to `oleg@smartalock.com`.** **Not implemented anywhere today** — this is the one flow you're building from nothing. Trigger point (per the original spec in `tech-summary.html`'s own header comment): when a client registers and/or when either branch's summary is saved/confirmed. Content: render `pages/tech-summary.html` for that project (it already does this dynamically from the same project JSON — no template work needed) and email it (as a link, a PDF, or inline — confirm with Oleg) to `oleg@smartalock.com` only. This page must never be linked from, or accessible to, the client-facing flow.

### 4.4 One product vs. both

- `project.smartalock.configured` and `project.floorsense.configured` already exist and get set on each branch's own summary confirmation — but nothing currently reads or branches on them (`pick-a-product.html` is a plain router with no awareness of either flag). Decide with Oleg what should actually happen differently for a client who does one product vs. both (e.g., does the Tech Summary email fire once per product, or once total once both are done?) — this isn't decided anywhere in the current build and needs an explicit answer before you wire up §4.3's trigger.

### 4.5 Hosting

- Per the original spec, this runs on a local/internal server reachable by a per-client link, not a public DNS entry. No further constraint is documented beyond that — confirm the intended network/access model (VPN-only, internal network, etc.) with Oleg before deciding on infrastructure.

---

## 5. Open questions for Oleg (confirm before/while building)

1. Access control on a project's unique link — anyone with the link, or some form of auth?
2. Real email sending: SMTP relay or a transactional provider (SendGrid/Postmark/etc.)? Any existing account to use?
3. Tech Summary delivery format — link, inline HTML, or PDF attachment?
4. Tech Summary trigger timing — on registration save, on each branch's summary confirm, on both, debounced how?
5. Behavior for a client who configures both products — one Tech Summary email or two?
6. Any expiry/one-time-use requirement on a project's return link, or is it meant to be permanent?

---

## 6. Constraints — please don't do this

- Don't rename any `project.*` field without updating every page and both summary/tech-summary readers that reference it by name (§3).
- Don't remove or restructure `pages/tech-summary.html`'s rendering logic — it already builds the exact internal report from the project object; you're wiring delivery, not rebuilding the page.
- Don't break the existing `?return=summary&branch=...` edit-and-return flow while adding the new unique-project-URL param — they need to coexist.
