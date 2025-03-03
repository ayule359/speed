// jc.js
let items = [];
let filteredItems = [];
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadDefaultFile();
    initEventListeners();
    handleResize();
    window.addEventListener('resize', handleResize);
    toggleTheme();
});

function handleResize() {
    const container = document.querySelector('.container');
    const elements = ['.search-bar', '.content-frame'];
    elements.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.width = `${container.offsetWidth}px`;
    });
}

async function loadDefaultFile() {
    try {
        const response = await fetch('ItemList.txt');
        if (!response.ok) throw new Error('加载失败');
        const data = await response.text();
        processData(data);
        showToast('数据加载成功', 'success');
    } catch (error) {
        showToast('自动加载失败，请手动上传', 'error');
    }
}

function processData(data) {
    items = data.split('\n')
        .filter(line => line.trim())
        .map(line => {
            const [id, category, name, desc] = line.split('----');
            return { id: id?.trim(), category: category?.trim(), name: name?.trim(), desc: desc?.trim() };
        });
    filteredItems = [...items];
    updatePagination();
    renderItems();
}

function initEventListeners() {
    document.getElementById('searchInput').addEventListener('input', function() {
        document.getElementById('clearButton').style.opacity = this.value ? '1' : '0';
        filterItems();
    });

    document.getElementById('searchButton').addEventListener('click', filterItems);
    document.getElementById('jumpPage').addEventListener('keypress', e => e.key === 'Enter' && jumpToPage());
    document.getElementById('clearButton').addEventListener('click', clearSearch);
}

function filterItems() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    filteredItems = items.filter(item => 
        item.id.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
    );
    currentPage = 1;
    updatePagination();
    renderItems();
}

function renderItems() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const container = document.getElementById('itemContainer');
    
    container.innerHTML = filteredItems.slice(start, end).map(item => `
        <div class="item">
            <img src="https://iips.speed.qq.com/images/${item.id}.png" alt="${item.name}" onerror="this.src='0.png'">
            <div class="info">
                <p><strong>ID：</strong>${item.id}</p>
                <p><strong>类别：</strong>${item.category}</p>
                <p><strong>名称：</strong>${item.name}</p>
                <p><strong>描述：</strong>${item.desc}</p>
            </div>
        </div>
    `).join('');
}

function updatePagination() {
    totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('jumpPage').max = totalPages;
}

function goToPage(page) {
    currentPage = Math.max(1, Math.min(page, totalPages));
    renderItems();
    updatePagination();
}

function jumpToPage() {
    const input = document.getElementById('jumpPage');
    const page = parseInt(input.value);
    if (page >= 1 && page <= totalPages) goToPage(page);
    else showToast('请输入有效页码', 'warning');
    input.value = '';
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearButton').style.opacity = '0';
    filterItems();
}

function handleFileUpload(files) {
    const reader = new FileReader();
    reader.onload = e => processData(e.target.result);
    reader.onerror = () => showToast('文件读取失败', 'error');
    reader.readAsText(files[0]);
}

function toggleTheme() {
    document.body.classList.toggle('night-mode');
    const themeBtn = document.querySelector('[onclick="toggleTheme()"]');
    themeBtn.textContent = document.body.classList.contains('night-mode') ? '☀️' : '🌙';
}

function toggleSettings() {
    const menu = document.getElementById('settingsMenu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }, 50);
}