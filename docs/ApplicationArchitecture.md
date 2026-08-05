# Architecture Principles

When implementing new features, the following principles must always be followed.

1. The Master Reference is the source of truth for the application architecture.

2. Every page has a single responsibility.

3. Registration information is entered once and shared by all modules.

4. Each configuration module owns only its own data.

5. The Dashboard displays information but never creates or resets projects.

6. Guest Mode never saves project data.

7. New features must follow the documented workflow unless the architecture is intentionally updated.

## Application Workflow

The Configuration Studio supports two ways to start a configuration.

### Option 1 – Registered Project (Recommended)

Landing Page
↓
Register New Project
↓
Register Project
↓
Project Home
↓
Choose Configuration Module
    • Smartalock
    • Floorsense
    • AI Policy Workshop
↓
Template Selection
↓
Configuration Wizard
↓
Reports

All project information and configuration settings are saved automatically.

---

### Option 2 – Guest Mode

Landing Page
↓
Select:
    • Smartalock
    • Floorsense
    • AI Policy Workshop
↓
Guest Mode Confirmation
↓
Continue as Guest
↓
Template Selection
↓
Configuration Wizard

Guest Mode allows users to explore the application without creating a project.

No project data or configuration is saved while operating in Guest Mode.

## Page Responsibilities

### index.html
The public landing page for the Configuration Studio.

Purpose:
- Introduce the application.
- Allow users to register a new project.
- Allow users to start Smartalock, Floorsense or AI Policy Workshop in Guest Mode.

This page does not display project information.

---

### register.html
Collects project registration information.

Purpose:
- Capture customer and project details.
- Create or update the current project.
- Save registration details.
- Navigate to Project Home.

---

### project-home.html
The starting page for all registered projects.

Purpose:
- Display the registered customer and project.
- Allow users to choose which configuration module to work on.
- Resume work on an existing project.

This page replaces the Landing page once a project has been registered.

---

### *-templates.html
Template selection page.

Purpose:
- Allow users to choose a starting template.
- Prepare the selected configuration module.

---

### *-wizard.html
Configuration wizard.

Purpose:
- Guide users through the configuration process.
- Save configuration into the current project.
- Mark the module as configured when complete.

---

### dashboard.html
Project overview.

Purpose:
- Display project registration details.
- Display configuration status.
- Provide access to reports.
- Allow users to continue configuration.

## Guest Mode

Guest Mode allows users to explore and use the Configuration Studio without registering a project.

Guest Mode is intended for:
- Product demonstrations.
- Evaluating the application.
- Testing configuration options without creating a project.

Before entering Guest Mode, users must confirm that they understand:

- Their project is not registered.
- Their configuration will not be saved.
- Their work will be lost when they leave or refresh the application.

Guest Mode is available from the Landing page by selecting:
- Smartalock
- Floorsense
- AI Policy Workshop

Users may choose to register a project instead before continuing.

### Guest Mode Confirmation

Title

Continue as Guest?

Message

You can explore and use the Configuration Studio without registering a project.

Please note that your configuration will not be saved and will be lost when you close or refresh the application.

If you would like to save your project and continue working on it later, please register your project first.

Buttons

Primary
Register Project

Secondary
Continue as Guest

## Project Lifecycle

The Configuration Studio works with a single active project.

Every page must work with the same project throughout the user's session.

### Registered Project

1. A new project is created when the user selects **Register New Project** from the Landing page.
2. The Register page updates the project's registration details.
3. Each configuration module updates only its own section of the project.
4. The Dashboard displays the current project information.
5. The project remains available until the user starts a new project or deletes it.

### Guest Mode

Guest Mode does not create or save a project.

Configuration is temporary and exists only while the application is open.

Closing or refreshing the application discards the configuration.

### Project Rules

- Only one active project may exist at a time.
- Registration information is stored once and shared by all modules.
- Smartalock stores only Smartalock configuration.
- Floorsense stores only Floorsense configuration.
- AI Policy Workshop stores only AI Policy Workshop configuration.
- The Dashboard never creates or resets a project.
- Configuration pages must never overwrite registration information.
- Pages must load the existing active project instead of creating a new one.

## Project Data Model

The Configuration Studio uses a single active project throughout the user's session.

The project is shared by all modules.

Each module is responsible only for its own data.

project
│
├── id
├── created
├── updated
├── status
│
├── registration
│     ├── company
│     ├── site
│     ├── email
│     ├── policyContact
│     ├── itContact
│     ├── trainingContact
│     ├── supportContact
│     ├── facilitiesContact
│     ├── installationDate
│     └── completionDate
│
├── smartalock
│     ├── template
│     ├── configuration
│     ├── wizard
│     └── configured
│
├── floorsense
│     ├── template
│     ├── configuration
│     ├── wizard
│     └── configured
│
└── aiPolicyWorkshop
      ├── requirements
      ├── generatedPolicy
      └── completed

      ### Data Ownership

Registration owns customer and project information.

Smartalock owns Smartalock configuration only.

Floorsense owns Floorsense configuration only.

AI Policy Workshop owns policy workshop data only.

The Dashboard reads information from all sections but does not modify them.s