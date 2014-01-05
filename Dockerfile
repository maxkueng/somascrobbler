FROM ubuntu:precise
MAINTAINER Max Kueng <me@maxkueng.com>

ENV DEBIAN_FRONTEND noninteractive

# Install Node.js
RUN apt-get install -y python-software-properties python
RUN add-apt-repository ppa:chris-lea/node.js
RUN echo "deb http://us.archive.ubuntu.com/ubuntu/ precise universe" >> /etc/apt/sources.list
RUN apt-get update && apt-get upgrade
RUN apt-get install -y nodejs

ENV DEBIAN_FRONTEND dialog

EXPOSE 3000
ENV DEBUG scrobbler*

VOLUME /src/data

ADD . /src
RUN cd /src; npm install

WORKDIR /src

CMD [ "node", "app.js" ]
