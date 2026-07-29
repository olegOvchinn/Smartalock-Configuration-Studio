/* ==========================================================
   CONFIGURATION SUMMARY
========================================================== */


deleteProject();

document.addEventListener("DOMContentLoaded", () => {

    const project = loadProject();

    if (!project) {

        alert("No project loaded.");

        window.location.href = "../index.html";

        return;

    }

    populateProject(project);

    buildSmartalock(project);

    buildFloorsense(project);

    setPrintDate();

});


/* ==========================================================
   PROJECT HEADER
========================================================== */

function populateProject(project){

    document.getElementById("projectName").textContent =
        project.name || "Untitled Project";

    document.getElementById("customerName").textContent =
        project.customer || "Not specified";

    document.getElementById("projectStatus").textContent =
        project.smartalock?.configured
            ? "Configuration Complete"
            : "In Progress";

    document.getElementById("lastUpdated").textContent =
        new Date().toLocaleDateString();

}


/* ==========================================================
   SMARTALOCK
========================================================== */

function buildSmartalock(project){

    document.getElementById("itCard").innerHTML =
        createCard(

            "IT Configuration",

            "Authentication and user account management.",

            [

                {

                    label:"Single Sign-On",

                    value:getSSO(project),

                    description:getSSODescription(project)

                },

                {

                    label:"SCIM Provisioning",

                    value:getSCIM(project),

                    description:getSCIMDescription(project)

                }

            ]

        );



    document.getElementById("behaviourCard").innerHTML =
        createCard(

            "Locker Behaviour",

            "Defines how lockers behave during everyday operation.",

            [

                {

                    label:"Open Idle Lockers",

                    value:getIdleBehaviour(project),

                    description:getIdleBehaviourDescription(project)

                },

                {

                    label:"Push To Open",

                    value:getPushBehaviour(project),

                    description:getPushBehaviourDescription(project)

                }

            ]

        );



    document.getElementById("lockerPolicyCard").innerHTML =
        createCard(

            "Locker Policy",

            "Reservation and allocation rules.",

            [

                {

                    label:"Maximum Lockers",

                    value:getLockerLimit(project),

                    description:getLockerLimitDescription(project)

                },

                {

                    label:"Release Behaviour",

                    value:getReleaseBehaviour(project),

                    description:getReleaseBehaviourDescription(project)

                }

            ]

        );



    document.getElementById("userPolicyCard").innerHTML =
        createCard(

            "User Policy",

            "Controls how users interact with lockers.",

            [

                {

                    label:"Reservation Type",

                    value:getReservationModel(project),

                    description:getReservationDescription(project)

                }

            ]

        );



    document.getElementById("kioskCard").innerHTML =
        createCard(

            "Kiosk Customisation",

            "Available functions at the kiosk.",

            getKioskSettings(project)

        );



    document.getElementById("lockerTypesCard").innerHTML =
        createCard(

            "Locker Types",

            "Locker types available for allocation.",

            getLockerTypes(project)

        );

}
/* ==========================================================
   FLOORSENSE
========================================================== */

function buildFloorsense(project){

    document.getElementById("deskCard").innerHTML =
        createCard(

            "Desk Booking",

            "Desk booking configuration.",

            getDeskSettings(project)

        );



    document.getElementById("meetingCard").innerHTML =
        createCard(

            "Meeting Rooms",

            "Meeting room booking configuration.",

            getMeetingSettings(project)

        );



    document.getElementById("parkingCard").innerHTML =
        createCard(

            "Parking",

            "Parking reservation configuration.",

            getParkingSettings(project)

        );



    document.getElementById("visitorCard").innerHTML =
        createCard(

            "Visitors",

            "Visitor management configuration.",

            getVisitorSettings(project)

        );



    document.getElementById("generalCard").innerHTML =
        createCard(

            "General Policies",

            "Global Floorsense configuration.",

            getGeneralSettings(project)

        );



    document.getElementById("integrationCard").innerHTML =
        createCard(

            "Integrations",

            "Connected workplace systems.",

            getIntegrationSettings(project)

        );

}


/* ==========================================================
   CARD BUILDER
========================================================== */

