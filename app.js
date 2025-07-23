// Playlist data
const playlist = [
    {
        title: "Acoustic Breeze",
        artist: "Benjamin Tissot",
        url: "https://file-examples.com/storage/fe5c6ad09266c4e86a7026a/2017/11/file_example_MP3_1MG.mp3",
        cover: "https://via.placeholder.com/300x300/1FB8CD/FFFFFF?text=Acoustic+Breeze"
    },
    {
        title: "Creative Minds",
        artist: "Benjamin Tissot", 
        url: "https://file-examples.com/storage/fe5c6ad09266c4e86a7026a/2017/11/file_example_MP3_2MG.mp3",
        cover: "https://via.placeholder.com/300x300/FFC185/000000?text=Creative+Minds"
    },
    {
        title: "Sunny",
        artist: "Benjamin Tissot",
        url: "https://file-examples.com/storage/fe5c6ad09266c4e86a7026a/2017/11/file_example_MP3_700KB.mp3", 
        cover: "https://via.placeholder.com/300x300/B4413C/FFFFFF?text=Sunny"
    }
];

// Player state
let currentTrackIndex = -1;
let isPlaying = false;
let userHasInteracted = false;
let isMuted = false;
let previousVolume = 0.5;

// DOM elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeSpan = document.getElementById('currentTime');
const totalTimeSpan = document.getElementById('totalTime');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const coverArt = document.getElementById('coverArt');
const playlistContainer = document.getElementById('playlist');

// Initialize player
function init() {
    createPlaylist();
    setupEventListeners();
    setupMediaSession();
    
    // Set initial volume
    audioPlayer.volume = 0.5;
    volumeSlider.value = 50;
    
    // Initialize with empty state
    currentTrackIndex = -1;
    trackTitle.textContent = "Select a track to play";
    trackArtist.textContent = "Artist";
    coverArt.src = "";
    currentTimeSpan.textContent = "0:00";
    totalTimeSpan.textContent = "0:00";
}

// Create playlist UI
function createPlaylist() {
    playlistContainer.innerHTML = '';
    
    playlist.forEach((track, index) => {
        const playlistItem = document.createElement('button');
        playlistItem.className = 'playlist-item';
        playlistItem.setAttribute('data-index', index);
        playlistItem.innerHTML = `
            <span class="track-number">${index + 1}</span>
            <div class="track-title">${track.title}</div>
            <div class="track-artist">${track.artist}</div>
        `;
        
        playlistItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (!userHasInteracted) {
                userHasInteracted = true;
            }
            playTrack(index);
        });
        
        playlistContainer.appendChild(playlistItem);
    });
}

// Load track without playing
function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    const track = playlist[index];
    currentTrackIndex = index;
    
    // Update audio source
    audioPlayer.src = track.url;
    
    // Update cover art with error handling
    coverArt.onload = function() {
        this.style.opacity = '1';
    };
    coverArt.onerror = function() {
        this.style.opacity = '0.3';
    };
    coverArt.src = track.cover;
    
    // Update track info
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    
    updatePlaylistHighlight(index);
    updateMediaSessionMetadata(track);
}

// Play specific track
function playTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    loadTrack(index);
    
    if (userHasInteracted) {
        // Reset progress
        progressFill.style.width = '0%';
        
        audioPlayer.play().then(() => {
            isPlaying = true;
            updatePlayPauseButton();
        }).catch(error => {
            console.error('Error playing track:', error);
        });
    }
}

// Update playlist highlight
function updatePlaylistHighlight(index) {
    const playlistItems = document.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Toggle play/pause
function togglePlayPause() {
    if (!userHasInteracted) {
        userHasInteracted = true;
        if (currentTrackIndex === -1) {
            playTrack(0);
            return;
        }
    }
    
    if (currentTrackIndex === -1) {
        playTrack(0);
        return;
    }
    
    if (audioPlayer.paused) {
        audioPlayer.play().catch(error => {
            console.error('Error playing track:', error);
        });
    } else {
        audioPlayer.pause();
    }
}

// Previous track
function previousTrack() {
    if (currentTrackIndex === -1) {
        playTrack(0);
        return;
    }
    
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1;
    playTrack(newIndex);
}

// Next track
function nextTrack() {
    if (currentTrackIndex === -1) {
        playTrack(0);
        return;
    }
    
    const newIndex = currentTrackIndex < playlist.length - 1 ? currentTrackIndex + 1 : 0;
    playTrack(newIndex);
}

// Update play/pause button
function updatePlayPauseButton() {
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
}

// Format time display
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update progress bar
function updateProgress() {
    if (audioPlayer.duration && audioPlayer.currentTime >= 0) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        totalTimeSpan.textContent = formatTime(audioPlayer.duration);
    }
}

