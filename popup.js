// DOM Elements
let userAvatar = document.getElementById('user-avatar');
let username = document.getElementById('username');
let userStatus = document.getElementById('user-status');
let totalFriends = document.getElementById('total-friends');
let addedCount = document.getElementById('added-count');
let deletedCount = document.getElementById('deleted-count');
let lastCheck = document.getElementById('last-check');

let changesTab = document.getElementById('changes-tab');
let historyTab = document.getElementById('history-tab');
let noChanges = document.getElementById('no-changes');
let changesList = document.getElementById('changes-list');
let noHistory = document.getElementById('no-history');
let historyList = document.getElementById('history-list');

let addedSection = document.getElementById('added-section');
let deletedSection = document.getElementById('deleted-section');
let addedListEl = document.getElementById('added-list');
let deletedListEl = document.getElementById('deleted-list');

let refreshBtn = document.getElementById('refresh-btn');
let clearBtn = document.getElementById('clear-btn');
let tabBtns = document.querySelectorAll('.tab-btn');

// Re-initialize DOM elements (fallback)
function reinitializeElements() {
    console.log('🔄 Re-initializing DOM elements...');
    
    userAvatar = document.getElementById('user-avatar');
    username = document.getElementById('username');
    userStatus = document.getElementById('user-status');
    totalFriends = document.getElementById('total-friends');
    addedCount = document.getElementById('added-count');
    deletedCount = document.getElementById('deleted-count');
    lastCheck = document.getElementById('last-check');

    changesTab = document.getElementById('changes-tab');
    historyTab = document.getElementById('history-tab');
    noChanges = document.getElementById('no-changes');
    changesList = document.getElementById('changes-list');
    noHistory = document.getElementById('no-history');
    historyList = document.getElementById('history-list');

    addedSection = document.getElementById('added-section');
    deletedSection = document.getElementById('deleted-section');
    addedListEl = document.getElementById('added-list');
    deletedListEl = document.getElementById('deleted-list');

    refreshBtn = document.getElementById('refresh-btn');
    clearBtn = document.getElementById('clear-btn');
    tabBtns = document.querySelectorAll('.tab-btn');
    
    console.log('🔄 Re-initialization completed');
}

// Check if all elements exist
function checkElements() {
    console.log('🔍 Checking DOM elements...');
    
    // Debug individual elements
    console.log('userAvatar:', userAvatar, 'ID: user-avatar');
    console.log('username:', username, 'ID: username');
    console.log('userStatus:', userStatus, 'ID: user-status');
    console.log('lastCheck:', lastCheck, 'ID: last-check');
    
    const elements = {
        userAvatar, username, userStatus, totalFriends, addedCount, deletedCount, lastCheck,
        changesTab, historyTab, noChanges, changesList, noHistory, historyList,
        addedSection, deletedSection, addedListEl, deletedListEl, refreshBtn, clearBtn
    };
    
    const missing = [];
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            missing.push(name);
            console.log(`❌ Missing element: ${name}`);
        } else {
            console.log(`✅ Found element: ${name}`);
        }
    }
    
    if (missing.length > 0) {
        console.error('❌ Missing DOM elements:', missing);
        console.log('📄 Current HTML body:', document.body.innerHTML.substring(0, 500) + '...');
        return false;
    }
    
    if (tabBtns.length === 0) {
        console.error('❌ No tab buttons found');
        return false;
    }
    
    console.log('✅ All DOM elements found');
    return true;
}

// Access token for Facebook Graph API (backup)
const FB_ACCESS_TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

// Alternative Graph API approach without token
const getFacebookAvatar = (uid) => {
    // Try multiple avatar URLs
    const avatarUrls = [
        `https://graph.facebook.com/${uid}/picture?type=square&width=50&height=50`,
        `https://graph.facebook.com/${uid}/picture?type=small`,
        `https://graph.facebook.com/${uid}/picture`,
        `https://www.facebook.com/tr?id=${uid}&ev=PageView&noscript=1`
    ];
    
    return avatarUrls[0]; // Use first as primary
};

