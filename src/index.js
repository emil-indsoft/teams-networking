import "./style.css";
import { loadTeamsRequest, createTeamRequest, deleteTeamRequest, updateTeamRequest } from "./middleware";
import { $, filterElements, mask, unmask, debounce, sleep, $$ } from "./utilities";
//import { debounce } from "lodash"; //bad dont import all functions
//import * as middleware from "./middleware";
/// middleware.loadTeamRequest
//import debounce from "lodash/debounce"; // better  -  import only the needed function

let editId;
let allTeams = [];
const form = "#teamsForm";

function getTeamAsHTML({ id, promotion, members, name, url }) {
  const displayUrl = url.startsWith("https://github.com/") ? url.substring(19) : url;
  return `<tr>
    <td style="text-align: center">
      <input type="checkbox" name="selected" value="${id}"/>
    </td>
    <td>${promotion}</td>
    <td>${members}</td>
    <td>${name}</td>
    <td><a href="${url}" target="_blank">${displayUrl}</a></td>
    <td>
      <button type="button" data-id="${id}" class="action-btn edit-btn">&#9998;</a>
      <button type="button" data-id="${id}" class="action-btn remove-btn">✖</a>
    </td>
  </tr>`;
}

function getTeamAsHTMLInputs({ id, promotion, members, name, url }) {
  return `<tr>
    <td style="text-align: center">
      <input type="checkbox" name="selected" value="${id}"/>
    </td>
    <td>
      <input type="text" name="promotion" value="${promotion}" placeholder="Enter promotion" required />
    </td>
    <td>
      <input type="text" name="members" value="${members}" placeholder="Enter member" required />
    </td>
    <td>
      <input type="text" name="name" value="${name}" placeholder="Enter project" required />
    </td>
    <td>
      <input type="text" name="url" value="${url}" placeholder="Enter url" required />
    </td>
    <td>
      <button type="submit" class="action-btn">💾</button>
      <button type="reset" class="action-btn">✖</button>
  </td>
  </tr>`;
}

let previewDisplayTeams = [];

function displayTeams(teams, editId) {
  if (!editId && teams === previewDisplayTeams) {
    console.warn("same teams already displayed");
    return;
  }

  if (!editId && teams.length === previewDisplayTeams.length) {
    if (teams.every((team, i) => team === previewDisplayTeams[i])) {
      console.warn("same content");
      return;
    }
  }

  previewDisplayTeams = teams;
  console.warn("displayTeams", teams);
  const teamsHTML = teams.map(team => (team.id == editId ? getTeamAsHTMLInputs(team) : getTeamAsHTML(team)));
  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

/**
 *
 * @returns {Promise<{id: string, promotion: string}[]>}
 */
function loadTeams() {
  return loadTeamsRequest().then(teams => {
    allTeams = teams;
    displayTeams(teams);
    return teams;
  });
}

function startEdit(id) {
  editId = id;
  //const team = allTeams.find(team => team.id == id);
  //setTeamValues(team);
  displayTeams(allTeams, id);
}

function setTeamValues({ promotion, members, name, url }) {
  $("#promotion").value = promotion;
  $("#members").value = members;
  $("input[name=name]").value = name;
  $("input[name=url]").value = url;
}

function getTeamValues() {
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("input[name=name]").value;
  const url = $("input[name=url]").value;
  return {
    promotion,
    members,
    name: name,
    url: url
  };
}

async function onSubmit(e) {
  e.preventDefault();

  const team = getTeamValues();

  mask(form);
  let status;

  if (editId) {
    team.id = editId;
    console.warn("BEFORE");
    console.time("UPDATE");
    status = await updateTeamRequest(team);
    console.timeEnd("UPDATE");
    console.warn("AFTER");
    if (status.success) {
      allTeams = allTeams.map(t => {
        if (t.id === editId) {
          console.warn("team", team);
          // return team;
          // return { ...team };
          return {
            ...t,
            ...team
          };
        }
        return t;
      });
    }
  } else {
    status = await createTeamRequest(team);
    if (status.success) {
      //console.info("saved", JSON.parse(JSON.stringify(team)));
      team.id = status.id;
      allTeams = [...allTeams, team];
    }
  }

  if (status.success) {
    displayTeams(allTeams);
    $("#teamsForm").reset();
    unmask(form);
  }
}

async function removeSelected() {
  mask("#main");
  //console.time("remove");
  const selected = $$("input[name=selected]:checked");
  const ids = [...selected].map(input => input.value);
  const promises = ids.map(id => deleteTeamRequest(id));
  promises.push(sleep(2000));
  const statuses = await Promise.allSettled(promises);
  console.warn("statuses:", statuses);
  //console.timeEnd("remove");
  await loadTeams();
  unmask("#main");
}

function initEvents() {
  $("#removeSelected").addEventListener("click", debounce(removeSelected, 400));
  $("#searchTeams").addEventListener(
    "input",
    debounce(function (e) {
      const teams = filterElements(allTeams, e.target.value);
      displayTeams(teams);
    }, 400)
  );

  $("#selectAll").addEventListener("input", e => {
    $$("input[name=selected]").forEach(check => {
      check.checked = e.target.checked;
    });
  });

  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches(".remove-btn")) {
      const id = e.target.dataset.id;
      //console.warn("remove %o", id);
      mask(form);
      deleteTeamRequest(id, async ({ success }) => {
        if (success) {
          await loadTeams();
          unmask(form);
        }
      });
    } else if (e.target.matches(".edit-btn")) {
      const id = e.target.dataset.id;
      startEdit(id);
    }
  });

  $("#teamsForm").addEventListener("submit", onSubmit);
  $("#teamsForm").addEventListener("reset", () => {
    displayTeams(allTeams);
    console.warn("reset");
    editId = undefined;
  });
}

initEvents();

(async () => {
  mask(form);
  await loadTeams();
  unmask(form);
})();
