// @ts-check1

// https://registry.isdcf.com/contenttypes
// https://registry.isdcf.com/contentmodifiers
// https://registry.isdcf.com/projectoraspectratios
// https://registry.isdcf.com/languages
// https://registry.isdcf.com/territories
// https://registry.isdcf.com/ratings
// https://registry.isdcf.com/audioconfigs
// https://registry.isdcf.com/studios
// https://registry.isdcf.com/facilities

const VERSION = "1.1.0";

const USE_STUDIOS = true;
const USE_FACILITY = true;

const dciElements = document.getElementsByClassName("v_element");

const tableTerritoriRating = new Map();
const tableContentDesc = new Map();

const date = new Date();
dciElements.v_year.value = date.getFullYear();
dciElements.v_month.value = date.getMonth() + 1;
dciElements.v_day.value = date.getDate();

for (let el of dciElements) {
  if (el.id == "v_result") continue;
  el.addEventListener("change", generate_dci_name);
  el.addEventListener("input", generate_dci_name);
}

document.getElementById("clipboard").addEventListener("click", function() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(dciElements.v_result.value).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
  else {
    dciElements.v_result.select();
    document.execCommand("copy");
    console.log('execCommand: Copying to clipboard was successful!');
    dciElements.v_result.setSelectionRange(0, 0);
    dciElements.v_result.blur();
  }
}
);

let fetch_count = 0;

/*
let tooltipList;
var tooltipTriggerList;
*/

fetch_count++;
fetch("assets/data/contenttypes.json", { method: "GET" })
  .then((response) => proceedResponse(response))
  .then((json) => setContent(json))
  .catch((error) => alert(error));

fetch_count++;
fetch("assets/data/projectoraspectratios.json", { method: "GET" })
  .then((response) => response.json())
  .then((json) => setAspect(json))
  .catch((error) => alert(error));

fetch_count++;
fetch("assets/data/languages.json", { method: "GET" })
  .then((response) => response.json())
  .then((json) => setLanguage(json))
  .catch((error) => alert(error));

fetch_count++;
fetch("assets/data/audioconfigs.json", { method: "GET" })
  .then((response) => response.json())
  .then((json) => setAudioconfigs(json))
  .catch((error) => alert(error));

fetch_count++;
fetch("assets/data/ratings.json", { method: "GET" })
  .then((response) => response.json())
  .then((json) => setTerritoryRating(json))
  .catch((error) => alert(error));

if (USE_STUDIOS) {
  fetch_count++;
  fetch("assets/data/studios.json", { method: "GET" })
    .then((response) => response.json())
    .then((json) => setStudios(json))
    .catch((error) => alert(error));
}

if (USE_FACILITY) {
  fetch_count++;
  fetch("assets/data/facilities.json", { method: "GET" })
    .then((response) => response.json())
    .then((json) => setFacility(json))
    .catch((error) => alert(error));
}

function proceedResponse(response) {
  if (response.headers.get("DCI-updated") == "1") {
    // updated            
  }
  return response.json();
}

/*
var userLang = navigator.language || navigator.userLanguage;
alert ("The language is: " + userLang);
*/

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function setContent(jsContent) {
  jsContent.data.forEach((el) => {
    let opt = document.createElement("option");
    opt.title = el.description;
    /*
    opt.setAttribute("data-bss-tooltip", "");
    opt.setAttribute("data-bs-toggle", "tooltip");
    opt.setAttribute("data-bs-placement", "left");
    */
    opt.value = el.dcncCode;
    opt.innerHTML = capitalizeFirstLetter(el.cplContentKind.value);
    tableContentDesc.set(el.dcncCode, el.description);
    dciElements.v_content_type.appendChild(opt);
  });

  /*
  bsTooltip = new bootstrap.Tooltip(dciElements.v_content_type)
  updateContentTooltip();
  dciElements.v_content_type.addEventListener("change", updateContentTooltip);
  */

  tooltipTriggerList = [].slice.call(
    document.querySelectorAll("[data-bss-tooltip]")
  );
  tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  if (fetch_count == 1) generate_dci_name();
  fetch_count--;
}

/*
function updateContentTooltip() {
  bsTooltip.dispose();
  dciElements.v_content_type.title = tableContentDesc.get(
    dciElements.v_content_type.value
  );
  bsTooltip = new bootstrap.Tooltip(dciElements.v_content_type);
}
*/

function setAspect(jsContent) {
  jsContent.data.forEach((el) => {
    let opt = document.createElement("option");
    opt.value = el.dcncCode;
    opt.innerHTML = el.description;
    dciElements.v_proj_aspect.appendChild(opt);
  });
  if (fetch_count == 1) generate_dci_name();
  fetch_count--;
}

