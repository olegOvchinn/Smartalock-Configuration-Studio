const PROJECT_TEMPLATE = {

    version: "1.0",

    project: {

        name: "",
        customer: "",
        consultant: "",
        created: "",
        modified: ""

    },

    smartalock: {

        configured: false,

        it: {

            sso: "",
            scim: "",
            domain: ""

        },

        lockerBehaviour: {

            openIdleLockers: false,
            idleTimeout: "",
            pushToOpen: ""

        },

        lockerPolicy: {

            reservationDuration: "",
            releaseBehaviour: "",
            lockerLimit: "",
            allowSharedLockers: false

        },

        userPolicy: {

            allowBooking: true,
            allowRelease: true,
            allowExtend: true,
            allowRenew: true

        },

        kiosk: {

            enabled: false,
            options: []

        },

        lockerTypes: []

    },

    floorsense: {

        configured: false,

        desks: {},

        meetingRooms: {},

        parking: {},

        visitors: {},

        integrations: {}

    }

};