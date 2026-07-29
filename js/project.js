// =====================================================
// Smartalock Configuration Studio
// Project Manager
// =====================================================

const PROJECT_KEY = "configurationProject";

/**
 * Create a brand-new project
 */
function createNewProject() {

    return {

        id: Date.now().toString(),

        created: new Date().toISOString(),

        updated: new Date().toISOString(),

        status: "Draft",

        registration: {

            customer: "",
            site: "",
            projectName: "",
            contact: "",
            email: "",
            phone: ""

        },

        smartalock: {

            configured: false,

            templates: [],

            wizard: {}

        },

        floorsense: {

            configured: false,

            templates: [],

            wizard: {}

        }

    };

}


/**
 * Save the project
 */
function saveProject(project) {

    // Never save projects while in Guest Mode
    if (isGuestMode()) {

        console.log("Guest Mode: project not saved.");

        return;

    }

    project.updated = new Date().toISOString();

    localStorage.setItem(
        PROJECT_KEY,
        JSON.stringify(project)
    );

}


/**
 * Load the current project
 */
function loadProject() {

    if (isGuestMode()) {

        return createNewProject();

    }

    const data = localStorage.getItem(PROJECT_KEY);

    if (!data) {

        return createNewProject();

    }

    return JSON.parse(data);

}


/**
 * Delete the current project
 */
function deleteProject() {

    localStorage.removeItem(PROJECT_KEY);

}


/**
 * Check whether a project already exists
 */
function projectExists() {

    return localStorage.getItem(PROJECT_KEY) !== null;

}


/**
 * Update registration details
 */
function updateRegistration(registrationData) {

    const project = loadProject();

    project.registration = {

        ...project.registration,

        ...registrationData

    };

    saveProject(project);

}


/**
 * Save Smartalock template selections
 */
function saveSmartalockTemplates(templates) {

    const project = loadProject();

    project.smartalock.templates = templates;

    saveProject(project);

}


/**
 * Save Smartalock wizard answers
 */
function saveSmartalockWizard(wizardData) {

    const project = loadProject();

    project.smartalock.wizard = wizardData;

    saveProject(project);

}


/**
 * Mark Smartalock configuration complete
 */
function completeSmartalock() {

    const project = loadProject();

    project.smartalock.configured = true;

    saveProject(project);

}


/**
 * Save Floorsense template selections
 */
function saveFloorsenseTemplates(templates) {

    const project = loadProject();

    project.floorsense.templates = templates;

    saveProject(project);

}


/**
 * Save Floorsense wizard answers
 */
function saveFloorsenseWizard(wizardData) {

    const project = loadProject();

    project.floorsense.wizard = wizardData;

    saveProject(project);

}


/**
 * Mark Floorsense configuration complete
 */
function completeFloorsense() {

    const project = loadProject();

    project.floorsense.configured = true;

    saveProject(project);

}

/* =========================================
   GUEST MODE
========================================= */

function startGuestMode(module) {

    sessionStorage.setItem("guestMode", "true");

    sessionStorage.setItem("guestModule", module);

}

function isGuestMode() {

    return sessionStorage.getItem("guestMode") === "true";

}

function getGuestModule() {

    return sessionStorage.getItem("guestModule");

}

function clearGuestMode() {

    sessionStorage.removeItem("guestMode");

    sessionStorage.removeItem("guestModule");

}