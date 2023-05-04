body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background-color: #222;
}

canvas {
    border: 1px solid #ccc;
}

#gameCanvas {
    display: block;
    margin: 0 auto;
}

#gameOverScreen {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}