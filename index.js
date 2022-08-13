const filename = "./assets/John Rzeznik - I'm Still Here (HQ) [Official].mp3";
// const filename = "cbtk.mp3";

let audio = new Audio();
audio.src = filename;
audio.crossOrigin = "anonymous";
const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // for safari browser

const canvas = document.getElementById("canvas");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

const ctx = canvas.getContext("2d");

let audioSource = null;
let analyser = null;

audioSource = audioCtx.createMediaElementSource(audio); // creates an audio node from the audio source
analyser = audioCtx.createAnalyser(); // creates an audio node for analysing the audio data for time and frequency
audioSource.connect(analyser); // connects the audio source to the analyser. Now this analyser can explore and analyse the audio data for time and frequency
analyser.connect(audioCtx.destination); // connects the analyser to the destination. This is the speakers
analyser.fftSize = 1024; // controls the size of the FFT. The FFT is a fast fourier transform. Basically the number of sound samples. Will be used to draw bars in the canvas
// analyser.maxDecibels = -30;
// analyser.maxDecibels = -40;
const bufferLength = analyser.frequencyBinCount; // the number of data values that dictate the number of bars in the canvas. Always exactly one half of the fft size
const dataArray = new Uint8Array(bufferLength); // coverting to unsigned 8-bit integer array format because that's the format we need

const heightCenter = canvas.offsetHeight / 2;

let x = 0; // used to draw the bars one after another. This will get increased by the width of one bar

function drawLine(ctx, begin, end, stroke = 'black', width = 1) {
    if (stroke) {
        ctx.strokeStyle = stroke;
    }

    if (width) {
        ctx.lineWidth = width;
    }

    ctx.beginPath();
    ctx.moveTo(...begin);
    ctx.lineTo(...end);
    ctx.stroke();
}

function animate() {
    x = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const grd = ctx.createLinearGradient(0, 0, canvas.offsetWidth * 7, canvas.offsetHeight * 7);
    const barWidth = (canvas.offsetWidth / bufferLength + 1) - 1; // the width of each bar in the canvas
    grd.addColorStop(0, "black");
    grd.addColorStop(1, "white");

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    drawLine(ctx, [0, heightCenter], [canvas.width, heightCenter], '#424242', 0.5 );
    analyser.getByteFrequencyData(dataArray); // copies the frequency data into the dataArray in place. Each item contains a number between 0 and 255
    drawVisualizer({ bufferLength, dataArray, barWidth });
    requestAnimationFrame(animate); // calls the animate function again. This method is built in
}

function scale(fromRange, toRange, number) {
    const d = (toRange[1] - toRange[0]) / (fromRange[1] - fromRange[0]);
    return (number - fromRange[0]) * d + toRange[0];
}

const drawVisualizer = ({ bufferLength, dataArray, barWidth }) => {
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        const rev = scale([0, 255], [0, 1], barHeight);
        const red = 255 * 0.5 * (Math.cos(Math.PI * (rev - 1)) + 1);
        const green = 255 * 0.5 * (Math.cos(2 * Math.PI * rev - 3) + 1);
        const blue = 255 * 0.5 * (Math.cos(Math.PI * (rev + 0)) + 1);

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(
            x,
            heightCenter - barHeight,
            barWidth,
            barHeight * 2,
        );
        x += barWidth + 1;
    }
}

const backButton = document.querySelector('#back-button');
const playButton = document.querySelector('#play-button');
const stopButton = document.querySelector('#stop-button');
const forwardButton = document.querySelector('#forward-button');
const timeIncrement = 5;

playButton.addEventListener("click", () => {
    audioCtx.resume();
    audio.play()
});

stopButton.addEventListener("click", () => audio.pause());

backButton.addEventListener("click", () => {
    audio.currentTime = audio.currentTime - timeIncrement;
});

forwardButton.addEventListener("click", () => {
    audio.currentTime = audio.currentTime + timeIncrement;
});

window.addEventListener('resize', resizeCanvas)

animate();



