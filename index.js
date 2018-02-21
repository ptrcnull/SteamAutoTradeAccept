const SteamTradeOffers = require('steam-tradeoffers')
const config = require('./config.json')
var offers = new SteamTradeOffers()
offers.setup({
  sessionID: config.sessionID,
  webCookie: config.webCookie.split('; '),
  APIKey: config.apiKey
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
      body.response.trade_offers_received.forEach(offer => {
        if (offer.trade_offer_state !== 2) return

        console.log(`Got an offer ${offer.tradeofferid} from ${offer.steamid_other}`)

        if (offer.items_to_receive) {
          console.log('Items to receive: ' +
            offer.items_to_receive.map(item => {
              var desc = descriptions[`${item.appid};${item.classid};${item.instanceid}`]
              return desc.name + ' (' + desc.type + ')'
            }).join(', ') + '\n')
        }

        if (offer.items_to_give) {
          console.log('Items to give: ' +
            offer.items_to_give.map(item => {
              var desc = descriptions[`${item.appid};${item.classid};${item.instanceid}`]
              return desc.name + ' (' + desc.type + ')'
            }).join(', ') + '\n')
        }

        if (offer.message && offer.message !== '') {
          console.log('Message: ' + offer.message)
        }

        if (!offer.items_to_give) {
          offers.acceptOffer({
            tradeOfferId: offer.tradeofferid,
            partnerSteamId: offer.steamid_other
          }, (err, result) => {
            if (err) return console.error(err)

            console.log('Offer ' + offer.tradeofferid + ' accepted')

            offers.getOffer({tradeofferid: offer.tradeofferid}, (err, result) => {
              if (err) return console.error(err)

              if (result && result.response && result.response.offer && result.response.offer.tradeid) {
                offers.getItems({tradeId: result.response.offer.tradeid}, (err, result) => console.log(err || 'Got items:\n' + result.map(item => `http://steamcommunity.com/profiles/${item.owner}/inventory/#${item.appid}_${item.contextid}_${item.id}`).join('\n')))
              }
            })
          })
        } else {
          offers.declineOffer({tradeOfferId: offer.tradeofferid}, (err, result) => console.log(err || 'Offer ' + offer.tradeofferid + ' declined'))
        }
      })
    }
  })
}

setInterval(handleOffers, 1000)
