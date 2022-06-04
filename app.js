const express = require("express");
const http = require("http");
const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport')
const EventEmitter = require('events');
EventEmitter.setMaxListeners(0)


const app = express();
const server = http.createServer(app);
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'))
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
  res.render('index.html')
})

// Create a port
const portSerial = new SerialPort(
  {
    path: '/dev/cu.usbserial-0001',
    baudRate: 115200,
    autoOpen: false,
  },

)

// const portSerial2 = new serialPort(
//   '/dev/cu.usbserial-4',
//   { baudRate: 115200 },
// )

const parser = new ReadlineParser()
portSerial.pipe(parser)
// const parser2 = new serialPort.parsers.Readline();

// portSerial2.pipe(parser2)


const index = require("./routes/index");
app.use(index);

const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

let interval;


io.on("connection", (socket) => {
  console.log(socket.id)
  portSerial.on('error', function (err) {
    console.log('Error: ', err.message)
  })
  portSerial.open(function (err) {
    if (err) {
      return console.log('Error opening port: ', err.message)
    }

  })
  portSerial.on('open', function () {
    console.log('open teste')
  })
  console.log("New client connected");
  interval = setInterval(() => getApiAndEmit(socket), 500);
  // getApiAndEmit(socket)
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = socket => {
  parser.on('data', function (data) {
    // console.log('Error: ', data)
    socket.emit("FromAPI", data);
  })

  // parser2.on('data', (line) => {
  //   socket.emit("FromAPI2", line);
  // })
};

server.listen(port, () => console.log(`Listening on port ${port}`));