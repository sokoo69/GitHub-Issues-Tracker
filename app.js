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