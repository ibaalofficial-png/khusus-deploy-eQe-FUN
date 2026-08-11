"use strict";

const Equalizer = {
    context: null,
    source: null,
    analyser: null,
    filters: [],
    initialized: false,

    presets: {
        flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bass: [12, 10, 8, 3, 0, -1, -1, 0, 2, 4, 6, 8],
        vocal: [-2, -1, 1, 5, 9, 8, 6, 2, 0, -1, -2, -3],
        rock: [6, 5, 3, 0, -2, 0, 3, 5, 7, 8, 8, 8],
        edm: [10, 8, 2, -2, -4, 0, 5, 7, 9, 8, 7, 6]
    },

    customPresets: {
        "airpods_edit": [{type:"peaking", frequency:79, Q:0.11, gain:13.1}, {type:"peaking", frequency:361, Q:1.37, gain:-0.9}, {type:"peaking", frequency:812, Q:0.71, gain:0.03}, {type:"peaking", frequency:2639, Q:3.63, gain:3.0}, {type:"peaking", frequency:3956, Q:3.66, gain:6.1}, {type:"peaking", frequency:4985, Q:3.68, gain:2.2}, {type:"peaking", frequency:6395, Q:4.0, gain:6.4}, {type:"peaking", frequency:8962, Q:1.91, gain:6.5}, {type:"peaking", frequency:15198, Q:1.72, gain:-1.3}],
        "airpods_edit2": [{type:"peaking", frequency:80, Q:0.12, gain:12.0}, {type:"peaking", frequency:400, Q:1.2, gain:-1.0}, {type:"peaking", frequency:2500, Q:3.0, gain:4.0}, {type:"peaking", frequency:6000, Q:2.0, gain:5.5}],
        "bass_enak": [{type:"peaking", frequency:60, Q:1.0, gain:12.0}, {type:"peaking", frequency:250, Q:1.0, gain:2.0}, {type:"peaking", frequency:4000, Q:1.0, gain:3.0}, {type:"peaking", frequency:10000, Q:1.0, gain:5.0}],
        "bass2": [{type:"peaking", frequency:50, Q:1.2, gain:14.0}, {type:"peaking", frequency:200, Q:1.0, gain:1.5}, {type:"peaking", frequency:2000, Q:1.0, gain:2.0}, {type:"peaking", frequency:8000, Q:1.0, gain:4.0}],
        "basssss": [{type:"peaking", frequency:45, Q:1.5, gain:16.0}, {type:"peaking", frequency:150, Q:1.0, gain:3.0}, {type:"peaking", frequency:3000, Q:1.0, gain:4.0}],
        "current_bands": [{type:"peaking", frequency:100, Q:1.0, gain:10.0}, {type:"peaking", frequency:1000, Q:1.0, gain:1.0}, {type:"peaking", frequency:5000, Q:1.0, gain:4.0}],
        "pubg_bass": [{type:"peaking", frequency:80, Q:1.0, gain:11.0}, {type:"peaking", frequency:500, Q:1.0, gain:-1.0}, {type:"peaking", frequency:2500, Q:1.2, gain:6.0}, {type:"peaking", frequency:6000, Q:1.0, gain:4.0}],
        "pubg_bass2": [{type:"peaking", frequency:70, Q:1.1, gain:12.5}, {type:"peaking", frequency:1000, Q:1.0, gain:2.0}, {type:"peaking", frequency:3000, Q:1.5, gain:7.0}],
        "pubg_bassss": [{type:"peaking", frequency:65, Q:1.3, gain:15.0}, {type:"peaking", frequency:2500, Q:2.0, gain:8.0}],
        "pubg": [{type:"peaking", frequency:100, Q:1.0, gain:8.0}, {type:"peaking", frequency:3200, Q:2.0, gain:8.5}]
    },

    init(){
        if(this.initialized) {
            if(this.context && this.context.state === "suspended") {
                this.context.resume();
            }
            return;
        }
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            const audioElement = document.getElementById("audio");
            
            this.source = this.context.createMediaElementSource(audioElement);
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 256;

            this.filters = [];
            const defaultFreqs = [60, 120, 250, 500, 1000, 2000, 4000, 8000, 12000, 14000, 16000, 18000];
            
            for(let i=0; i<12; i++){
                let f = this.context.createBiquadFilter();
                f.type = "peaking";
                f.frequency.value = defaultFreqs[i];
                f.Q.value = 1.0;
                f.gain.value = 0;
                this.filters.push(f);
            }

            let last = this.source;
            this.filters.forEach(f => { last.connect(f); last = f; });
            
            last.connect(this.analyser);
            this.analyser.connect(this.context.destination);

            this.initialized = true;
        } catch(e) {
            console.log("Equalizer init error:", e);
        }
    },

    applyPreset(name){
        this.init();
        if(this.context && this.context.state === "suspended") this.context.resume();

        const gains = this.presets[name];
        if(!gains) return;

        const defaultFreqs = [60, 120, 250, 500, 1000, 2000, 4000, 8000, 12000, 14000, 16000, 18000];

        this.filters.forEach((f, i) => {
            f.type = "peaking";
            f.frequency.value = defaultFreqs[i];
            f.Q.value = 1.0;
            f.gain.value = gains[i] || 0;
        });

        const eqSelect = document.getElementById("customEqSelect");
        if(eqSelect) eqSelect.value = "";
    },

    applyCustomPreset(key){
        this.init();
        if(this.context && this.context.state === "suspended") this.context.resume();

        const data = this.customPresets[key];
        if(!data) return;

        this.filters.forEach(f => {
            f.type = "peaking";
            f.frequency.value = 1000;
            f.Q.value = 1.0;
            f.gain.value = 0;
        });

        data.forEach((item, i) => {
            if(i < this.filters.length){
                this.filters[i].type = item.type || "peaking";
                this.filters[i].frequency.value = item.frequency;
                this.filters[i].Q.value = item.Q;
                this.filters[i].gain.value = item.gain;
            }
        });
    }
};

document.addEventListener("click", (e) => {
    if (e.target.matches(".preset button")) {
        const presetName = e.target.getAttribute("data-preset");
        if (presetName) {
            Equalizer.applyPreset(presetName);
        }
    }
});

document.addEventListener("change", (e) => {
    if (e.target && e.target.id === "customEqSelect") {
        Equalizer.applyCustomPreset(e.target.value);
    }
});
