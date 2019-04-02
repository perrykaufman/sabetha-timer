# Sabetha Timer

This is a web application can be used to help defeat the [Sabetha](https://wiki.guildwars2.com/wiki/Sabetha_the_Saboteur) raid boss in Guild Wars 2. Every 30 seconds, canons that fire at the players appear to the north, east, south, or west of the boss platform in a predictable order. This timer uses text to speech to call out when the canons appear that players can leave at the correct time to destroy them.

## Guide
```
# install dependencies
yarn install

# build the project
yarn build
# the project is built by webpack and output in the /dist directory

# run webpack development server at localhost:7700
yarn dev

# run test server at localhost:9876
yarn test
# tests are written with jasmine and ran with karma
```