SomaScrobbler
=============

This scrobbles [SomaFM](http://somafm.com/) radio stations to
[Last.fm](http://www.last.fm/).

**Note:** If you want to scrobble SomaFM radio from your desktop computer while
listening, I recommend checking out [moneypenny](https://github.com/moneypenny)'s
[SomaPlayer Chrome extension](https://chrome.google.com/webstore/detail/somaplayer/dpcghdgbhjkihgnnbojldhjmcbieofgo).

**Note 2:** If you want to write your own software that consumes SomaFM track data,
just like the SomaPlayer extension, please check out [api.somascrobbler.com](http://api.somascrobbler.com/)

## Usage

### Installation

This requires a recent version of [Node.js](http://nodejs.org/).

Clone this repository and change in to the directory. Then install the dependencies:

```sh
npm install
```

### Configuration

Create a config file called ".somascrobblerrc". Here's what a config file might look like:

```
dataDir = ./data
trackApi = http://api.somascrobbler.com:80
lastfmApiKey = your_lastfm_api_key_123456789012
lastfmApiSecret = your_lastfm_api_secret_097654321
username = admin
password = secret
address = 0.0.0.0
port = 3000
uri = http://localhost:3000
```

 - `dataDir` *(default: ./data)*: Path to a directory where SomaScrobbler will
   store account data.
 - `trackApi` *(default: http://api.somascrobbler.com:80)*: URL to the
   SomaScrobbler API endpoint including port.
 - `lastfmApiKey`: Your Last.fm API key.
 - `lastfmApiSecret`: Your Last.fm API secret.
 - `username` *(default: admin)*: Username for the web interface.
 - `password` *(default: rompotaya)*: Password for the web interface. The
   default password is Vulcan for "maintenance". You should change this.
 - `address` *(default: 0.0.0.0)*: The IP of the interface the web server will listen on.
 - `port` *(default: 3000)*: The port on which the web server will listen on.
 - `uri` *(default: http://localhost:3000)*: The full public URI including port
   unless you're using port 80 for HTTP or 443 for HTTPS. This is used as the
   callback URL for Last.fm authentication.


### Start

```sh
npm start
```

Visit the web interface under http://localhost:3000 (unless configured
differently) and log in using the credentials provided in the config file.

Click "Add account", select a SomaFM station and click "Authenticate". After
you have allowed SomaScrobbler to access your Last.fm profile it should start
scrobbling immediately.

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
