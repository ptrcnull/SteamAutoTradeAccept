const SteamUser = require('steam-user')
const SteamTotp = require('steam-totp')
const SteamTradeOffers = require('steam-tradeoffers')
const handleOffers = require('./handleOffers')

var config = require('./getConfig')('standalone')

var client = new SteamUser()

const logOnOptions = {
  accountName: config.username,
  password: config.password,
  twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
}

client.logOn(logOnOptions)
client.on('loggedOn', () => {
  console.log('Logged into Steam')
  client.setPersona(SteamUser.Steam.EPersonaState.Online)
})

var offers = new SteamTradeOffers()

client.on('webSession', (sessionid, cookies) => {
  offers.setup({
    sessionID: sessionid,
    webCookie: cookies,
    APIKey: config.APIKey
  })
  handleOffers(offers)
  setInterval(() => handleOffers(offers), 1000)
})
