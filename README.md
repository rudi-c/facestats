# Installation

## Mac

[Install Node.js and npm](http://blog.teamtreehouse.com/install-node-js-npm-mac), then

```
cd facestats/
npm install
git submodule update --init
cd lib/htmlparser2
npm install
cd ../..
npm start
```

## Development

Install the Typescript linter

```
npm install -g tslint typescript
```

and lint via `npm run lint`

# Usage

[Download a copy of your Facebook data.](https://www.facebook.com/settings). Unzip, open your browser at `localhost:3000`, choose `messages.htm` from your facebook data. This will generate plots and information. This may take a few minutes -- I personally have 30mb of message history over 4+ years. Currently all the code runs locally nothing gets uploaded to any server.

Facebook's data is very inconsistent, it may be missing user names, etc.

# Ideas & design discussion

See https://dynalist.io/d/wuhWHlISJ3kV1bEF_YWatgQa
