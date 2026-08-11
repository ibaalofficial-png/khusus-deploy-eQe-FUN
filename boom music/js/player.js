"use strict";

const Player = {
    audio: null,
    songs: [],
    currentIndex: 0,

    init(){
        this.audio = document.getElementById("audio");
        console.log("Player Ready");
        this.bindEvents();

        this.audio.addEventListener("ended", () => {
            this.next();
        });

        this.audio.addEventListener("timeupdate", () => {
            this.updateProgress();
        });

        this.audio.addEventListener("loadedmetadata", () => {
            document.getElementById("duration").textContent = this.formatTime(this.audio.duration);
        });

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                if (typeof Equalizer !== "undefined" && Equalizer.context && Equalizer.context.state === "suspended") {
                    Equalizer.context.resume();
                }
                if (typeof Visualizer !== "undefined" && typeof Visualizer.init === "function") {
                    Visualizer.init();
                }
            }
        });
    },

    bindEvents(){
        document.getElementById("folderInput").addEventListener("change", (e) => {
            this.loadSongs(e.target.files);
        });

        document.getElementById("playBtn").onclick = () => {
            this.toggle();
        };

        document.getElementById("nextBtn").onclick = () => {
            this.next();
        };

        document.getElementById("prevBtn").onclick = () => {
            this.prev();
        };

        const progressBar = document.getElementById("progress");
        if(progressBar){
            progressBar.addEventListener("input", (e) => {
                if(this.audio.duration){
                    const seekTime = (e.target.value / 100) * this.audio.duration;
                    this.audio.currentTime = seekTime;
                }
            });
        }
    },

    loadSongs(files){
        this.songs = Array.from(files).filter(file => file.type.startsWith("audio"));
        this.renderPlaylist();

        if(this.songs.length){
            this.playSong(0);
        }
    },

    async playSong(index){
        let song = this.songs[index];
        if(!song) return;

        const scContainer = document.getElementById("scPlayerContainer");
        if(scContainer) scContainer.style.display = "none";

        // Hapus atribut CORS untuk file lokal
        this.audio.removeAttribute("crossOrigin");

        this.currentIndex = index;
        this.audio.src = URL.createObjectURL(song);
        this.audio.load();

        document.getElementById("title").textContent = song.name;
        document.getElementById("artist").textContent = "Boom Music V3";
        this.loadArtwork(song);

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.name,
                artist: 'Boom Music V3',
                artwork: [{ src: document.getElementById("cover").src || './assets/cover.jpg', sizes: '512x512', type: 'image/jpeg' }]
            });
            navigator.mediaSession.setActionHandler('play', () => this.toggle());
            navigator.mediaSession.setActionHandler('pause', () => this.toggle());
            navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
            navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
        }

        if(typeof Equalizer !== "undefined"){
            Equalizer.init();
            if(Equalizer.context && Equalizer.context.state === "suspended"){
                await Equalizer.context.resume();
            }
        }

        setTimeout(() => {
            if(typeof Visualizer !== "undefined" && typeof Visualizer.init === "function"){
                Visualizer.init();
            }
        }, 300);

        this.audio.play()
        .then(() => {
            document.getElementById("playBtn").textContent = "Pause";
        })
        .catch(err => {
            console.log("Play error:", err);
        });
    },

    // PLAY SOUNDCLOUD VIA BLOB LOKAL (SAMA SEPERTI FILE IMPOR HP)
    async playExternalStream(streamUrl, title, artist, coverUrl){
        const scContainer = document.getElementById("scPlayerContainer");
        if(scContainer) scContainer.style.display = "none";

        document.getElementById("title").textContent = "Memuat Audio EQ...";
        document.getElementById("artist").textContent = artist || "SoundCloud Artist";
        if(coverUrl) document.getElementById("cover").src = coverUrl;

        try {
            // Convert stream SoundCloud ke Blob lokal
            const response = await fetch(streamUrl);
            const audioBlob = await response.blob();
            const localBlobUrl = URL.createObjectURL(audioBlob);

            // Lepas CORS restriction karena audio sudah jadi Blob lokal
            this.audio.removeAttribute("crossOrigin");
            this.audio.src = localBlobUrl;
            this.audio.load();

            document.getElementById("title").textContent = title || "SoundCloud Track";

            if(typeof Equalizer !== "undefined"){
                Equalizer.init();
                if(Equalizer.context && Equalizer.context.state === "suspended"){
                    await Equalizer.context.resume();
                }
            }

            setTimeout(() => {
                if(typeof Visualizer !== "undefined" && typeof Visualizer.init === "function"){
                    Visualizer.init();
                }
            }, 200);

            await this.audio.play();
            document.getElementById("playBtn").textContent = "Pause";

        } catch(e) {
            console.log("Blob convert error, fallback to direct stream:", e);
            this.audio.crossOrigin = "anonymous";
            this.audio.src = streamUrl;
            this.audio.load();

            if(typeof Equalizer !== "undefined"){
                Equalizer.init();
                if(Equalizer.context && Equalizer.context.state === "suspended"){
                    await Equalizer.context.resume();
                }
            }

            await this.audio.play();
            document.getElementById("playBtn").textContent = "Pause";
        }
    },

    toggle(){
        if(this.audio.paused){
            if(typeof Equalizer !== "undefined" && Equalizer.context && Equalizer.context.state === "suspended"){
                Equalizer.context.resume();
            }

            this.audio.play().then(() => {
                document.getElementById("playBtn").textContent = "Pause";
            });
        }else{
            this.audio.pause();
            document.getElementById("playBtn").textContent = "Play";
        }
    },

    next(){
        if(!this.songs.length) return;
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.playSong(this.currentIndex);
    },

    prev(){
        if(!this.songs.length) return;
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.playSong(this.currentIndex);
    },

    renderPlaylist(){
        let box = document.getElementById("songs");
        box.innerHTML = "";

        this.songs.forEach((song, index) => {
            let item = document.createElement("div");
            item.className = "song";
            item.textContent = song.name;
            
            if(index === this.currentIndex){
                item.style.color = "#00f3ff";
            }

            item.onclick = () => {
                this.playSong(index);
            };

            box.appendChild(item);
        });
    },

    loadArtwork(file){
        let cover = document.getElementById("cover");
        cover.src = "assets/cover.jpg";

        if(typeof jsmediatags === "undefined") return;

        jsmediatags.read(file, {
            onSuccess: (tag) => {
                let picture = tag.tags.picture;
                if(!picture) return;

                let blob = new Blob([new Uint8Array(picture.data)], { type: picture.format });
                cover.src = URL.createObjectURL(blob);
            },
            onError: () => {
                cover.src = "assets/cover.jpg";
            }
        });
    },

    updateProgress(){
        if(!this.audio.duration) return;

        let value = (this.audio.currentTime / this.audio.duration) * 100;

        let progressInput = document.getElementById("progress");
        if(progressInput) progressInput.value = value;

        document.getElementById("current").textContent = this.formatTime(this.audio.currentTime);
        document.getElementById("duration").textContent = this.formatTime(this.audio.duration);
    },

    formatTime(sec){
        if(isNaN(sec)) return "0:00";
        let m = Math.floor(sec / 60);
        let s = Math.floor(sec % 60);
        if(s < 10) s = "0" + s;
        return m + ":" + s;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Player.init();
});