// Enhanced message sending with error handling
const sendMessageToBackground = async (message, timeout = 5000) => {
    try {
        console.log('📡 Sending message to background:', message);
        
        // Check if runtime is available
        if (!chrome.runtime || !chrome.runtime.sendMessage) {
            throw new Error('Chrome runtime not available');
        }
        
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Message timeout after ${timeout}ms`));
            }, timeout);
            
            chrome.runtime.sendMessage(message, (response) => {
                clearTimeout(timeoutId);
                
                // Check for runtime errors
                if (chrome.runtime.lastError) {
                    console.error('❌ Runtime error:', chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                
                console.log('📡 Background response:', response);
                resolve(response);
            });
        });
    } catch (error) {
        console.error('❌ Error sending message:', error);
        throw error;
    }
};

// Enhanced message listener setup
const setupMessageListener = () => {
    // Remove any existing listeners first
    if (chrome.runtime.onMessage.hasListeners()) {
        chrome.runtime.onMessage.removeListener(handleBackgroundMessage);
    }
    
    // Add new listener
    chrome.runtime.onMessage.addListener(handleBackgroundMessage);
    console.log('📻 Message listener set up');
};

// Message handler
const handleBackgroundMessage = (message, sender, sendResponse) => {
    console.log('📻 Received message:', message);
    
    try {
        if (message.action === 'ScanDone') {
            console.log('✅ Scan completed signal received');
            // Handle scan completion
            return true; // Keep message channel open
        }
        
        if (message.action === 'UpdateUI') {
            console.log('🔄 UI update requested');
            loadUserData();
            return true;
        }
        
        if (message.action === 'Error') {
            console.error('❌ Background error:', message.error);
            showError(message.error);
            return true;
        }
    } catch (error) {
        console.error('❌ Error handling message:', error);
    }
    
    return false; // Close message channel
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Popup initialized, starting load...');
    console.log('📄 Document ready state:', document.readyState);
    console.log('📄 Document body exists:', !!document.body);
    
    // Set up message listener first
    setupMessageListener();
    
    // Add small delay to ensure DOM is fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try re-initializing elements first
    reinitializeElements();
    
    // Check if all DOM elements exist first
    if (!checkElements()) {
        console.error('❌ DOM elements missing, cannot initialize');
        
        // Try to find basic elements manually
        const basicCheck = {
            'user-avatar': document.getElementById('user-avatar'),
            'username': document.getElementById('username'),
            'user-status': document.getElementById('user-status'),
            'last-check': document.getElementById('last-check')
        };
        
        console.log('🔍 Manual element check:', basicCheck);
        
        const statusEl = document.getElementById('user-status');
        if (statusEl) {
            statusEl.textContent = 'Lỗi: Không tìm thấy thành phần giao diện';
        }
        return;
    }
    
    try {
        await loadUserData();
        setupEventListeners();
        showTab('changes'); // Default tab
        console.log('✅ Popup setup completed');
    } catch (error) {
        console.error('❌ Popup initialization failed:', error);
        showError(error.message);
    }
});

// Event Listeners
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    if (!userAvatar || !refreshBtn || !clearBtn) {
        console.error('❌ Cannot setup event listeners - missing elements');
        return;
    }
    
    // Avatar click to refresh user info
    userAvatar.addEventListener('click', async () => {
        console.log('🔄 Avatar clicked - refreshing user info');
        await refreshUserInfo();
    });
    
    userAvatar.style.cursor = 'pointer';
    userAvatar.title = 'Nhấp để làm mới thông tin tài khoản';
    
    // Tab switching
    tabBtns.forEach((btn, index) => {
        console.log(`🔧 Setting up tab button ${index}:`, btn.dataset.tab);
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            console.log('📑 Switching to tab:', tabName);
            showTab(tabName);
        });
    });

    // Refresh button
    refreshBtn.addEventListener('click', async () => {
        console.log('🔄 Deep scan button clicked');
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '🔄 Đang quét... <span class="loading"></span>';
        userStatus.textContent = 'Đang quét sâu danh sách bạn bè...';
        
        try {
            console.log('📡 Sending CheckNow message to background...');
            const response = await sendMessageToBackground({ action: 'CheckNow' });
            console.log('📡 Background response:', response);

            // Wait for explicit ScanDone signal with enhanced listener
            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('Scan timeout after 30 seconds'));
                }, 30000);
                
                const handler = (msg, sender, sendResponse) => {
                    if (msg && msg.action === 'ScanDone') {
                        clearTimeout(timeoutId);
                        chrome.runtime.onMessage.removeListener(handler);
                        resolve();
                        return true;
                    }
                    return false;
                };
                
                chrome.runtime.onMessage.addListener(handler);
            });

            console.log('📊 Reloading user data...');
            await loadUserData();
            userStatus.textContent = 'Quét hoàn tất!';
            console.log('✅ Deep scan completed successfully');
        } catch (error) {
            console.error('❌ Error during deep scan:', error);
            userStatus.textContent = `Lỗi khi quét: ${error.message}`;
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '🔄 Quét sâu';
        }
    });

    // Clear history button
    clearBtn.addEventListener('click', async () => {
        console.log('🗑️ Clear history button clicked');
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử?')) {
            try {
                console.log('🧹 Clearing history...');
                await chrome.storage.local.set({ 
                    history: { list: [] },
                    pending: { added: [], deleted: [], friendsTemp: {} }
                });
                await loadUserData();
                userStatus.textContent = 'Đã xóa lịch sử';
                console.log('✅ History cleared successfully');
            } catch (error) {
                console.error('❌ Error clearing history:', error);
            }
        }
    });
    
    console.log('✅ Event listeners setup completed');
}

// Load user data from background
async function loadUserData() {
    console.log('📥 Loading user data from background...');
    try {
        // Get data from background script
        console.log('📡 Sending GetResults message...');
        const response = await sendMessageToBackground({ action: 'GetResults' });
        
        console.log('📦 Full extension response:', response);
        
        if (!response) {
            console.log('❌ No response from background script');
            showError('Không nhận được phản hồi từ background script');
            return;
        }
        
        if (!response.payload) {
            console.log('⚠️ No payload found, user might not be logged in');
            console.log('📊 Response structure:', Object.keys(response));
            showLoginRequired();
            return;
        }

        console.log('👤 User payload received:', response.payload);
        console.log('📊 Payload structure:', Object.keys(response.payload));
        console.log('📊 Pending changes:', response.pending);
        
        // Get history data to calculate total stats
        const historyResponse = await sendMessageToBackground({ action: 'getHistory' });
        const historyData = historyResponse?.history || { list: [] };
        
        console.log('📜 History data received:', historyData);
        console.log('📜 History count - Added:', historyData.list?.filter(item => item.reason === 'ADDED').length || 0);
        console.log('📜 History count - Deleted:', historyData.list?.filter(item => item.reason === 'DELETED').length || 0);
        
        updateUserInfo(response.payload);
        updateStats({ ...response, history: historyData });
        updateChanges(response.pending || {});
        await updateHistoryFromStorage(); // Load fresh history data
        updateLastCheck();
        
        // Don't auto-move pending changes anymore - let user control when to update
        // This prevents the accumulation issue when scanning multiple times
        
        console.log('✅ User data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading user data:', error);
        console.error('❌ Error stack:', error.stack);
        showError();
    }
}

// Show login required message
function showLoginRequired() {
    console.log('User not logged in to Facebook');
    username.textContent = 'Vui lòng đăng nhập Facebook';
    userStatus.textContent = 'Mở Facebook trong tab mới và đăng nhập';
    userAvatar.src = './icons/ic_48.png';
    
    // Show no data messages
    noChanges.querySelector('p').textContent = 'Vui lòng đăng nhập Facebook trước';
    noChanges.querySelector('small').textContent = 'Mở facebook.com và đăng nhập, sau đó nhấn Quét sâu';
    
    noHistory.querySelector('p').textContent = 'Vui lòng đăng nhập Facebook';
    noHistory.querySelector('small').textContent = 'Lịch sử sẽ có sau khi đăng nhập';
    
    // Add login button functionality
    refreshBtn.innerHTML = '🔓 Cần đăng nhập';
    refreshBtn.onclick = () => {
        chrome.tabs.create({ url: 'https://facebook.com' });
    };
}

// Refresh user info
async function refreshUserInfo() {
    try {
        userStatus.textContent = 'Đang làm mới thông tin...';
        
        // Clear cached user info to force refresh
        await chrome.storage.local.set({ 
            payload: { 
                ...await chrome.storage.local.get(['payload']).then(data => data.payload || {}),
                name: null,
                photo: null
            }
        });
        
        // Reload user data
        await loadUserData();
        
        userStatus.textContent = 'Đã làm mới thông tin';
        setTimeout(() => {
            userStatus.textContent = 'Đang theo dõi thay đổi Facebook';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error refreshing user info:', error);
        userStatus.textContent = 'Lỗi khi làm mới thông tin';
    }
}

// Display error message to user
function showError(message = 'Không thể tải dữ liệu. Vui lòng thử lại.') {
    console.error('🚨 Showing error:', message);
    
    if (username) {
        username.textContent = 'Lỗi';
    }
    
    if (userStatus) {
        userStatus.textContent = `❌ ${message}`;
        userStatus.style.color = '#e74c3c';
    }
    
    if (userAvatar) {
        userAvatar.src = './icons/ic_48.png';
    }
    
    // Reset status after 5 seconds
    setTimeout(() => {
        if (userStatus) {
            userStatus.textContent = 'Đang theo dõi thay đổi Facebook';
            userStatus.style.color = '';
        }
    }, 5000);
}

// Update user info
function updateUserInfo(payload) {
    console.log('👤 Updating user info with payload:', payload);
    console.log('📊 Payload keys:', Object.keys(payload));
    
    let userName = 'Đang tải...';
    let userPhoto = './icons/ic_48.png';
    
    // Try to get user name from different sources
    if (payload.name && payload.name !== '' && payload.name !== 'undefined' && payload.name !== 'Người dùng') {
        userName = payload.name;
    } else if (payload.uid) {
        // Try to get from UID if available
        userName = `User ${payload.uid}`;
        // Try to fetch name asynchronously
        fetchUserNameAsync(payload.uid);
    }
    
    username.textContent = userName;
    userStatus.textContent = 'Đang theo dõi thay đổi Facebook';
    
    console.log('👤 User name set to:', userName);
    
    // Try multiple avatar sources with fallback chain
    if (payload.photo && payload.photo !== '' && payload.photo !== 'undefined' && !payload.photo.includes('silhouette')) {
        console.log('🖼️ Using payload photo:', payload.photo);
        userPhoto = payload.photo;
    } else if (payload.uid && payload.uid !== '' && payload.uid !== 'undefined') {
        console.log('🖼️ Using Facebook Graph API for UID:', payload.uid);
        userPhoto = getFacebookAvatar(payload.uid);
    }
    
    userAvatar.src = userPhoto;
    
    // Handle avatar load errors with fallback chain
    userAvatar.onerror = function() {
        console.log('❌ Avatar failed to load:', this.src);
        
        if (payload.uid && !this.src.includes('access_token')) {
            // Try with different Graph API formats
            const fallbackUrls = [
                `https://graph.facebook.com/${payload.uid}/picture?type=large`,
                `https://graph.facebook.com/${payload.uid}/picture?type=normal`,
                `https://graph.facebook.com/${payload.uid}/picture?type=small`,
                './icons/ic_48.png'
            ];
            
            const currentIndex = fallbackUrls.findIndex(url => this.src.includes(url.split('?')[0]));
            if (currentIndex >= 0 && currentIndex < fallbackUrls.length - 1) {
                this.src = fallbackUrls[currentIndex + 1];
            } else {
                this.src = './icons/ic_48.png';
                this.onerror = null; // Prevent infinite loop
            }
        } else {
            this.src = './icons/ic_48.png';
            this.onerror = null; // Prevent infinite loop
        }
    };
    
    // Handle avatar load success
    userAvatar.onload = function() {
        console.log('✅ Avatar loaded successfully:', this.src);
    };
    
    console.log('✅ User info update completed');
}

