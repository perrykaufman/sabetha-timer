# Sabetha Timer

This is a web application that can be used to help defeat the [Sabetha](https://wiki.guildwars2.com/wiki/Sabetha_the_Saboteur) raid boss in [Guild Wars 2](https://en.wikipedia.org/wiki/Guild_Wars_2). Every 30 seconds, a canon that fires at the players will appear to the north, east, south, or west of the boss platform. This timer uses the browser text to speech api to call out when a canon appears so that players can leave at the correct time to destroy them.

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