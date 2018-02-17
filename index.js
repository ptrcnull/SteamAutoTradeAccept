const SteamUser = require('steam-user')
const SteamTotp = require('steam-totp')
const SteamCommunity = require('steamcommunity')
const TradeOfferManager = require('steam-tradeoffer-manager')

var logOnOptions = require('./config.json')
const client = new SteamUser()
const community = new SteamCommunity()

const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'en'
})

logOnOptions.twoFactorCode = SteamTotp.generateAuthCode(logOnOptions.secret)

client.logOn(logOnOptions)

client.on('loggedOn', () => {
  console.log('Logged into Steam')
  client.setPersona(SteamUser.Steam.EPersonaState.Online)
})

client.on('webSession', (sessionid, cookies) => {
  manager.setCookies(cookies)

  community.setCookies(cookies)
  community.startConfirmationChecker(10000, logOnOptions.secret);
})

manager.on('newOffer', offer => {
  if (offer.itemsToGive.length === 0) {
    offer.accept((err, status) => {
      console.log(err || `Accepted offer. Status: ${status}.`)
    })
  }
})
