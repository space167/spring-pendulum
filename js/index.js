let canvas = document.getElementById('spring-pendulum')
let ctx = canvas.getContext('2d');

const clientWidth = 240
const clientHeight = 320

canvas.width = clientWidth
canvas.height = clientHeight

const widthDraw = 100
let marginTop = 15

//Parameters
const elemWeight = document.getElementById('m')
const elemRigidity = document.getElementById('k')
const elemDeviation = document.getElementById('x0')

//Characteristics
const elemW0 = document.getElementById('w0')
const elemX = document.getElementById('x')
const elemT = document.getElementById('t')
const elemQ = document.getElementById('q')
const btnToggleAnimation = document.getElementById('btn-toggle-animation')

btnToggleAnimation.addEventListener('click', startAnimation)

function startAnimation() {
  btnToggleAnimation.removeEventListener('click', startAnimation)
  btnToggleAnimation.addEventListener('click', stopAnimation)
  btnToggleAnimation.innerText = 'Stop'

  elemWeight.disabled = true;
  elemRigidity.disabled = true;
  elemDeviation.disabled = true;

  fps.start();
}

function stopAnimation() {
  btnToggleAnimation.removeEventListener('click', stopAnimation)
  btnToggleAnimation.addEventListener('click', startAnimation)
  btnToggleAnimation.innerText = 'Play'

  elemWeight.disabled = false;
  elemRigidity.disabled = false;
  elemDeviation.disabled = false;

  fps.stop();
}

let params = {
  m: Number(elemWeight.value),
  k: Number(elemRigidity.value),
  x0: Number(elemDeviation.value),
}

let characteristics = {
  w0: 0,
  time: 0,
  x: 0,
  quantity: 0
}

characteristics.w0 = calcW0(params.k, params.m)

function calcW0(k, m) {
  const w0 = roundUpTo(Math.sqrt(k / m), 3)
  characteristics.w0 = w0
  elemW0.innerText = characteristics.w0
  return w0;
}

elemWeight.addEventListener('change', onChangeField)
elemRigidity.addEventListener('change', onChangeField)
elemDeviation.addEventListener('change', onChangeField)

let checkFull = false;
let fps = new FpsCtrl(60, function (e) {
  characteristics.x = params.x0 * Math.cos(characteristics.w0 * characteristics.time)

  elemX.innerText = roundUpTo(characteristics.x, 2)
  if (checkFull) {
    if (Math.round(characteristics.x) === params.x0) {
      characteristics.quantity += 1
      elemQ.innerText = characteristics.quantity
      checkFull = false
    }
  }

  if (Math.round(characteristics.x) < 0) {
    checkFull = true;
  }

  elemT.innerText = `${roundUpTo(characteristics.time, 2)}c`
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawPendulum(widthDraw, marginTop, characteristics.x)
})

drawPendulum(widthDraw, marginTop, params.x0)

function onChangeField(event) {
  resetCharacteristics()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  params[event.target.dataset.field] = Number(event.target.value)
  const {k, m} = params;
  calcW0(k, m)
  drawPendulum(widthDraw, marginTop, params.x0)
}

function roundUpTo(num, afterPoint) {
  const p = Math.pow(10, afterPoint)
  return Math.round(num * p) / p
}

function drawPendulum(widthLine, marginTop, x) {
  const halfWidthLine = widthLine / 2;
  const centerCanvas = clientWidth / 2;

  const startPositionX = centerCanvas - halfWidthLine;
  const endPositionX = centerCanvas + halfWidthLine;

  drawLine(startPositionX, marginTop, endPositionX, marginTop)

  const heightVerticalLineCenter = 10
  const endLineCenterY = marginTop + heightVerticalLineCenter

  drawLine(centerCanvas, marginTop, centerCanvas, endLineCenterY)

  const columnsAmount = 20
  const heightColumn = 10
  const inlineColumn = 4
  const lineWeight = 1
  const lengthBetweenColumn = widthLine / columnsAmount

  for (let i = 0; i < columnsAmount; i++) {
    drawLine(
      startPositionX + i * lengthBetweenColumn,
      marginTop,
      startPositionX + i * lengthBetweenColumn + inlineColumn,
      marginTop - heightColumn,
      lineWeight
    )
  }

  const heightStep = (23 + (x)) / 1.3
  const widthStep = 42 - heightStep

  let savePosX = centerCanvas - (widthStep / 2)
  let savePosY = endLineCenterY + heightStep / 2

  drawLine(centerCanvas, endLineCenterY, savePosX, savePosY)

  const countSteps = 6
  let vectorStep = 1;
  for (let j = 0; j < countSteps; j++) {
    drawLine(savePosX, savePosY, savePosX + vectorStep * widthStep, savePosY + heightStep)
    savePosX = savePosX + vectorStep * widthStep
    savePosY = savePosY + heightStep
    vectorStep = -vectorStep
  }

  drawLine(savePosX, savePosY, centerCanvas, savePosY + heightStep / 2)
  savePosY = savePosY + heightStep / 2

  drawLine(centerCanvas, savePosY, centerCanvas, savePosY + heightStep)
  savePosY = savePosY + heightStep

  drawCircle(centerCanvas, savePosY, Math.cbrt(params.m) * 12, 0, 2 * Math.PI)
}

function drawCircle(x, y, radius, startAngle, endAngle, anticlockwise) {
  ctx.beginPath();
  ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  ctx.fill();
}

function drawLine(startX, startY, endX, endY, lineWidth = 2) {
  ctx.beginPath()
  ctx.lineWidth = lineWidth
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()
}

function FpsCtrl(fps, callback) {
  let delay = 1000 / fps,
    time = null,
    frame = -1,
    tref;

  function loop(timestamp) {
    if (time === null) time = timestamp;
    let seg = Math.floor((timestamp - time) / delay);
    if (seg > frame) {
      frame = seg;
      callback({
        time: timestamp,
        frame: frame
      })
    }
    characteristics.time = ((timestamp - time) / 1000)
    tref = requestAnimationFrame(loop)
  }

  this.isPlaying = false;

  this.start = function () {
    resetCharacteristics()

    if (!this.isPlaying) {
      this.isPlaying = true;
      tref = requestAnimationFrame(loop);
    }
  };

  this.stop = function () {
    if (this.isPlaying) {
      cancelAnimationFrame(tref);
      this.isPlaying = false;
      time = null;
      frame = -1;
    }
  };
}

function resetCharacteristics() {
  characteristics = {
    ...characteristics,
    time: 0,
    x: 0,
    quantity: 0
  }

  elemX.innerText = characteristics.x
  elemT.innerText = characteristics.time
  elemQ.innerText = characteristics.quantity

  checkFull = false
}