// Fetch user name asynchronously
async function fetchUserNameAsync(uid) {
    try {
        const response = await sendMessageToBackground({ 
            action: 'getUserName', 
            uid: uid 
        });
        
        if (response?.name && response.name !== 'Người dùng') {
            username.textContent = response.name;
            console.log('✅ Updated username asynchronously:', response.name);
        }
    } catch (error) {
        console.log('❌ Failed to fetch username asynchronously:', error);
    }
}

// Update stats
function updateStats(data) {
    console.log('📊 Updating stats with data:', data);
    const { payload, pending, history } = data;
    
    if (payload?.friends) {
        const detectedCount = Object.keys(payload.friends).length;
        totalFriends.textContent = detectedCount;
        
        console.log('👥 Total friends detected:', detectedCount);
        console.log('👥 Friends object keys:', Object.keys(payload.friends).slice(0, 5), '...');
        
        // Add tooltip hint about potential difference
        totalFriends.parentElement.title = `Phát hiện: ${detectedCount} bạn\nLưu ý: Có thể khác với số Facebook do cài đặt riêng tư`;
    } else {
        console.log('⚠️ No friends data in payload');
        totalFriends.textContent = '0';
    }
    
    // Calculate total added and deleted from history only (not including pending)
    let totalAdded = 0;
    let totalDeleted = 0;
    
    // Count from history
    if (history?.list) {
        totalAdded = history.list.filter(item => item.reason === 'ADDED').length;
        totalDeleted = history.list.filter(item => item.reason === 'DELETED').length;
    }
    
    // Log pending changes for debugging but don't add to total
    if (pending) {
        const pendingAdded = pending.added ? pending.added.length : 0;
        const pendingDeleted = pending.deleted ? pending.deleted.length : 0;
        
        console.log('➕ Pending added:', pendingAdded, 'Historical total added:', totalAdded);
        console.log('➖ Pending deleted:', pendingDeleted, 'Historical total deleted:', totalDeleted);
        
        if (pendingAdded > 0) {
            console.log('➕ Pending added friends:', pending.added);
        }
        if (pendingDeleted > 0) {
            console.log('➖ Pending deleted friends:', pending.deleted);
        }
    }
    
    document.getElementById('added-count').textContent = totalAdded;
    document.getElementById('deleted-count').textContent = totalDeleted;
    
    console.log('✅ Stats update completed - Historical Added:', totalAdded, 'Historical Deleted:', totalDeleted);
}

