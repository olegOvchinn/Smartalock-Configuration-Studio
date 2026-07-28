// =====================================================
// Smartalock Configuration Studio
// Landing Page
// =====================================================

// Always start with a fresh project while developing
deleteProject();
saveProject(createNewProject());


// =====================================================
// Smartalock
// =====================================================

function startSmartalock() {

    const project = loadProject();

    if (project.smartalock.configured) {

        window.location.href = "pages/dashboard.html";

    } else {

        window.location.href = "pages/smartalock-templates.html";

    }

}


// =====================================================
// Floorsense
// =====================================================

function startFloorsense() {

    const project = loadProject();

    if (project.floorsense.configured) {

        window.location.href = "pages/dashboard.html";

    } else {

        window.location.href = "pages/floorsense-templates.html";

    }

}