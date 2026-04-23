// State management
let tracks = [];
let albums = [];
let genres = [];
let likedTracks = new Set();
let currentTrack = null;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let progress = 0;
let volume = 70;
let progressInterval = null;

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const pages = {
    home: document.getElementById('home-page'),
    discover: document.getElementById('discover-page'),
    library: document.getElementById('library-page')
};

// Initialize app
async function init() {
    await loadData();
    renderAlbums();
    renderTracks();
    renderGenres();
    setupEventListeners();
}

// Load data from API
async function loadData() {
    try {
        const [albumsRes, tracksRes, genresRes] = await Promise.all([
            fetch('/api/albums'),
            fetch('/api/tracks'),
            fetch('/api/genres')
        ]);
        
        albums = await albumsRes.json();
        tracks = await tracksRes.json();
        genres = await genresRes.json();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Render trending albums
function renderAlbums() {
    const container = document.getElementById('trending-albums');
    container.innerHTML = albums.map(album => `
        <div class="album-card" onclick="playAlbum(${album.id})">
            <img src="${album.cover}" alt="${album.title}" class="album-cover">
            <div class="play-overlay">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
            <div class="album-title">${album.title}</div>
            <div class="album-artist">${album.artist}</div>
        </div>
    `).join('');
}

// Render track list
function renderTracks(containerId = 'recent-tracks', trackList = tracks) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (trackList.length === 0) {
        container.innerHTML = '<p style="color: #888; padding: 20px;">No tracks found</p>';
        return;
    }
    
    container.innerHTML = trackList.map((track, index) => `
        <div class="track-item ${currentTrack?.id === track.id ? 'active' : ''}" onclick="playTrack(${track.id})">
            <div class="track-number">${index + 1}</div>
            <div class="track-info-cell">
                <img src="${track.cover}" alt="${track.title}" class="track-cover-small">
                <div>
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
            </div>
            <div class="track-album">${track.album}</div>
            <div class="track-duration">${track.duration}</div>
            <div class="track-actions">
                <button class="like-btn ${likedTracks.has(track.id) ? 'liked' : ''}" 
                        onclick="event.stopPropagation(); toggleLike(${track.id})">
                    <svg viewBox="0 0 24 24" fill="${likedTracks.has(track.id) ? 'currentColor' : 'none'}" 
                         stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Render genres
function renderGenres() {
    const container = document.getElementById('genre-grid');
    container.innerHTML = genres.map(genre => `
        <div class="genre-card" style="background: ${genre.color}" onclick="searchGenre('${genre.name}')">
            <img src="${genre.image}" alt="${genre.name}">
            <span>${genre.name}</span>
        </div>
    `).join('');
}

// Render liked tracks in library
function renderLikedTracks() {
    const liked = tracks.filter(t => likedTracks.has(t.id));
    renderTracks('liked-tracks', liked);
    
    const noMsg = document.getElementById('no-liked-msg');
    if (liked.length === 0) {
        noMsg.style.display = 'block';
    } else {
        noMsg.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            Object.values(pages).forEach(p => p.classList.remove('active'));
            pages[page].classList.add('active');
            
            if (page === 'library') {
                renderLikedTracks();
            }
        });
    });
    
    // Play/Pause button
    document.getElementById('play-pause-btn').addEventListener('click', togglePlayPause);
    
    // Previous/Next buttons
    document.getElementById('prev-btn').addEventListener('click', playPrevious);
    document.getElementById('next-btn').addEventListener('click', playNext);
    
    // Shuffle button
    document.getElementById('shuffle-btn').addEventListener('click', () => {
        isShuffle = !isShuffle;
        document.getElementById('shuffle-btn').classList.toggle('active', isShuffle);
    });
    
    // Repeat button
    document.getElementById('repeat-btn').addEventListener('click', () => {
        isRepeat = !isRepeat;
        document.getElementById('repeat-btn').classList.toggle('active', isRepeat);
    });
    
    // Progress bar click
    document.getElementById('progress-bar').addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        progress = Math.max(0, Math.min(100, percent));
        updateProgressUI();
    });
    
    // Volume slider
    document.getElementById('volume-slider').addEventListener('input', (e) => {
        volume = e.target.value;
    });
    
    // Search input
    document.getElementById('search-input').addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            searchTracks(query);
        } else {
            renderTracks('recent-tracks', tracks);
        }
    });
    
    // Player like button
    document.getElementById('player-like-btn').addEventListener('click', () => {
        if (currentTrack) {
            toggleLike(currentTrack.id);
        }
    });
}

// Play featured album
function playFeatured() {
    if (tracks.length > 0) {
        playTrack(tracks[0].id);
    }
}

// Play album
function playAlbum(albumId) {
    const albumTracks = tracks.filter(t => {
        const album = albums.find(a => a.id === albumId);
        return album && t.album === album.title;
    });
    
    if (albumTracks.length > 0) {
        playTrack(albumTracks[0].id);
    }
}

// Play track
function playTrack(trackId) {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    currentTrack = track;
    isPlaying = true;
    progress = 0;
    
    // Update UI
    updatePlayerUI();
    updatePlayPauseIcon();
    startProgressSimulation();
    
    // Highlight active track
    document.querySelectorAll('.track-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.track-item')?.classList.add('active');
}

// Update player UI
function updatePlayerUI() {
    if (!currentTrack) return;
    
    const cover = document.getElementById('player-cover');
    const info = document.getElementById('track-info-placeholder');
    const likeBtn = document.getElementById('player-like-btn');
    
    cover.src = currentTrack.cover;
    cover.style.display = 'block';
    cover.classList.add('playing');
    
    info.innerHTML = `
        <div class="title">${currentTrack.title}</div>
        <div class="artist">${currentTrack.artist}</div>
    `;
    
    likeBtn.style.visibility = 'visible';
    likeBtn.classList.toggle('liked', likedTracks.has(currentTrack.id));
    
    // Parse duration
    const [mins, secs] = currentTrack.duration.split(':').map(Number);
    const totalSeconds = mins * 60 + secs;
    document.getElementById('total-time').textContent = currentTrack.duration;
}

// Toggle play/pause
function togglePlayPause() {
    if (!currentTrack) {
        if (tracks.length > 0) {
            playTrack(tracks[0].id);
        }
        return;
    }
    
    isPlaying = !isPlaying;
    updatePlayPauseIcon();
    
    const cover = document.getElementById('player-cover');
    if (isPlaying) {
        cover.classList.add('playing');
        startProgressSimulation();
    } else {
        cover.classList.remove('playing');
        stopProgressSimulation();
    }
}

// Update play/pause icon
function updatePlayPauseIcon() {
    document.getElementById('play-icon').style.display = isPlaying ? 'none' : 'block';
    document.getElementById('pause-icon').style.display = isPlaying ? 'block' : 'none';
}

// Start progress simulation
function startProgressSimulation() {
    stopProgressSimulation();
    
    const [mins, secs] = currentTrack.duration.split(':').map(Number);
    const totalSeconds = mins * 60 + secs;
    
    progressInterval = setInterval(() => {
        progress += (100 / totalSeconds);
        if (progress >= 100) {
            if (isRepeat) {
                progress = 0;
            } else {
                playNext();
                return;
            }
        }
        updateProgressUI();
    }, 1000);
}

// Stop progress simulation
function stopProgressSimulation() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

// Update progress UI
function updateProgressUI() {
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    const [mins, secs] = currentTrack.duration.split(':').map(Number);
    const totalSeconds = mins * 60 + secs;
    const currentSeconds = Math.floor((progress / 100) * totalSeconds);
    
    const curMins = Math.floor(currentSeconds / 60);
    const curSecs = currentSeconds % 60;
    document.getElementById('current-time').textContent = 
        `${curMins}:${curSecs.toString().padStart(2, '0')}`;
}

// Play previous track
function playPrevious() {
    if (!currentTrack) return;
    
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
    playTrack(tracks[prevIndex].id);
}

// Play next track
function playNext() {
    if (!currentTrack) return;
    
    let nextIndex;
    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
        const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        nextIndex = currentIndex < tracks.length - 1 ? currentIndex + 1 : 0;
    }
    playTrack(tracks[nextIndex].id);
}

// Toggle like
function toggleLike(trackId) {
    if (likedTracks.has(trackId)) {
        likedTracks.delete(trackId);
    } else {
        likedTracks.add(trackId);
    }
    
    // Re-render affected areas
    renderTracks();
    if (document.getElementById('library-page').classList.contains('active')) {
        renderLikedTracks();
    }
    
    // Update player like button
    if (currentTrack && currentTrack.id === trackId) {
        document.getElementById('player-like-btn').classList.toggle('liked', likedTracks.has(trackId));
    }
}

// Search tracks
function searchTracks(query) {
    const filtered = tracks.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase()) ||
        t.album.toLowerCase().includes(query.toLowerCase())
    );
    renderTracks('recent-tracks', filtered);
}

// Search by genre
function searchGenre(genreName) {
    // Navigate to discover and show search
    navItems.forEach(n => n.classList.remove('active'));
    document.querySelector('[data-page="discover"]').classList.add('active');
    Object.values(pages).forEach(p => p.classList.remove('active'));
    pages.discover.classList.add('active');
    
    document.getElementById('search-input').value = genreName;
    searchTracks(genreName);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
