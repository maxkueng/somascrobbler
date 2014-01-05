SomaScrobbler
=============

This scrobbles [SomaFM](http://somafm.com/) radio stations to
[Last.fm](http://www.last.fm/).

## Installation

This requires [Node.js](http://nodejs.org/) version 0.10 or greater.

Clone this repository and change in to the directory.
Then copy "config.dist.json" to "config.json" and make the necessary
changes.

```bash
cd somascrobbler
cp config.dist.json config.json
vim config.json
```

Then install the dependencies and run "app.js".

```bash
npm install
node app.js
```
