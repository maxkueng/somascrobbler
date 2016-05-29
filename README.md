![SomaScrobbler](./static/images/logo.png)
==========================================

**SomaScrobbler** is a server that scrobbles [SomaFM](http://somafm.com/) radio
stations to [Last.fm](http://www.last.fm/).  It relies on metadata provided by
an instance of [SomaScrobbler
API](https://github.com/maxkueng/somascrobbler-api). It can handle multiple
Last.fm accounts at once.

_**Note:** If you want to scrobble SomaFM radio from your desktop computer while
listening, I recommend checking the [SomaPlayer Chrome
extension](https://chrome.google.com/webstore/detail/somaplayer/dpcghdgbhjkihgnnbojldhjmcbieofgo)
by [cheshire137](https://github.com/cheshire137). It's powered by the SomaScrobbler API.  
If you want to write your own software that consumes SomaFM track data, just
like the SomaPlayer extension, please check out
[api.somascrobbler.com](https://api.somascrobbler.com/) ._


## Installation

 - Download and install Node.js or io.js. You should use a recent version.
 - Then install the `somascrobbler` package globally (`-g`) from npm. You
   may have to prefix the sommand with `sudo` depending on your setup.

```sh
npm install somascrobbler -g
```

## Configuration

Create a config file "$HOME/.somascrobblerrc" or "/etc/somascrobblerrc",
or any other location supported by the [rucola](https://www.npmjs.com/package/rucola)
module.

Here's a sample config file:

```ini
loglevel    =   info
datadir     =   ./data
trackapi    =   https://api.somascrobbler.com:443

[lastfm]
apikey      =   your_lastfm_api_key_123456789012
apisecret   =   your_lastfm_api_secret_097654321

[admin]
username    =   admin
password    =   secret

[server]
address     =   0.0.0.0
port        =   3000
uri         =   http://localhost:3000
```

 - `loglevel` *(string; optional; default: info)*: The log level. Can be either
   "debug", "info", "warn", or "error".

 - `datadir` *(string; optional; default: ./data)*: Path to a directory where
   SomaScrobbler will store account data.

 - `trackapi` *(string; optional; default: https://api.somascrobbler.com:443)*:
   URL to the SomaScrobbler API endpoint including port.

 - `lastfm.apikey` *(string; required)*: Your Last.fm API key.

 - `lastfm.apisecret` *(string; required)*: Your Last.fm API secret.

 - `admin.username` *(string; optional; default: admin)*: Username for the web
   interface.

 - `admin.password` *(string; recommended; default: rompotaya)*: Password for
   the web interface. The default password is Vulcan for "maintenance". You
   should change this.

 - `server.address` *(string; optional; default: 0.0.0.0)*: The IP of the
   interface the web server will listen on.

 - `server.port` *(integer; optional; default: 3000)*: The port on which the
   web server will listen on.

 - `server.uri` *(string; recommended; default: http://localhost:3000)*: The
   full public URI including port unless you're using port 80 for HTTP or 443
   for HTTPS. This is used as the callback URL for Last.fm authentication.

Configuration options can also be provided through environment variables. For
example, the valirable key for `lastfm.apikey` would be
`SOMASCROBBLER_LASTFM_APIKEY`.

## Run

```sh
somascrobbler
```

Or provide an alternate config file:

```sh
somascrobbler --config=path/to/theconfig
```

Additionally, configuration options can be overridden through command-line
arguments:

```sh
somascrobbler --lastfm-apikey=your_lastfm_api_key_123456789012 ...
```

Visit the web interface under http://localhost:3000 (unless configured
differently) and log in using the credentials provided in the config file.

Click "Add account", select a SomaFM station and click "Authenticate". After
you have allowed SomaScrobbler to access your Last.fm profile it should start
scrobbling as soon as there's a new track.

## Docker

SomaScrobbler is also available as a Docker image. It should work with Docker
1.5 or later.

Pull the image from the registry:

```sh
docker pull maxkueng/somascrobbler:latest
```

SomaScrobbler stores data about your Last.fm accounts in `/usr/src/app/data`
and provides access to it via volume which you should mount in order to create
backups and such. You should not override the `dataDir` configuration option in
this case.

To run it, provide all non-default configuration options as environment variables:

```sh
docker run -d \
  -p 3000:3000 \
  -e SOMASCROBBLER_LASTFM_APIKEY=your_lastfm_api_key_123456789012 \
  -e SOMASCROBBLER_LASTFM_APISECRET=your_lastfm_api_secret_097654321 \
  -e SOMASCROBBLER_SERVER_URI=http://localhost:3000 \
  -e SOMASCROBBLER_ADMIN_PASSWORD=topsecret \
  -v /path/to/somascrobbler/data:/usr/src/app/data \
  --restart on-failure \
  maxkueng/somascrobbler:latest
```

You can also mount an external config file instead of using environment
variables (or use a combination of both):

```sh
docker run -d \
  -p 3000:3000 \
  -v /path/to/somascrobbler/data:/usr/src/app/data \
  -v /path/to/the/config/file:/etc/somascrobblerrc \
  --restart on-failure \
  maxkueng/somascrobbler:latest
```

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
