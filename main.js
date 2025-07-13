const username = "usedtire"; // <-- Replace this
const SIX_MONTHS_AGO = new Date(new Date().setMonth(new Date().getMonth() - 6));

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

function isRecent(dateStr) {
  const date = new Date(dateStr);
  return date >= SIX_MONTHS_AGO;
}

function formatDate(dateStr) {
  return dateStr.split("T")[0];
}

async function getCommitsForRepo(repo) {
  const commits = await fetchJSON(`https://api.github.com/repos/${username}/${repo.name}/commits?author=${username}&per_page=100`);
  return commits
    .filter(commit => commit.commit && isRecent(commit.commit.author.date))
    .map(commit => formatDate(commit.commit.author.date));
}

async function showCommitTimeline() {
  const repos = await fetchJSON(`https://api.github.com/users/${username}/repos?per_page=100`);
  const commitCounts = {};

  for (const repo of repos) {
    const dates = await getCommitsForRepo(repo);
    dates.forEach(date => {
      commitCounts[date] = (commitCounts[date] || 0) + 1;
    });
  }

  const labels = Object.keys(commitCounts).sort();
  const values = labels.map(date => commitCounts[date]);

  const ctx = document.createElement("canvas");
  document.getElementById("commit-chart").innerHTML = "";
  document.getElementById("commit-chart").appendChild(ctx);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Commits per Day (Last 6 Months)",
        data: values
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Commits' }, beginAtZero: true }
      }
    }
  });
}

// Run everything
showCommitTimeline();

// Keep the existing repo and starred sections
fetch(`https://api.github.com/users/${username}/starred`)
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('starred-list');
    data.slice(0, 10).forEach(repo => {
      const item = document.createElement('li');
      item.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.full_name}</a> - ⭐ ${repo.stargazers_count}`;
      list.appendChild(item);
    });
  });

fetch(`https://api.github.com/users/${username}/repos?sort=updated`)
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('repo-list');
    data.forEach(repo => {
      const item = document.createElement('li');
      item.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a> - ${repo.description || 'No description.'}`;
      list.appendChild(item);
    });
  });
