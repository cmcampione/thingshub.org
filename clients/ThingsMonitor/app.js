const path = require("path");
const dotenv = require("dotenv");
const readline = require('readline');
const thingshub = require('thingshub-js-sdk');

// Env configuration

const configPath = path.join(__dirname, "./", "thingsMonitor.env");
dotenv.config({ path: configPath });

var dummy = process.env.MAIN_API_KEY;

let thingsForConfig = [];
let thingsToMonitor = [
  "f4c3c80b-d561-4a7b-80a5-f4805fdab9bb", // My Home
];

const EndPoint = {
  server: "https://api.thingshub.org:3000",
  api: "https://api.thingshub.org:3000/api"
}
const accountDataContext = new thingshub.AccountDataContext(EndPoint);
// demo@thingshub.org apikey
const accountManager = new thingshub.AccountManager("thingshub", accountDataContext, "491e94d9-9041-4e5e-b6cb-9dad91bbf63d");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    console.log(`You pressed the "${str}" key`);
    console.log();
    console.log(key);
    console.log();
  }
});
console.log('Press any key...');
