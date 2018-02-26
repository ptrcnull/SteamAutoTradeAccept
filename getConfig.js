module.exports = name => {
  var config
  try {
    config = require('./' + name + '.json')
  } catch (e) {
    config = {
      username: process.env.STEAM_USERNAME,
      password: process.env.STEAM_PASSWORD,
      APIKey: process.env.STEAM_APIKEY,
      sharedSecret: process.env.STEAM_SHAREDSECRET,
      webCookie: process.env.STEAM_WEBCOOKIE,
      sessionID: process.env.STEAM_SESSIONID
    }
  }
  console.log(config)
  return config
}