// Update changes tab
function updateChanges(pending) {
    console.log('🔄 Updating changes with pending:', pending);
    
    const hasAdded = pending.added && pending.added.length > 0;
    const hasDeleted = pending.deleted && pending.deleted.length > 0;
    
    if (!hasAdded && !hasDeleted) {
        noChanges.style.display = 'block';
        changesList.style.display = 'none';
        return;
    }
    
    noChanges.style.display = 'none';
    changesList.style.display = 'block';
    
    // Show added friends
    if (hasAdded) {
        addedSection.style.display = 'block';
        addedSection.querySelector('.section-title').textContent = `👋 Vừa thêm bạn (${pending.added.length})`;
        addedListEl.innerHTML = '';
        
        pending.added.forEach(uid => {
            const friend = pending.friendsTemp?.[uid];
            if (friend) {
                addedListEl.appendChild(createFriendItem(friend, 'added', 'Vừa xảy ra'));
            }
        });
    } else {
        addedSection.style.display = 'none';
    }
    
    // Show deleted friends
    if (hasDeleted) {
        deletedSection.style.display = 'block';
        deletedSection.querySelector('.section-title').textContent = `💔 Vừa xóa bạn (${pending.deleted.length})`;
        deletedListEl.innerHTML = '';
        
        // Use deletedFriendsInfo if available, otherwise fallback to old method
        if (pending.deletedFriendsInfo && pending.deletedFriendsInfo.length > 0) {
            pending.deletedFriendsInfo.forEach(friendInfo => {
                deletedListEl.appendChild(createFriendItem(friendInfo, 'deleted', 'Vừa xảy ra'));
            });
        } else {
            // Fallback for old format
            pending.deleted.forEach(uid => {
                const friend = { 
                    uid, 
                    name: 'Người dùng đã xóa', 
                    photo: './icons/ic_32.png' 
                };
                deletedListEl.appendChild(createFriendItem(friend, 'deleted', 'Vừa xảy ra'));
            });
        }
    } else {
        deletedSection.style.display = 'none';
    }
    
    // Add "Mark as Seen" button if there are pending changes
    if (hasAdded || hasDeleted) {
        addMarkAsSeenButton();
    }
    
    console.log('✅ Changes update completed');
}

