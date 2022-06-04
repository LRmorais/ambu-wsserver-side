const { SerialPort, ReadlineParser } = require('serialport')

// Create a port
const portSerial = new SerialPort(
  {
    path: '/dev/cu.usbserial-0001',
    baudRate: 115200,
  },

)
const parser = new ReadlineParser()
portSerial.pipe(parser)
// Open errors will be emitted as an error event
portSerial.on('error', function (err) {
  console.log('Error: ', err.message)
})
parser.on('data', function (data) {
  console.log('Error: ', data)
})
