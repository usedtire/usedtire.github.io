
const username = "your-github-username"; // Replace this with your GitHub username

// Fetch Starred Repositories
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

// Fetch Public Repositories
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

// Fetch Commit Activity and Display Chart
fetch(`https://api.github.com/users/${username}/events/public`)
  .then(res => res.json())
  .then(events => {
    const commitCounts = {};

    events.forEach(event => {
      if (event.type === "PushEvent") {
        const date = new Date(event.created_at).toISOString().split("T")[0];
        commitCounts[date] = (commitCounts[date] || 0) + event.payload.commits.length;
      }
    });

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
          label: "Commits per Day",
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
  });