// Add Mark as Seen button
function addMarkAsSeenButton() {
    // Remove existing button if any
    const existingButton = document.querySelector('.mark-seen-btn');
    if (existingButton) {
        existingButton.remove();
    }
    
    const markSeenBtn = document.createElement('button');
    markSeenBtn.className = 'btn secondary mark-seen-btn';
    markSeenBtn.innerHTML = '✅ Đã xem - Chuyển vào lịch sử';
    markSeenBtn.style.marginTop = '10px';
    markSeenBtn.style.width = '100%';
    
    markSeenBtn.addEventListener('click', async () => {
        markSeenBtn.disabled = true;
        markSeenBtn.innerHTML = '⏳ Đang chuyển vào lịch sử...';
        
        try {
            await sendMessageToBackground({ action: 'UpdateResults' });
            console.log('✅ Pending changes moved to history');
            await loadUserData(); // Reload to update UI
            userStatus.textContent = 'Đã chuyển vào lịch sử';
            setTimeout(() => {
                userStatus.textContent = 'Đang theo dõi thay đổi Facebook';
            }, 2000);
        } catch (error) {
            console.error('❌ Error moving pending changes:', error);
            markSeenBtn.disabled = false;
            markSeenBtn.innerHTML = '✅ Đã xem - Chuyển vào lịch sử';
        }
    });
    
    changesList.appendChild(markSeenBtn);
}

