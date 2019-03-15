# Sabetha Timer

This is a timer for the Sabetha raid boss in Guild Wars 2. Every 30 seconds a canon spawns to the north, east, south, or west. This is hard for new players to keep track of, so this timer can be used to provide a text to speech call out announcing the spawn of each canon. Call outs will occur 10 seconds in advance and at the time of the canon spawn.

## Guide
```
# install dependencies
yarn install

# building the project
yarn build
# the project is built by webpack and output in the dist directory

# run webpack development server at localhost:7700
yarn dev

# run test server at localhost:9876
yarn test
# tests are written with jasmine and ran with karma
```