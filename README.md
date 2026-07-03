# neopets-basic-userscripts
Basic userscripts to be used in tampermonkey (tested on Chrome) on neopets dot com to make little things easier. :)

## remember-last-zap.user.js
Inspired by [@senerio](https://github.com/senerio)'s [rememberzap.user.js](https://github.com/senerio/neopets-userscripts/blob/main/rememberzap.user.js) and updated for the new format of the Lab and P2Lab pages, this script records the last pet/petpet the user selected for a previous zap and automatically selects it (auto-firing the event in the background).

## sdb-training-token.user.js
!!OUT OF DATE!! Using [@senerio](https://github.com/senerio)'s extremely helpful [lastswprice.user.js](https://github.com/senerio/neopets-userscripts/blob/main/lastswprice.user.js) as a template, this script counts the number of each codestone/dubloon that appear on the island/pirate training pages (I couldn't test the ninja training page, but please let me know what I need to change to support that page!) between all pets that have active courses selected and stores them in localStorage, printing the counts below the respective items when you navigate to your SDB.  Now you know exactly how many of each kind to withdraw to pay for training. :)
