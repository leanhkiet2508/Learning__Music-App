const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PLAYER_STATE';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const volumeControl = $('#volume-control');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const replayBtn = $('.btn-replay');
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isReplay: false,
    songCache: [],
    history: [],
    historyPointer: -1,

    songs: [
        {
            name: 'Cánh Đồng Yêu Thương',
            singer: 'Trung Quân Idol',
            path: './assets/music/song1.mp3',
            image: './assets/img/img1.jpg'
        },
        {
            name: 'À Thì x 1000 Ánh Mắt',
            singer: 'Obito',
            path: './assets/music/song2.mp3',
            image: './assets/img/img2.jpg'
        },
        {
            name: 'Nỗi Đau Xót Xa',
            singer: 'Minh Vương M4U',
            path: './assets/music/song3.mp3',
            image: './assets/img/img3.jpg'
        },
        {
            name: 'Mưa Rơi Vào Phòng',
            singer: 'Khởi My',
            path: './assets/music/song4.mp3',
            image: './assets/img/img4.jpg'
        },
        {
            name: 'Anh Chẳng Thể',
            singer: 'Trung Quân Idol',
            path: './assets/music/song5.mp3',
            image: './assets/img/img3.jpg'
        },
        {
            name: 'Đơn Phương Mình Anh',
            singer: 'Bống',
            path: './assets/music/song6.mp3',
            image: './assets/img/img2.jpg'
        },
        {
            name: 'Anh Vui',
            singer: 'Phạm Kỳ',
            path: './assets/music/song7.mp3',
            image: './assets/img/img1.jpg'
        },
        {
            name: 'Hẹn Anh Khi Hoa Chưa Tàn',
            singer: 'Khởi My',
            path: './assets/music/song8.mp3',
            image: './assets/img/img4.jpg'
        },
        {
            name: 'Yeu Mot Nguoi Vo Tam',
            singer: 'Trung Quân Idol',
            path: './assets/music/song9.mp3',
            image: './assets/img/img2.jpg'
        },
        {
            name: 'Vở Kịch Của Em x Vây Giữ',
            singer: 'Khởi My',
            path: './assets/music/song10.mp3',
            image: './assets/img/img3.jpg'
        }
    ],
    
    // ** Lưu lại bài hát để reload ko mất
    loadState: function() {
        const state = JSON.parse(sessionStorage.getItem(PLAYER_STORAGE_KEY));
        if (state) {
            this.currentIndex = state.index || 0;
            audio.currentTime = state.time || 0;
            this.loadCurrentSong();
        } else {
            this.loadCurrentSong();
        }
    },

    saveState: function() {
        const state = {
            index: this.currentIndex,
            time: audio.currentTime
        };
        sessionStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(state));
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function() {
        const cdWidth = cd.offsetWidth;

        // Xử lí phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lí quay CD
        const cdThumbAnimate = cdThumb.animate(
            [
                {transform: 'rotate(360deg)'}
            ], 
            {   
                duration: 10000,
                iterations: Infinity
            }
        )
        cdThumbAnimate.pause();

        // Xử lí nút play / pause
        playBtn.onclick = function() {
            if (app.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        audio.onplay = function() {
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        audio.onpause = function() {
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Xử lí thanh tua
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
                app.saveState();
            }
        }
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // Xử lí thanh âm lượng
        volumeControl.oninput = function(e) {
            audio.volume = e.target.value / 100;
        }

        // Xử lí chuyển bài
        // Khi click btn
        nextBtn.onclick = function() {
            if (app.isRandom) {
                app.randomSong();
            } else if (app.isReplay) {
                app.replaySong();
            } else {
                app.nextSong();
            }
            audio.play();
            app.scrollToActiveSong();
            app.saveState();
        }
        prevBtn.onclick = function() {
            if (app.isRandom) {
                app.prevRandomSong();
            } else {
                app.prevSong();
            }
            audio.play();
            app.scrollToActiveSong();
            app.saveState();
        }
        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom;
            randomBtn.classList.toggle('active', app.isRandom);
            if (app.isReplay) {
                replayBtn.classList.remove('active');
                app.isReplay = false;
            }
        }
        replayBtn.onclick = function() {
            app.isReplay = !app.isReplay;
            replayBtn.classList.toggle('active', app.isReplay);
            if (app.isRandom) {
                randomBtn.classList.remove('active');
                app.isRandom = false;
            }
        }
        // Khi hết bài
        audio.onended = function() {
            if (app.isRandom) {
                app.randomSong();
            } else if (app.isReplay) {
                app.replaySong();
            } else {
                app.nextSong();
            }
            audio.play();
            app.scrollToActiveSong();
        }
        // Khi click song
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || !e.target.closet('.option')) {
                if (songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    audio.play();
                }
                if (!e.target.closet('.option')) {}
            }
        }
    },

    activeSong: function() {
        const oldActive = $('.song.active');
        if (oldActive) oldActive.classList.remove('active');

        const newActive = $(`.song[data-index="${this.currentIndex}"]`);
        if (newActive) newActive.classList.add('active');
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 500)  
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
        this.activeSong();
        this.saveSong(this.currentIndex);
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isReplay = this.config.isReplay;
    },

    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex > this.songs.length - 1) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function() {
        // Nếu đã phát hết thì reset cache
        if (this.songCache.length === this.songs.length) {
            this.songCache = [];
        }
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.songCache.includes(newIndex));
        this.songCache.push(newIndex);
        this.currentIndex = newIndex;
        // Lịch sử phát
        this.history.push(newIndex);
        this.historyPointer = this.history.length - 1;
        
        this.loadCurrentSong();

    },
    replaySong: function() {
        this.loadCurrentSong();
    },

    saveSong: function(i) {
        if (!this.songCache.includes(i)) {
            this.songCache.push(i);
        }
    },

    prevRandomSong: function() {
        if (this.historyPointer > 0) {
            this.historyPointer--;
            this.currentIndex = this.history[this.historyPointer];
            this.loadCurrentSong();
        }
    },




    start: function() {
        // 1. ĐN các thuộc tính cho object
        this.defineProperties();
        // 2. Render playlist
        this.render();
        // 3. Lắng nghe, xử lí các sự kiện
        this.handleEvents();
        // 4. Tải thông tin bài hát đầu tiên khi chạy app
        this.loadCurrentSong();
        // 5. Tiếp tục đoạn nhạc đang nghe lần trước
        this.loadState();
    }
}
app.start();