const STORAGE_KEY = "smartalock_project";


function saveProject(project) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(project)
    );

}


function loadProject() {

    const data =
        localStorage.getItem(STORAGE_KEY);


    if (!data) {

        return null;

    }


    return JSON.parse(data);

}


function clearProject() {

    localStorage.removeItem(STORAGE_KEY);

}