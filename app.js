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
    loadingSpinner.classList.remove('hidden');
    issuesGrid.classList.add('hidden');
    noResults.classList.add('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
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
        issuesGrid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');
    issuesGrid.classList.remove('hidden');

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
        card.className = `card bg-base-100 shadow-md issue-card ${borderClass}`;
        card.innerHTML = `
            <div class="card-body p-5">
                <div class="flex items-center justify-between mb-3">
                    <img src="${statusIcon}" alt="${issue.status}" class="w-8 h-8">
                    <span class="priority-badge ${priorityClass}">${issue.priority.toUpperCase()}</span>
                </div>
                <h2 class="card-title text-base font-bold issue-title-link" onclick="openModal(${issue.id})">
                    ${issue.title}
                </h2>
                <p class="text-sm text-gray-500 mt-1 line-clamp-2">${issue.description}</p>

                <div class="flex gap-2 mt-4">
                    ${labelsHTML}
                </div>

                <div class="mt-4 pt-3 border-t border-gray-100">
                    <p class="text-sm text-gray-600 font-medium">#${issue.id} by ${issue.author}</p>
                    <p class="text-sm text-gray-400">${formatDateShort(issue.createdAt)}</p>
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
async function fetchAllIssues() {
    showLoading();
    try {
        const res = await fetch(`${API_BASE}/issues`);
        const json = await res.json();
        allIssues = json.data;
        updateCounts(allIssues);
        const filtered = filterIssues(currentTab);
        renderIssues(filtered);
    } catch (err) {
        hideLoading();
        console.error('Error fetching issues:', err);
        noResults.classList.remove('hidden');
    }
}

async function openModal(id) {
    modalContent.innerHTML = `
        <div class="flex justify-center py-10">
            <span class="loading loading-spinner loading-md"></span>
        </div>
    `;
    modal.showModal();

    try {
        const res = await fetch(`${API_BASE}/issue/${id}`);
        const json = await res.json();
        const issue = json.data;

        const statusClass = issue.status === 'open' ? 'modal-status-open' : 'modal-status-closed';
        const statusText = issue.status.charAt(0).toUpperCase() + issue.status.slice(1);
        const labelsHTML = issue.labels
            .map(l => {
                const colorClass = getLabelColorClass(l);
                return `<span class="label-badge-styled ${colorClass}">${l.toUpperCase()}</span>`;
            })
            .join(' ');

        modalContent.innerHTML = `
            <h3 class="font-bold text-xl mb-3">${issue.title}</h3>
            <div class="flex items-center gap-2 text-sm mb-4">
                <span class="${statusClass} font-semibold px-3 py-1 rounded-full text-xs">${statusText}</span>
                <span class="text-gray-400">•</span>
                <span class="text-gray-500">Opened by ${issue.author}</span>
                <span class="text-gray-400">•</span>
                <span class="text-gray-500">${formatDateShort(issue.createdAt)}</span>
            </div>
            <div class="flex flex-wrap gap-2 mb-4">
                ${labelsHTML}
            </div>
            <p class="text-gray-600 text-sm mb-6">${issue.description}</p>
            <div class="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                    <p class="text-xs text-gray-400">Assignee:</p>
                    <p class="font-semibold text-sm">${issue.assignee || 'Unassigned'}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-400">Priority:</p>
                    <span class="priority-badge ${getPriorityClass(issue.priority)}">${issue.priority.toUpperCase()}</span>
                </div>
            </div>
            <div class="flex justify-end mt-6">
                <button class="btn btn-primary btn-sm" onclick="document.getElementById('issueModal').close()">Close</button>
            </div>
        `;
    } catch (err) {
        modalContent.innerHTML = `<p class="text-error">Failed to load issue details.</p>`;
        console.error('Error fetching issue:', err);
    }
}

async function searchIssues(query) {
    if (!query.trim()) {
        currentTab = 'all';
        setActiveTab('all');
        const filtered = filterIssues(currentTab);
        renderIssues(filtered);
        updateCounts(allIssues);
        return;
    }

    showLoading();
    try {
        const res = await fetch(`${API_BASE}/issues/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        const results = json.data;
        updateCounts(results);
        issueCount.textContent = `${results.length} Results`;
        renderIssues(results);
    } catch (err) {
        hideLoading();
        console.error('Search error:', err);
        noResults.classList.remove('hidden');
    }
}

function setActiveTab(tab) {
    tabs.forEach(t => {
        t.classList.remove('tab-active');
        if (t.dataset.tab === tab) {
            t.classList.add('tab-active');
        }
    });
}
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        currentTab = tab.dataset.tab;
        setActiveTab(currentTab);
        searchInput.value = '';
        const filtered = filterIssues(currentTab);
        renderIssues(filtered);

        const open = allIssues.filter(i => i.status === 'open').length;
        const closed = allIssues.filter(i => i.status === 'closed').length;
        issueCount.textContent = `${filtered.length} Issues`;
        openCount.textContent = `${open} Open`;
        closedCount.textContent = `${closed} Closed`;
    });
});

openMarker.addEventListener('click', () => {
    currentTab = 'open';
    setActiveTab('open');
    searchInput.value = '';
    const filtered = filterIssues(currentTab);
    renderIssues(filtered);
    issueCount.textContent = `${filtered.length} Issues`;
});

closedMarker.addEventListener('click', () => {
    currentTab = 'closed';
    setActiveTab('closed');
    searchInput.value = '';
    const filtered = filterIssues(currentTab);
    renderIssues(filtered);
    issueCount.textContent = `${filtered.length} Issues`;
});


searchBtn.addEventListener('click', () => {
    searchIssues(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchIssues(searchInput.value);
    }
});

fetchAllIssues();