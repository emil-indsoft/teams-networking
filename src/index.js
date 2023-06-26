import "./style.css";

function $(selector) {
  return document.querySelector(selector);
}

function getTeamAsHTML(team) {
  return `<tr>
    <td>${team.promotion}</td>
    <td>${team.members}</td>
    <td>${team.name}</td>
    <td>${team.url}</td>
    <td>&#10006 &#9998;</td>
  </tr>`;
}

function displayTeams(teams) {
  const teamsHTML = teams.map(getTeamAsHTML);
  console.warn("teamsHTML", teamsHTML);
  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

function loadTeams() {
  fetch("teams.json")
    .then(r => r.json())
    .then(teams => {
      displayTeams(teams);
    });
}

loadTeams();
