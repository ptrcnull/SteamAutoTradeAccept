const SteamTradeOffers = require('steam-tradeoffers')
const chalk = require('chalk')
var handledOffers = []
var config
try {
  config = require('./config.json')
  console.log(config)
} catch (e) {
  config = {
    sessionID: process.env.STEAM_SESSIONID,
    webCookie: process.env.STEAM_WEBCOOKIE,
    APIKey: process.env.STEAM_APIKEY
  }
  console.log(config)
}

var offers = new SteamTradeOffers()

offers.setup({
  sessionID: config.sessionID,
  webCookie: config.webCookie.split('; '),
  APIKey: config.APIKey
})

function handleOffers () {
  offers.getOffers({
    get_received_offers: 1,
    active_only: 1,
    time_historical_cutoff: Math.round(Date.now() / 1000),
    get_descriptions: 1
  }, (err, body) => {
    if (err) return console.error(err)

    if (body && body.response && body.response.trade_offers_received) {
      var descriptions = {}
      body.response.descriptions = body.response.descriptions || []
      body.response.descriptions.forEach(desc => { descriptions[`${desc.appid};${desc.classid};${desc.instanceid}`] = desc })
      var offersList = body.response.trade_offers_received.filter(offer => offer.trade_offer_state === 2 && !(handledOffers.includes(offer.tradeofferid)))
      offersList.forEach(offer => {
        handledOffers.push(offer.tradeofferid)

        console.log(chalk.blue('Got an offer'), offer.tradeofferid, chalk.blue('from'), offer.steamid_other)

        if (offer.items_to_receive) {
          console.log('Items to receive: ' +
            offer.items_to_receive.map(item => {
              var desc = descriptions[`${item.appid};${item.classid};${item.instanceid}`]
              return chalk.green(desc.name + ' (' + desc.type + ')')
            }).join(', '))
        }

        if (offer.items_to_give) {
          console.log('Items to give: ' +
            offer.items_to_give.map(item => {
              var desc = descriptions[`${item.appid};${item.classid};${item.instanceid}`]
              return chalk.red(desc.name + ' (' + desc.type + ')')
            }).join(', '))
        }

        if (offer.message && offer.message !== '') console.log(chalk.blue('Message:'), offer.message, '\n')

        if (!offer.items_to_give || offer.is_our_offer) {
          offers.acceptOffer({tradeOfferId: offer.tradeofferid, partnerSteamId: offer.steamid_other}, (err, result) => console.log(err || chalk.green('Offer ' + offer.tradeofferid + ' accepted')))
        }
      })
    }
  })
}

setInterval(handleOffers, 1000)
