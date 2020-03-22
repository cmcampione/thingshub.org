const readline = require("readline");
const path = require("path");
const dotenv = require("dotenv");
const logger = require("./logger");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

// Env configuration
const configPath = path.join(__dirname, "./", "serialMonitor.env");
dotenv.config({ path: configPath });

var serial_port = process.env.SERIAL_PORT;
if (!serial_port) {
	logger.error("SERIAL_PORT not found in .env file", { code: 1 });
	process.exit();
}
var baudRate = process.env.BAUDRATE;
if (!baudRate) {
	logger.error("BAUDRATE not found in .env file", { code: 2 });
	process.exit();
}

const port = new SerialPort(serial_port, { baudRate:  parseInt(baudRate) });

const parser = new Readline();
port.pipe(parser);

parser.on("data", line => {
	logger.info(line, { code: 3 });
});
//
readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true); // ToDo: Why in debug does not works?
process.stdin.on("keypress", (str, key) => {
	if (key.ctrl && key.name === "c") {
		console.log("bye");
		// ToDo: cleaning resource?
		process.exit();
	} else {
		console.log(`You pressed the "${str}" key`);
		console.log();
		console.log(key);
		console.log();
	}
});
console.log("Press any key...");