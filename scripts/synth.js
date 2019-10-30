window.onload = function() {

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();

    var oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 261.63;

    const gainNode = context.createGain();

    oscillator.connect(gainNode);

    var analyser = context.createAnalyser();

    gainNode.connect(analyser)

    analyser.connect(context.destination);

    document.querySelector('.start').addEventListener('click', function() {
        if(oscillator.context.state === 'suspended') {
            document.querySelector('.stop').classList.remove('active');
            this.classList.add('active')
            oscillator.start();
        } else {
            document.querySelector('.stop').classList.remove('active');
            this.classList.add('active')
            gainNode.gain.value = document.querySelector('.volume').value;
        }
        
    });

    document.querySelector('.stop').addEventListener('click', function() {
        document.querySelector('.start').classList.remove('active');
        this.classList.add('active');
        gainNode.gain.value = 0;
    });

    document.querySelector('.volume').addEventListener('input', function() {
        this.classList.add('active')
        gainNode.gain.value = this.value
    });

    document.querySelector('.change-waveform').addEventListener('click', function() {
        let display = document.querySelector('.display');
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
            oscillator.frequency.value = 261.63 * Math.pow(2, this.value/12);
        }

        keys[i].onmouseover = function(e) {
            if (e.buttons === 1){
                oscillator.frequency.value = 261.63 * Math.pow(2, this.value/12);
            }
        }
    }

    // oscilloscope
    analyser.fftSize = 2048;

    //    analyser.fftSize = Math.pow(2, Math.round(Math.log2(canvas.width)));
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    var canvas = document.getElementById("oscilloscope");
    canvas.width = document.body.clientWidth;
    var canvasCtx = canvas.getContext("2d");

    // draw an oscilloscope of the current audio source

    function draw() {

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);


    canvasCtx.fillStyle = "#fff8dc";

    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "#ff6969";

    canvasCtx.beginPath();

    var sliceWidth = canvas.width * 1.0 / bufferLength;
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

draw();

  }




