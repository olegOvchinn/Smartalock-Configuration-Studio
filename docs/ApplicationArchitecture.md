# Smartalock Configuration Studio
## Application Architecture

## Core Objects

The application consists of the following primary objects:

Project
 ├── Site Information
 ├── Global Default Policy
 ├── Additional Policies
 ├── Locker Banks
 ├── Reports
 └── Settings

---

## Project

Represents a single Smartalock installation.

Examples

- APRA Canberra
- DITRDCSA Melbourne
- RBNZ Wellington

A project contains all policies, reports and customer information.

---

## Global Default Policy

The Global Default Policy is the root policy.

All lockers inherit these settings unless overridden by an Additional Policy.

There can only be one Global Default Policy.

---

## Additional Policy

Additional Policies inherit all settings from the Global Default Policy.

Only modified settings are stored.

Each Additional Policy applies to one or more locker banks.

Examples

- Visitor Lockers
- Executive Lockers
- Contractors
- Parcel Lockers

---

## Locker Bank

A locker bank is assigned one policy.

If no policy is assigned, it automatically uses the Global Default Policy.

---

## Reports

The application generates:

- Customer Summary
- APS Summary
- Technical Summary
- Commissioning Checklist
- User Import Spreadsheet

---

## Design Principles

- Never duplicate settings.
- Store only overrides in Additional Policies.
- Keep the user interface simple.
- Use plain English wherever possible.
- Automatically generate technical configuration from user selections.
