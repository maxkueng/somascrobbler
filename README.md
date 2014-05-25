SomaScrobbler
=============

This scrobbles [SomaFM](http://somafm.com/) radio stations to
[Last.fm](http://www.last.fm/).

**Note:** If you want to scrobble SomaFM radio from your desktop computer while
listening, I recommend checking out [moneypenny](https://github.com/moneypenny)'s
[SomaPlayer Chrome extension](https://chrome.google.com/webstore/detail/somaplayer/dpcghdgbhjkihgnnbojldhjmcbieofgo).

**Note 2:** If you want to write your own software that consumes SomaFM track data,
just like the SomaPlayer extension, please check out [api.somascrobbler.com](http://api.somascrobbler.com/)

## Installation

This requires [Node.js](http://nodejs.org/) version 0.10.26 or greater.

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

Visit the web interface http://127.0.0.1:3000 (unless configured
differently) and add accounts.

## License

MIT License

Copyright (c) 2014 Max Kueng (http://maxkueng.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
