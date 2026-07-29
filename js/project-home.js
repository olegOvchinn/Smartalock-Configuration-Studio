document.addEventListener("DOMContentLoaded", () => {

    const project = loadProject();

    console.log(project);

    document.getElementById("companyName").textContent =
        project.registration.customer || "-";

    document.getElementById("siteName").textContent =
        project.registration.site || "-";

});