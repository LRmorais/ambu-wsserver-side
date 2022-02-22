const express = require('express');
const serialPort = require('serialport');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'))
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
  res.render('index.html')
})

const port = new serialPort(
    '/dev/cu.usbserial-0001',
    {baudRate: 115200},
)

const parser = new serialPort.parsers.Readline();

port.pipe(parser)

let messages = ['teste']

io.on('connection', socket => {
  console.log('conectado')  
  // parser.on('data', (line) => {
  // console.log(line)
  // socket.broadcast.emit('sendMessage', line);
  // })
  socket.broadcast.emit('sendMessage', messages)
})
server.listen(8888);