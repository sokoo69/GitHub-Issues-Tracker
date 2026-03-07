if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';

const issuesGrid = document.getElementById('issuesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResults = document.getElementById('noResults');
const issueCount = document.getElementById('issueCount');
const openCount = document.getElementById('openCount');
const closedCount = document.getElementById('closedCount');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const tabs = document.querySelectorAll('.tab');
const modal = document.getElementById('issueModal');
const modalContent = document.getElementById('modalContent');
const openMarker = document.getElementById('openMarker');
const closedMarker = document.getElementById('closedMarker');

let allIssues = [];
let currentTab = 'all';

function showLoading() {
    loadingSpinner.style.display = 'block';
    issuesGrid.style.display = 'none';
    noResults.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function getPriorityClass(priority) {
    switch (priority) {
        case 'high': return 'priority-high';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return '';
    }
}

function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function getLabelColorClass(label) {
    const l = label.toLowerCase();
    switch (l) {
        case 'bug': return 'label-red';
        case 'help wanted': return 'label-yellow';
        case 'enhancement': return 'label-blue';
        case 'good first issue': return 'label-green';
        case 'documentation': return 'label-purple';
        case 'wontfix': return 'label-gray';
        case 'question': return 'label-orange';
        case 'invalid': return 'label-red';
        case 'duplicate': return 'label-gray';
        default: return 'label-yellow';
    }
}
function renderIssues(issues) {
    hideLoading();
    issuesGrid.innerHTML = '';

    if (issues.length === 0) {
        issuesGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    issuesGrid.style.display = 'grid';

    issues.forEach(issue => {
        const borderClass = issue.status === 'open' ? 'card-open' : 'card-closed';
        const statusIcon = issue.status === 'open'
            ? 'assets/Open-Status.png'
            : 'assets/Closed-Status.png';
        const priorityClass = getPriorityClass(issue.priority);

        const labelsHTML = issue.labels
            .map(label => {
                const colorClass = getLabelColorClass(label);
                return `<span class="label-badge-styled ${colorClass}">${label.toUpperCase()}</span>`;
            })
            .join(' ');

        const card = document.createElement('div');
        card.className = `issue-card ${borderClass}`;
        card.innerHTML = `
            <div>
                <div>
                    <img src="${statusIcon}" alt="${issue.status}">
                    <span class="priority-badge ${priorityClass}">${issue.priority.toUpperCase()}</span>
                </div>
                <h2 class="issue-title-link" onclick="openModal(${issue.id})">
                    ${issue.title}
                </h2>
                <p>${issue.description}</p>

                <div>
                    ${labelsHTML}
                </div>

                <div>
                    <p>#${issue.id} by ${issue.author}</p>
                    <p>${formatDateShort(issue.createdAt)}</p>
                </div>
            </div>
        `;
        issuesGrid.appendChild(card);
    });
}

function updateCounts(issues) {
    const open = issues.filter(i => i.status === 'open').length;
    const closed = issues.filter(i => i.status === 'closed').length;

    issueCount.textContent = `${issues.length} Issues`;
    openCount.textContent = `Open`;
    closedCount.textContent = `Closed`;
}

function filterIssues(tab) {
    if (tab === 'all') return allIssues;
    return allIssues.filter(issue => issue.status === tab);
}

fetchAllIssues();