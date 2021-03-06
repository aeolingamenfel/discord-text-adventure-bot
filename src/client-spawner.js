const MessageHandler = require("./MessageHandler.js");
const Discord = require("discord.js");
const Logger = require("./Logger.js");

module.exports = function(appConfig) {
  const client = new Discord.Client();
  // Handler that will take messages and pass them through to Frotz
  let messageHandler = null;

  client.login(appConfig.api.discord.token);

  process.on("exit", function(){
    // gracefully clean up connection to Discord
    client.destroy();

    // we need to close the game so there is not a lingering child process
    // running in the background
    messageHandler.closeGame();
  });

  client.once("ready", () => {
    console.log(`Logged in as ${client.user.username} (${client.user.id})`);
    messageHandler = new MessageHandler(client, new Logger(), appConfig);

    if (messageHandler.mode == 1 && messageHandler.game) {
      messageHandler.setBotOnline(messageHandler.game.config.prettyName);
    } else {
      messageHandler.setBotIdle();
    }
  });

  client.on("message", (message) => {
    messageHandler.onMessage(message);
  });

  client.on("disconnect", () => {
    // we need to close the game so there is not a lingering child process
    // running in the background
    messageHandler.closeGame();
  });
};