function setStudios(jsContent) {
  jsContent.data.sort((a, b) => {
    return a.description.localeCompare(b.description);
  });
  let opt = document.createElement("option");
  opt.value = "";
  opt.innerHTML = "";
  dciElements.v_studio.appendChild(opt);
  jsContent.data.forEach((el) => {
    let opt = document.createElement("option");
    opt.value = el.code;
    opt.innerHTML = el.description;
    dciElements.v_studio.appendChild(opt);
  });
  if (fetch_count == 1) generate_dci_name();
  fetch_count--;
}

function setFacility(jsContent) {
  jsContent.data.sort((a, b) => {
    return a.description.localeCompare(b.description);
  });
  let opt = document.createElement("option");
  opt.value = "";
  opt.innerHTML = "";
  dciElements.v_facility.appendChild(opt);
  jsContent.data.forEach((el) => {
    opt = document.createElement("option");
    opt.value = el.code;
    opt.innerHTML = el.description;
    dciElements.v_facility.appendChild(opt);
  });
  if (fetch_count == 1) generate_dci_name();
  fetch_count--;
}

const FIRST_IMMESRIVE_AUDIO_INDEX = 6;
const DBOX_INDEX = 13;

function setAudioconfigs(jsContent) {
let opt;
  for (let n = 0; n < FIRST_IMMESRIVE_AUDIO_INDEX; n++) {
    opt = document.createElement("option");
    opt.value = jsContent.data[n].dcncCode;
    opt.innerHTML = jsContent.data[n].description;
    dciElements.v_audio_type.appendChild(opt);
  }

  opt = document.createElement('option');
  opt.value = '';
  opt.innerHTML = 'None';
  dciElements.v_immersive.appendChild(opt);

  let size = 0;
  console.log(jsContent.data.length);
  for (let n = FIRST_IMMESRIVE_AUDIO_INDEX; n < jsContent.data.length; n++) {
    if (
      jsContent.data[n].dcncCode == "HI" ||
      jsContent.data[n].dcncCode == "VI" ||
      jsContent.data[n].dcncCode == "SL" ||
      jsContent.data[n].dcncCode == "DBOX"
    )
      continue;
    opt = document.createElement("option");
    opt.value = jsContent.data[n].dcncCode;
    opt.innerHTML = jsContent.data[n].description;
    dciElements.v_immersive.appendChild(opt);
    ++size;
  }
  // dciElements.v_immersive.setAttribute("size", size);

  if (fetch_count == 1) generate_dci_name();
  fetch_count--;
}

function setTerritoryRating(jsTerritoriRating) {
  let rating = { name: "No rating", ratings: [] };
  tableTerritoriRating.set("", rating);

  rating = { name: "International", ratings: ["TL", "TD"] };
  tableTerritoriRating.set("INT", rating);

  jsTerritoriRating.data.forEach((el) => {
    let rating = {
      name: capitalizeFirstLetter(el.region.name.toLowerCase()),
      ratings: el.ratings,
    };
    tableTerritoriRating.set(el.region.code, rating);
  });

  for (let el of tableTerritoriRating.keys()) {
    let opt = document.createElement("option");
    opt.value = el;
    if (el == "") {
      opt.innerHTML = tableTerritoriRating.get(el).name;
    } else {
      opt.innerHTML = tableTerritoriRating.get(el).name + ", " + el;
    }
    dciElements.v_territory.appendChild(opt);
  }

  updateRating();
  dciElements.v_territory.addEventListener("change", updateRating);

  if (fetch_count == 1) generate_dci_name();
  fetch_count--;
}

function updateRating() {
  dciElements.v_rating.innerHTML = "";

  tableTerritoriRating
    .get(dciElements.v_territory.value)
    .ratings.forEach((el) => {
      let opt = document.createElement("option");
      opt.value = el;
      opt.innerHTML = el;
      dciElements.v_rating.appendChild(opt);
    });
  generate_dci_name();
}

function setLanguage(jsContent) {
  let opt = document.createElement("option");
  opt.value = "XX";
  opt.innerHTML = "No subtitles";
  dciElements.v_sub_language.appendChild(opt);

  jsContent.data.forEach((el) => {
    let opt1 = document.createElement("option");
    let opt2 = document.createElement("option");
    opt1.value = el.dcncTag;
    opt2.value = el.dcncTag;
    opt1.innerHTML = el.dcncLanguage;
    opt2.innerHTML = el.dcncLanguage;
    dciElements.v_audio_language.appendChild(opt1);
    dciElements.v_sub_language.appendChild(opt2);
  });

  if (fetch_count == 1) generate_dci_name();
  fetch_count--;
}