function createCard(title, subtitle, settings){

    let html = "";

    html += `<h3>${title}</h3>`;

    html += `<div class="subtitle">${subtitle}</div>`;

    settings.forEach(setting=>{

        html += `

        <div class="setting">

            <div class="setting-name">

                ${setting.label}

            </div>

            <div class="setting-value">

                ${setting.value}

            </div>

            <div class="setting-description">

                ${setting.description}

            </div>

        </div>

        `;

    });

    return html;

}


/* ==========================================================
   SMARTALOCK HELPERS
========================================================== */

function getSSO(project){

    return project.smartalock?.it?.sso || "Not Configured";

}

function getSSODescription(project){

    switch(getSSO(project)){

        case "Azure":
        case "Microsoft Entra ID":

            return "Users authenticate using their company Microsoft account.";

        case "Okta":

            return "Users authenticate using your organisation's Okta identity provider.";

        case "Other":

            return "Users authenticate using a third-party identity provider.";

        default:

            return "Users authenticate using Smartalock accounts.";

    }

}



function getSCIM(project){

    return project.smartalock?.it?.scim || "Disabled";

}

function getSCIMDescription(project){

    return getSCIM(project)==="Enabled"

        ? "User accounts are automatically created, updated and disabled."

        : "User accounts are managed manually.";

}



function getIdleBehaviour(project){

    return project.smartalock?.lockerBehaviour?.idleOpen || "Disabled";

}

function getIdleBehaviourDescription(project){

    const value=getIdleBehaviour(project);

    if(value==="Disabled")
        return "Idle lockers remain closed until reserved.";

    return `Unused lockers automatically unlock after ${value}.`;

}



function getPushBehaviour(project){

    return project.smartalock?.lockerBehaviour?.pushToOpen || "Disabled";

}

function getPushBehaviourDescription(project){

    return getPushBehaviour(project)==="Enabled"

        ? "Users can open lockers by pressing the door."

        : "Lockers require the normal opening method.";

}



function getLockerLimit(project){

    return project.smartalock?.lockerPolicy?.maximumLockers || "Unlimited";

}

function getLockerLimitDescription(project){

    return `Each user may reserve up to ${getLockerLimit(project)} locker(s).`;

}



function getReleaseBehaviour(project){

    return project.smartalock?.lockerPolicy?.releaseBehaviour || "Standard";

}

function getReleaseBehaviourDescription(project){

    if(getReleaseBehaviour(project)==="Allow one final locker access")

        return "Users may open the locker one final time after the reservation expires.";

    return "The locker becomes immediately available once the reservation ends.";

}



function getReservationModel(project){

    return project.smartalock?.userPolicy?.reservationModel || "Default";

}

function getReservationDescription(project){

    return "Defines how lockers are assigned and reserved for end users.";

}
/* ==========================================================
   KIOSK SETTINGS
========================================================== */

function getKioskSettings(project){

    const kiosk = project.smartalock?.kioskCustomisation || {};

    const settings = [];

    Object.entries(kiosk).forEach(([key,value])=>{

        if(value===true){

            settings.push({

                label:formatLabel(key),

                value:"Enabled",

                description:`${formatLabel(key)} is available from the kiosk.`

            });

        }

    });

    if(settings.length===0){

        settings.push({

            label:"Kiosk Features",

            value:"None Selected",

            description:"No optional kiosk functions have been enabled."

        });

    }

    return settings;

}


/* ==========================================================
   LOCKER TYPES
========================================================== */

function getLockerTypes(project){

    const types = project.smartalock?.lockerTypes || [];

    if(types.length===0){

        return [

            {

                label:"Locker Types",

                value:"Not Configured",

                description:"No locker types have been defined."

            }

        ];

    }

    return types.map(type=>({

        label:type,

        value:"Available",

        description:`${type} lockers can be allocated to users.`

    }));

}


/* ==========================================================
   FLOORSENSE HELPERS
========================================================== */

function getDeskSettings(project){

    return project.floorsense?.deskSettings || [

        {

            label:"Desk Booking",

            value:"Not Configured",

            description:"Desk booking settings have not yet been configured."

        }

    ];

}


function getMeetingSettings(project){

    return project.floorsense?.meetingSettings || [

        {

            label:"Meeting Rooms",

            value:"Not Configured",

            description:"Meeting room settings have not yet been configured."

        }

    ];

}