// Update history from storage
async function updateHistoryFromStorage() {
    try {
        const response = await sendMessageToBackground({ action: 'getHistory' });
        if (response?.history) {
            updateHistory(response.history);
        }
    } catch (error) {
        console.error('❌ Error loading history from storage:', error);
        updateHistory({ list: [] });
    }
}

// Update history tab
function updateHistory(history) {
    console.log('📜 Updating history with data:', history);
    
    if (!history.list || history.list.length === 0) {
        noHistory.style.display = 'block';
        historyList.style.display = 'none';
        return;
    }
    
    noHistory.style.display = 'none';
    historyList.style.display = 'block';
    historyList.innerHTML = '';
    
    // Sort by date (newest first)
    const sortedHistory = [...history.list].sort((a, b) => b.date - a.date);
    
    // Group by date
    const groupedByDate = {};
    sortedHistory.forEach(item => {
        const dateKey = new Date(item.date).toDateString();
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = {
                added: [],
                deleted: [],
                date: item.date
            };
        }
        
        if (item.reason === 'ADDED') {
            groupedByDate[dateKey].added.push(item);
        } else if (item.reason === 'DELETED') {
            groupedByDate[dateKey].deleted.push(item);
        }
    });
    
    // Create date sections
    Object.keys(groupedByDate).forEach(dateKey => {
        const dayData = groupedByDate[dateKey];
        const dateObj = new Date(dayData.date);
        const isToday = new Date().toDateString() === dateKey;
        const isYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString() === dateKey;
        
        let displayDate;
        if (isToday) {
            displayDate = 'Hôm nay';
        } else if (isYesterday) {
            displayDate = 'Hôm qua';
        } else {
            displayDate = dateObj.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        // Create date header
        const dateHeader = document.createElement('div');
        dateHeader.className = 'history-date-header';
        dateHeader.innerHTML = `
            <h3 class="date-title">${displayDate}</h3>
            <div class="date-summary">
                ${dayData.added.length > 0 ? `<span class="added-summary">+${dayData.added.length} thêm</span>` : ''}
                ${dayData.deleted.length > 0 ? `<span class="deleted-summary">-${dayData.deleted.length} xóa</span>` : ''}
            </div>
        `;
        historyList.appendChild(dateHeader);
        
        // Create date group container
        const dateGroup = document.createElement('div');
        dateGroup.className = 'history-date-group';
        
        // Add added friends section
        if (dayData.added.length > 0) {
            const addedSection = document.createElement('div');
            addedSection.className = 'history-section added';
            addedSection.innerHTML = '<h4 class="section-subtitle">👋 Đã thêm bạn</h4>';
            
            const addedList = document.createElement('div');
            addedList.className = 'friend-list';
            
            dayData.added.forEach(item => {
                const time = new Date(item.date).toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                addedList.appendChild(createFriendItem(item, 'added', time));
            });
            
            addedSection.appendChild(addedList);
            dateGroup.appendChild(addedSection);
        }
        
        // Add deleted friends section
        if (dayData.deleted.length > 0) {
            const deletedSection = document.createElement('div');
            deletedSection.className = 'history-section deleted';
            deletedSection.innerHTML = '<h4 class="section-subtitle">💔 Đã xóa bạn</h4>';
            
            const deletedList = document.createElement('div');
            deletedList.className = 'friend-list';
            
            dayData.deleted.forEach(item => {
                const time = new Date(item.date).toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                deletedList.appendChild(createFriendItem(item, 'deleted', time));
            });
            
            deletedSection.appendChild(deletedList);
            dateGroup.appendChild(deletedSection);
        }
        
        historyList.appendChild(dateGroup);
    });
    
    console.log('✅ History update completed with grouped display');
}