function generate_dci_name() {
  let dciName;

  // TTILE
  if (dciElements.v_movie_title.value != "") {
    dciName = capitalizeFirstLetter(dciElements.v_movie_title.value);
  } else {
    dciName = "MovieTitle";
  }

  if (dciName.length > 14) {
    dciElements.v_alert.innerHTML =
      "<strong>Movie title should be 14 characters max.</strong>";
    dciElements.v_alert.classList.remove("d-none");
  } else {
    dciElements.v_alert.classList.add("d-none");
  }

  // CONTENT MIDIFICATORS
  dciName += "_" + dciElements.v_content_type.value;

  if (dciElements.v_vers.value != "") {
    dciName += "-" + dciElements.v_vers.value;
  }

  if (dciElements.v_temp.checked) {
    dciName += "-Temp";
  }

  if (dciElements.v_prerelease.checked) {
    dciName += "-Pre";
  }

  if (dciElements.v_chain.value != "") {
    dciName += "-" + dciElements.v_chain.value;
  }

  if (dciElements.v_3d.value != "") {
    dciName += "-" + dciElements.v_3d.value;
  }

  if (dciElements.v_lum.value != "") {
    dciName += "-" + dciElements.v_lum.value + "fl";
  }

  if (dciElements.v_fps.value != "" && dciElements.v_fps.value != "24") {
    dciName += "-" + dciElements.v_fps.value;
  }

  // PROJECTION ASPECT RATIO
  dciName += "_" + dciElements.v_proj_aspect.value;

  if (dciElements.v_int_aspect.value != "None") {
    dciName += "-" + dciElements.v_int_aspect.value;
  }

  // LANGUAGE AND SUBTITLES
  if (
    dciElements.v_sub_tech.value == 2 && // Hard coded
    dciElements.v_sub_language.value != "XX"
  ) {
    dciName +=
      "_" +
      dciElements.v_audio_language.value +
      "-" +
      dciElements.v_sub_language.value.toLowerCase();
  } else {
    // Soft coded
    dciName +=
      "_" +
      dciElements.v_audio_language.value +
      "-" +
      dciElements.v_sub_language.value;
  }

  if (dciElements.v_ccap.checked) {
    dciName += "-CCAP";
  }

  if (dciElements.v_ocap.checked) {
    dciName += "-OCAP";
  }

  // TERRITORY AND RAITING
  if (dciElements.v_territory.value != "") {
    dciName +=
      "_" + dciElements.v_territory.value + "-" + dciElements.v_rating.value;
  }

  // AUDIO TYPE
  dciName += "_" + dciElements.v_audio_type.value;

  if (dciElements.v_hear_assist.checked) {
    dciName += "-HI";
  }

  if (dciElements.v_vis_assist.checked) {
    dciName += "-VI";
  }

  if (dciElements.v_sign_lang.checked) {
    dciName += "-SL";
  }

  if (dciElements.v_immersive.value != "") {
    dciName += "-" + dciElements.v_immersive.value;
  }

  if (dciElements.v_dbox.checked) {
    dciName += "-DBOX";
  }

  /*
  Array.from(dciElements.v_immersive.selectedOptions).forEach((option) => {
    dciName += "-" + option.value;
  });
  */

  // RESOLUTION
  dciName += "_" + dciElements.v_resolution.value;

  // STUDIO
  if (dciElements.v_studio.value != "") {
    dciName += "_" + dciElements.v_studio.value;
  }

  // CREATION DATE
  dciName +=
    "_" +
    dciElements.v_year.value +
    dciElements.v_month.value.padStart(2, "0") +
    dciElements.v_day.value.padStart(2, "0");

  // FACILITY
  if (dciElements.v_facility.value != "") {
    dciName += "_" + dciElements.v_facility.value;
  }

  // DCP STANDARD
  dciName += "_" + dciElements.v_standard.value;
  if (dciElements.v_3d.value == "3D") {
    dciName += "-3D";
  }

  // DCP PACKAGE TYPE
  dciName += "_" + dciElements.v_package_type.value;
  if (
    dciElements.v_vf_vers.value != "" &&
    dciElements.v_package_type.value == "VF"
  ) {
    dciName += "-" + dciElements.v_vf_vers.value;
  }

  dciElements.v_result.value = dciName;
}

function copy_to_clipboard() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(dciElements.v_result.value).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
  else {
    dciElements.v_result.select();
    document.execCommand("copy");
    console.log('execCommand: Copying to clipboard was successful!');
    dciElements.v_result.setSelectionRange(0, 0);
    dciElements.v_result.blur();
  }
}