// Seek to position
function seekTo(percentage) {
    if (audioPlayer.duration && percentage >= 0 && percentage <= 100) {
        audioPlayer.currentTime = (percentage / 100) * audioPlayer.duration;
    }
}

// Toggle mute
function toggleMute() {
    if (isMuted) {
        audioPlayer.volume = previousVolume;
        volumeSlider.value = previousVolume * 100;
        muteBtn.textContent = '🔊';
        isMuted = false;
    } else {
        previousVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        volumeSlider.value = 0;
        muteBtn.textContent = '🔇';
        isMuted = true;
    }
}

// Update volume
function updateVolume(value) {
    const volume = Math.max(0, Math.min(100, value)) / 100;
    audioPlayer.volume = volume;
    
    if (volume === 0) {
        muteBtn.textContent = '🔇';
        isMuted = true;
    } else {
        muteBtn.textContent = volume > 0.5 ? '🔊' : '🔉';
        isMuted = false;
    }
}

// Setup Media Session API
function setupMediaSession() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
            audioPlayer.play();
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
            audioPlayer.pause();
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            previousTrack();
        });
        
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            nextTrack();
        });
        
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            const seekTime = details.seekOffset || 5;
            audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - seekTime);
        });
        
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
            const seekTime = details.seekOffset || 5;
            audioPlayer.currentTime = Math.min(audioPlayer.duration || 0, audioPlayer.currentTime + seekTime);
        });
    }
}

// Update Media Session metadata
function updateMediaSessionMetadata(track) {
    if ('mediaSession' in navigator && 'MediaMetadata' in window) {
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                artwork: [
                    { src: track.cover, sizes: '300x300', type: 'image/png' }
                ]
            });
        } catch (error) {
            console.warn('MediaSession metadata update failed:', error);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Audio player events
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseButton();
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
        }
    });
    
    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseButton();
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    });
    
    audioPlayer.addEventListener('timeupdate', updateProgress);
    
    audioPlayer.addEventListener('ended', () => {
        nextTrack();
    });
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        updateProgress();
    });
    
    audioPlayer.addEventListener('loadeddata', () => {
        updateProgress();
    });
    
    audioPlayer.addEventListener('canplay', () => {
        updateProgress();
    });
    
    // Control button events
    playPauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        togglePlayPause();
    });
    
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        previousTrack();
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextTrack();
    });
    
    muteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMute();
    });
    
    // Volume slider
    volumeSlider.addEventListener('input', (e) => {
        updateVolume(parseFloat(e.target.value));
    });
    
    volumeSlider.addEventListener('change', (e) => {
        updateVolume(parseFloat(e.target.value));
    });
    
    // Progress bar seeking
    progressBar.addEventListener('click', (e) => {
        e.preventDefault();
        const rect = progressBar.getBoundingClientRect();
        const percentage = ((e.clientX - rect.left) / rect.width) * 100;
        seekTo(percentage);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Don't interfere if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                if (audioPlayer.duration) {
                    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
                }
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                if (audioPlayer.duration) {
                    audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const newVolumeUp = Math.min(100, parseInt(volumeSlider.value) + 10);
                volumeSlider.value = newVolumeUp;
                updateVolume(newVolumeUp);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                const newVolumeDown = Math.max(0, parseInt(volumeSlider.value) - 10);
                volumeSlider.value = newVolumeDown;
                updateVolume(newVolumeDown);
                break;
        }
    });
    
    // Enable user interaction detection
    document.addEventListener('click', () => {
        if (!userHasInteracted) {
            userHasInteracted = true;
        }
    }, { once: true });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}