// Open Facebook profile
function openFacebookProfile(uid) {
    if (!uid || uid === '') {
        console.log('❌ No UID provided for profile');
        userStatus.textContent = 'Không thể mở trang cá nhân - thiếu thông tin';
        setTimeout(() => {
            userStatus.textContent = 'Đang theo dõi thay đổi Facebook';
        }, 3000);
        return;
    }
    
    console.log('🔗 Opening Facebook profile for UID:', uid);
    userStatus.textContent = 'Đang mở trang Facebook...';
    
    // Try different Facebook URL formats
    const profileUrls = [
        `https://www.facebook.com/profile.php?id=${uid}`,
        `https://www.facebook.com/${uid}`,
        `https://facebook.com/profile.php?id=${uid}`
    ];
    
    try {
        // Use the most reliable format first
        chrome.tabs.create({ url: profileUrls[0] }, (tab) => {
            if (chrome.runtime.lastError) {
                console.error('❌ Error opening tab:', chrome.runtime.lastError);
                userStatus.textContent = 'Lỗi khi mở trang Facebook';
            } else {
                console.log('✅ Successfully opened Facebook profile tab');
                userStatus.textContent = 'Đã mở trang Facebook';
            }
            
            // Reset status after 2 seconds
            setTimeout(() => {
                userStatus.textContent = 'Đang theo dõi thay đổi Facebook';
            }, 2000);
        });
    } catch (error) {
        console.error('❌ Error opening Facebook profile:', error);
        userStatus.textContent = 'Lỗi khi mở trang Facebook';
        setTimeout(() => {
            userStatus.textContent = 'Đang theo dõi thay đổi Facebook';
        }, 3000);
    }
}