function getParkingSettings(project){

    return project.floorsense?.parkingSettings || [

        {

            label:"Parking",

            value:"Not Configured",

            description:"Parking settings have not yet been configured."

        }

    ];

}


function getVisitorSettings(project){

    return project.floorsense?.visitorSettings || [

        {

            label:"Visitors",

            value:"Not Configured",

            description:"Visitor management has not yet been configured."

        }

    ];

}


function getGeneralSettings(project){

    return project.floorsense?.generalSettings || [

        {

            label:"General Configuration",

            value:"Default",

            description:"General Floorsense settings are using their default values."

        }

    ];

}


function getIntegrationSettings(project){

    return project.floorsense?.integrationSettings || [

        {

            label:"Integrations",

            value:"None",

            description:"No external systems have been connected."

        }

    ];

}


/* ==========================================================
   PRINT DATE
========================================================== */

function setPrintDate(){

    const element = document.getElementById("printDate");

    if(!element) return;

    element.textContent =
        "Printed: " +
        new Date().toLocaleString();

}


/* ==========================================================
   UTILITIES
========================================================== */

function formatLabel(text){

    return text
        .replace(/([A-Z])/g," $1")
        .replace(/_/g," ")
        .replace(/\b\w/g,c=>c.toUpperCase())
        .trim();

}
/* ==========================================================
   SVG ICONS
========================================================== */

const ICONS = {

    smartalock: `
        <svg viewBox="0 0 24 24" width="28" height="28"
             fill="none"
             stroke="#0077B6"
             stroke-width="2"
             stroke-linecap="round"
             stroke-linejoin="round">

            <rect x="5" y="11" width="14" height="9" rx="2"></rect>

            <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>

        </svg>
    `,

    floorsense: `
        <svg viewBox="0 0 24 24"
             width="28"
             height="28"
             fill="none"
             stroke="#0077B6"
             stroke-width="2"
             stroke-linecap="round"
             stroke-linejoin="round">

            <rect x="3" y="3" width="18" height="18" rx="2"></rect>

            <path d="M9 3v18"></path>

            <path d="M15 3v18"></path>

            <path d="M3 9h18"></path>

            <path d="M3 15h18"></path>

        </svg>
    `

};


/* ==========================================================
   LOAD SECTION ICONS
========================================================== */

function loadSectionIcons(){

    const sections =
        document.querySelectorAll(".configuration-section");

    sections.forEach((section,index)=>{

        const icon =
            section.querySelector(".section-icon");

        if(!icon) return;

        icon.innerHTML =
            index === 0
                ? ICONS.smartalock
                : ICONS.floorsense;

    });

}


/* ==========================================================
   PRINT
========================================================== */

window.addEventListener("beforeprint", () => {

    document.body.classList.add("printing");

});


window.addEventListener("afterprint", () => {

    document.body.classList.remove("printing");

});


/* ==========================================================
   INITIALISE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadSectionIcons();

});

/* ==========================================================
   FUTURE PLACEHOLDERS
   (Used until Floorsense modules are implemented)
========================================================== */

function getValue(value, fallback = "Not Configured"){

    if(value === undefined) return fallback;

    if(value === null) return fallback;

    if(value === "") return fallback;

    return value;

}


function yesNo(value){

    return value ? "Yes" : "No";

}


function enabledDisabled(value){

    return value ? "Enabled" : "Disabled";

}


function joinValues(values){

    if(!Array.isArray(values) || values.length === 0){

        return "None";

    }

    return values.join(", ");

}


/* ==========================================================
   GENERIC SETTING FACTORY
========================================================== */

function setting(label, value, description){

    return {

        label,

        value,

        description

    };

}


/* ==========================================================
   EMPTY STATE CARD
========================================================== */

function emptyCard(title){

    return createCard(

        title,

        "This module has not been configured.",

        [

            setting(

                "Status",

                "Not Configured",

                "Configuration for this section has not yet been completed."

            )

        ]

    );

}


/* ==========================================================
   EXPORTS
   (Future compatibility)
========================================================== */

window.createCard = createCard;

window.setting = setting;

window.getValue = getValue;

window.enabledDisabled = enabledDisabled;

window.yesNo = yesNo;

window.joinValues = joinValues;


/* ==========================================================
   END OF FILE
========================================================== */