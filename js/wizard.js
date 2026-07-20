console.log("Smartalock Policy Workshop loaded");


const nextButton = document.querySelector(".button");


if(nextButton){

nextButton.addEventListener("click", function(){

const selected =
document.querySelector(
'input[name="lockerType"]:checked'
);


if(!selected){

alert("Please select locker type");

return;

}


console.log(
"Locker type:",
selected.value
);


let project = loadProject();


if (!project) {

    project = createNewProject();

}


project.policy.lockerType =
    selected.value;


saveProject(project);


alert(
    "Configuration saved: "
    + selected.value
);


});


}