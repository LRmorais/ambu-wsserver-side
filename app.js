const express = require("express");
const http = require("http");
const serialPort = require('serialport');
const EventEmitter = require('events');
EventEmitter.setMaxListeners(0)


const app = express();
const server = http.createServer(app);
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;

const portSerial = new serialPort(
  '/dev/cu.usbserial-0001',
  {baudRate: 115200},
)

const portSerial2 = new serialPort(
  '/dev/cu.usbserial-4',
  {baudRate: 115200},
)

const parser = new serialPort.parsers.Readline();
const parser2 = new serialPort.parsers.Readline();

portSerial.pipe(parser)
portSerial2.pipe(parser2)


const index = require("./routes/index");
app.use(index);

const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

let interval;

io.on("connection", (socket) => {

  console.log("New client connected");
  // if (interval) {
  //   clearInterval(interval);
  // }
  interval = setInterval(() => getApiAndEmit(socket), 500);
  // getApiAndEmit(socket)
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = socket => {
  // const response = new Date();
  parser.on('data', (line) => {
    socket.emit("FromAPI", line);
  })
  parser2.on('data', (line) => {
    socket.emit("FromAPI2", line);
  })
  // Emitting a new message. Will be consumed by the client
  // socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));