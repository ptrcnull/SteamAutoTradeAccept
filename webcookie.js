const SteamTradeOffers = require('steam-tradeoffers')
const handleOffers = require('./handleOffers')
var config = require('./getConfig')('webcookie')

var offers = new SteamTradeOffers()

offers.setup({
  sessionID: config.sessionID,
  webCookie: config.webCookie.split('; '),
  APIKey: config.APIKey
})

setInterval(() => handleOffers(offers), 1000)