// Create friend item element
function createFriendItem(friend, type, date) {
    const item = document.createElement('div');
    item.className = 'friend-item';
    
    // Use better avatar fallback
    let avatar = './icons/ic_32.png'; // Default fallback
    if (friend.photo && friend.photo !== '' && friend.photo !== 'undefined') {
        avatar = friend.photo;
    } else if (friend.uid && friend.uid !== '' && friend.uid !== 'undefined') {
        avatar = getFacebookAvatar(friend.uid);
    }
    
    const name = friend.name || 'Người dùng không xác định';
    const badgeText = type === 'added' ? 'Thêm' : 'Xóa';
    const uid = friend.uid || '';
    
    item.innerHTML = `
        <img src="${avatar}" alt="${name}" class="friend-avatar" loading="lazy" onerror="this.src='./icons/ic_32.png'">
        <div class="friend-info">
            <div class="friend-name clickable-name" data-uid="${uid}" title="Nhấp để xem trang Facebook">
                ${name} <span class="link-icon">🔗</span>
            </div>
            <div class="friend-date">${date}</div>
        </div>
        <div class="friend-badge ${type}">${badgeText}</div>
    `;
    
    // Add click event to name
    const nameElement = item.querySelector('.friend-name');
    if (nameElement && uid) {
        nameElement.addEventListener('click', (e) => {
            e.stopPropagation();
            openFacebookProfile(uid);
        });
    }
    
    return item;
}

// Show specific tab
function showTab(tabName) {
    console.log('📑 showTab called with:', tabName);
    console.log('📑 Available tab buttons:', tabBtns.length);
    console.log('📑 changesTab element:', !!changesTab);
    console.log('📑 historyTab element:', !!historyTab);
    
    // Update tab buttons
    tabBtns.forEach((btn, index) => {
        const isActive = btn.dataset.tab === tabName;
        btn.classList.toggle('active', isActive);
        console.log(`📑 Tab button ${index} (${btn.dataset.tab}): ${isActive ? 'active' : 'inactive'}`);
    });
    
    // Update tab content
    const showChanges = tabName === 'changes';
    const showHistory = tabName === 'history';
    
    changesTab.classList.toggle('active', showChanges);
    historyTab.classList.toggle('active', showHistory);
    
    console.log('📑 Changes tab active:', showChanges);
    console.log('📑 History tab active:', showHistory);
    
    // If switching to history tab and there are pending changes, move them to history
    if (tabName === 'history') {
        movePendingToHistory();
    }
}

// Move pending changes to history
async function movePendingToHistory() {
    try {
        const response = await sendMessageToBackground({ action: 'UpdateResults' });
        if (response && response.response === 'UPDATED') {
            console.log('✅ Pending changes moved to history');
            // Reload data to reflect changes
            await loadUserData();
        }
    } catch (error) {
        console.error('❌ Error moving pending to history:', error);
    }
}

// Update last check time
function updateLastCheck() {
    const now = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    lastCheck.textContent = now;
}

// Handle errors gracefully
window.addEventListener('error', (event) => {
    console.error('Popup error:', event.error);
    userStatus.textContent = 'Đã xảy ra lỗi. Vui lòng làm mới.';
});

// Handle image loading errors
document.addEventListener('error', (event) => {
    if (event.target.tagName === 'IMG') {
        event.target.src = './icons/ic_32.png';
    }
}, true);