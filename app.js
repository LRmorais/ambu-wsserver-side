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
    path: '/dev/ttyUSB_PRESS',
    baudRate: 9600,
    autoOpen: true,
  },

)

const portSerial2 = new SerialPort(
  {
    path: '/dev/ttyUSB_OXIMETRO',
    baudRate: 115200,
    autoOpen: true,
  },

)

const parser = new ReadlineParser()
portSerial.pipe(parser)
const parser2 = new ReadlineParser()
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
  // portSerial2.on('edatarror', function (teste) {
  //   console.log('Error: ', teste)
  // })
  

  console.log("New client connected");
  interval = setInterval(() => getApiAndEmit(socket), 500);
  interval2 = setInterval(() => getApiAndEmit2(socket), 500);
  // getApiAndEmit(socket)
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = socket => {
  parser.on('data', function (data) {
    // console.log(data)
    socket.emit("FromAPI", data);
  })
};
const getApiAndEmit2 = socket => {
  parser2.on('data', function (data) {
    // console.log(data)
    socket.emit("FromAPI2", data);
  })
};


server.listen(port, () => console.log(`Listening on port ${port}`));