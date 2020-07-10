

const AudioContext = window.AudioContext || window.webkitAudioContext;
let context; 
let oscillator; 
let analyser;
let gainNode;
let octave = 261.63;
let lowpass;

window.onload = function() {
    setupCanvas();

    document.querySelector('.start').addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            createNoise();
            document.querySelector('.stop').classList.remove('active');
            this.classList.add('active');
        }
    });

    document.querySelector('.stop').addEventListener('click', function() {
        document.querySelector('.start').classList.remove('active');
        this.classList.add('active');
        gainNode.gain.setValueAtTime(0, context.currentTime)
        setTimeout(()=> context.close(), 200);
    });

    function createNoise() {
        context = new AudioContext();
        oscillator = context.createOscillator();
        oscillator.type = document.querySelector('.change-waveform').value;
        oscillator.frequency.value = octave;

        gainNode = context.createGain();
        gainNode.gain.value = document.querySelector('.volume').value;
       
        oscillator.connect(gainNode);
    
        analyser = context.createAnalyser();
        
        lowpass = context.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.Q.value = 0;
        lowpass.frequency.value = 440;

        gainNode.connect(lowpass);

        let compressor = context.createDynamicsCompressor()

        lowpass.connect(compressor);
        compressor.connect(context.destination);
        
        compressor.connect(analyser);


        oscillator.start();
        draw();
    }

    function draw() {
        analyser.fftSize = 2048;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
    
        var canvas = document.getElementById("oscilloscope");
        canvas.width = document.body.clientWidth;
        var canvasCtx = canvas.getContext("2d");

        requestAnimationFrame(draw);

        canvasCtx.fillStyle = "#fff8dc";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "#ff6969";
        canvasCtx.beginPath();

        var sliceWidth = canvas.width / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * canvas.height / 2;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }

    document.querySelector('.volume').addEventListener('input', function() {
        if (gainNode !== undefined && document.querySelector('.start').classList.contains('active')) {
            const value = Number(this.value);
            gainNode.gain.setValueAtTime(value, context.currentTime);
        }
    });


    document.querySelector('.change-waveform').addEventListener('click', function() {
        const display = document.querySelector('.display');
        const types = ['sine', 'triangle', 'sawtooth', 'square'];

        if (types.indexOf(this.value) + 1 === types.length) {
            this.value = types[0];
            oscillator.type = types[0];
            display.innerHTML = types[0];
        } else {
            const index = types.indexOf(this.value) + 1;
            this.value = types[index];
            oscillator.type = types[index];
            display.innerHTML = types[index];
        }
    });

    var keys = document.querySelectorAll('.key');
   
    for(var i = 0, max = keys.length; i < max; i++) {
        keys[i].onclick = function() {
            if (document.querySelector('.start').classList.contains('active')) {
                oscillator.frequency.value = octave * Math.pow(2, this.value/12);
            }
        }

        keys[i].onmouseover = function(e) {
            if (e.buttons === 1 && document.querySelector('.start').classList.contains('active')){
                oscillator.frequency.value = octave * Math.pow(2, this.value/12);
            }
        }
    }

    document.querySelector('.lpf-frequency').addEventListener('input', function() {
        if (lowpass !== undefined && document.querySelector('.start').classList.contains('active')) {
            const value = Number(this.value);
            lowpass.frequency.setValueAtTime(value, context.currentTime);
        }
    });

    document.querySelector('.lpf-q').addEventListener('input', function() {
        if (lowpass !== undefined && document.querySelector('.start').classList.contains('active')) {
            const value = Number(this.value);
            lowpass.Q.setValueAtTime(value, context.currentTime);
        }
    });

    var octaves = document.querySelectorAll('.octaves button');

    for(var i = 0, max = octaves.length; i < max; i++) {
        octaves[i].onclick = function() {
            octave = this.value;
            octaves.forEach(octave => octave.classList.remove('active'));
            this.classList.add('active');
        }
    }

    function setupCanvas() {
        var canvas = document.getElementById("oscilloscope");
        canvas.width = document.body.clientWidth;
        var canvasCtx = canvas.getContext("2d");
    
        canvasCtx.fillStyle = "#fff8dc";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "#ff6969";
        canvasCtx.beginPath();
    
        const y = canvas.height / 2;
        canvasCtx.moveTo(0, y);
        canvasCtx.lineTo(canvas.width, y);
        canvasCtx.stroke();
    }
}




