---
layout: post
title: "Deploying Node Apps to Heroku"
date: 2017-11-03 08:00
comments: true
categories: javascript heroku webpack typescript node
---

<figure class="full">
  <img src="/images/dumpster_fire/fire.jpg">
  <figcaption>Nothing a little webpack can't fix.</figcaption>
</figure>

On a recent episode of [Adventures in Angular](https://devchat.tv/adv-in-angular/aia-157-building-angular)
the panelists discuss some of the frustrations encountered in deploying an Angular app to a production
environment. Heroku was mentioned as one of the hosting options which got my attention since that is what I've been
neck deep in for the last year. While it's not as simple as just a `git push heroku master` that you
may have become used to in Rails, I'd argue that it's not necessarily a bad thing. I would even say that it's not the
dumpster fire that it was described as. Maybe a small trash can fire, but totally manageable and
sometimes pleasant.

This post is a documentation of my development, release,  and deployment cycle on these types of projects.
Your mileage may vary and if it doesn't work for you I'm offering a 100% monetary refund. The
complete demo app is available at [darrinholst/heroku-nodejs-build-demo](https://github.com/darrinholst/heroku-nodejs-build-demo)
and the library that I extracted out of it is available at [darrinholst/heroku-nodejs-build](https://github.com/darrinholst/heroku-nodejs-build).

I had a few high level goals/requirements for this process:

* A Node backend optionally written in TypeScript because who knew that types were actually useful?
* Angular frontend just because that's what I was used to at the time, but it can be adapted to
  any hip new framework.
* Hosted on Heroku. You give up a little control using a PaaS, but the speed at which you can
  prototype and transition to a production environment is [nice](https://www.youtube.com/watch?v=zYt0WbDjJ4E).
* PostgreSQL for persistence. Storing and manipulating JSON in PostgreSQL has become pretty darn good and it's a first
  class citizen in the Heroku ecosystem.
* A single command to build and test All The Things™. If this command runs without errors you have my
  93% guarantee that it will work on any other machine that is aluminum and has a piece of fruit on
  it somewhere.
* A single release artifact that can be deployed to any environment. This means that you shouldn't
  be manually changing any files to make it work in an environment.

The obligatory caveats:

* I don't use the Angular CLI. This process was developed a few months before it was usable and it
  makes me a little nervous to be locked in to a tool like that. This process could be adapted to
  use the CLI if you just use it for component creation and bundling. See the next point for why I 
  still wouldn't use it for a development server.
* I don't use webpack-dev-server. Not sure why, just never got into it. I also have never
  used a DVR (true story). Just a plain old boring web server that serves files. Maybe a little
  similar to [how you're going to be running in production](https://12factor.net/dev-prod-parity).

  *How do you get through the day without hawt module replacement?* I manage. I just make sure all of my
  states are represented by a unique url and then do a good old fashioned browser refresh...like an
  animal. I do use the `--watch` option for webpack which makes incremental builds really fast. I
  also use [nodemon](https://nodemon.io) for reloading the backend when there are changes and 
  [browsersync](https://www.browsersync.io) for the frontend.
* This was built out before Heroku announced support for containers. I may be Doing It Wrong™ now.

### Building the backend

Let's get this out of the way since there's not a lot different going on from a normal express based
Node backend that you may have seen before. The only novel thing I've added is TypeScript support.
That means we now need a build process for our backend code. All of our building is handled by
webpack. Love it or hate it I've found if you stay just far enough out of the weeds it's not that
bad.

This is the entire config for the backend side.

``` js
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  context: __dirname,
  target: 'node',
  devtool: 'inline-source-map',
  externals: [nodeExternals()],

  output: {
    path: path.join(__dirname, 'dist')
  },

  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      src: path.resolve(__dirname, 'src'),
      universal: path.resolve(__dirname, '../universal/src')
    }
  },

  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      loaders: [
        {
          loader: 'awesome-typescript-loader',
          options: {silent: true, configFileName: path.resolve(__dirname, 'tsconfig.json')}
        }
      ]
    }
  ]}
};
```

[Backend Apps with Webpack](http://jlongster.com/Backend-Apps-with-Webpack--Part-I) is a great post
to learn what is going on here, but the tl;dr is JavasScript and/or TypeScript files go in and
`dist/index.js` comes out ready to run with Node.

Other than that it's a traditional `Controller / Service / Repository` stack.

Authentication is handled by [jwt](https://jwt.io).

Config files are an important part of one of the requirements of having a single release artifact.
Environment variables are the other player in staying away from manually changing files. See [The
Twelve-Factor App](https://12factor.net/config) for why that's important. We use
[node-config](https://github.com/lorenwest/node-config) to handle that. An example of how that looks
in practice is [here](https://github.com/darrinholst/heroku-nodejs-build-demo/blob/master/server/config/default.js).
The take away is that anything that can change or is sensitive should not be hard coded in your
source code.

I won't go in to a lot of detail on persistence since it's not the point of this post. Just know
that we use [pg-promise](https://github.com/vitaly-t/pg-promise) for the runtime part and
[db-migrate](https://github.com/db-migrate/node-db-migrate#readme) to handle schema management.
Personally, I don't have a bunch of schema management since I usually just opt for storing JSON
documents and handling it on the frontend side. Also, I'm not a DBA.

### Building the frontend

The frontend side is where things get a little more complex when it comes to webpack. I'll spare you
scrolling past the entire config, but it's [here](https://github.com/darrinholst/heroku-nodejs-build-demo/blob/master/client/webpack.config.js)
if you want to follow along. I'm not a big fan of injecting css with javascript that webpack steers
you towards so there's some config in there to extract it out to it's own file with `extract-text-webpack-plugin`. There's also
some junk in there to deal with development vs production builds since we usually don't need
minifying and external sourcemaps  when we're in development mode. 

Just like the backend, (Java|Type)Script, Sass, and whatever else you can dream up goes in and bundled 
files come out. This time we're outputing es5 for the browser and putting the output directly
into the backend's `public` directory so that whole file serving thing can work.

Follow your framework of choice guidelines to build out the frontend side. You're on your own there,
but for a small fee I can help you out with that.

### When your code can't decide if it's backend or frontend

The only other source code related thing that I like to add is a `universal` directory that any code
that can be used by both the backend and frontend can live. The example repo has a simple utility
class, but in some of my real projects this is where I've put model objects. This is handy if you
want to share validation code between backend and frontend or if you need those models for building
anything on the backend (what's a web app if it doesn't have a pdf generator 🙄). You'll find another
webpack config in this directory, but that's just used for running tests which we'll get into later.
Both the `webpack.config.js` and `tsconfig.json` in 
[the](https://github.com/darrinholst/heroku-nodejs-build-demo/blob/master/client/webpack.config.js#L33)
[frontend](https://github.com/darrinholst/heroku-nodejs-build-demo/blob/master/client/tsconfig.json#L16)
[and](https://github.com/darrinholst/heroku-nodejs-build-demo/blob/master/server/webpack.config.js#L18)
[backend](https://github.com/darrinholst/heroku-nodejs-build-demo/blob/master/server/tsconfig.json#L16)
reference this directory so it's available either place. Magic!

<img src="/images/dumpster_fire/magic.gif">

### mvn verify

Source code and build config is all taken care of, now let's get back to the one command to verify
everything. Verify comes from my dark days as a Java developer where there was one maven command
(phase?) to compile, test, and package whatever you were delivering. I've always thought this was a
good idea so it has tagged along with me through whatever language I've been working in (the name,
not maven). Also, if somebody breaks the build you can snidely drop them a "Did you even run
verify?"

`scripts/verify` is where we'll stick this script because it's a script and it's named verify `¯\_(ツ)_/¯` . It goes something like...

``` sh
#!/usr/bin/env bash

RESET=$'\e[0m'
BLUE=$'\e[1;34m'

printf "\n${BLUE}[%s] installing dependencies:${RESET}\n" "$(date +%T)" && \
yarn install && \
yarn run -s clean && \
yarn run -s lint && \
yarn run -s test:unit && \
yarn run -s test:integration && \
yarn run -s build:prod && \
yarn run -s test:e2e && \
printf "\n${BLUE}[%s] 🎉  👏  😻  ${RESET}\n\n" "$(date +%T)"
```

This is where you'll define all the steps as to what verifying means to your particular project.
Don't forget the emojis...they're important.

I'm using npm/yarn's built in script running here. Check out [scripty](https://github.com/testdouble/scripty)
if you've tried this before, but ended up gouging yours eyes out after encoding shell scripts in
JSON format.

Verify is at the minimum what you'll do before you push your changes up. If it's fast enough you'll
do it a lot more than that. I've found that the production webpack build and e2e tests are sufficiently slow enough
to deter that and I usually just run the collection of tests that are going to be affected by what
I'm working on.

### Testing

This is as good of time as any to talk about testing. Ready? Do it.

I always start out with good intentions of building a [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
although sometimes my pyramid ends up looking more blocky than I want. There's no better feeling
than running thousands of tests in under a second. That warm, fuzzy feeling usually carries you all the
way through waiting for your end to end tests to complete. (Who tf put those in again?). The
[confidence](https://blog.kentcdodds.com/write-tests-not-too-many-mostly-integration-5e8c7fff591c)
from e2e tests is pretty tempting.

As for tooling, I've settled on [mocha-webpack](https://github.com/zinserjan/mocha-webpack#readme)
for all the unit and integration testing and [protractor](http://www.protractortest.org/#/) + 
[cucumber](https://github.com/cucumber/cucumber-js) for end to end testing.

Testing is such a large and nuanced subject that I'll just leave it at that. There are examples in the demo
project. Feel free to hit me up with any questions.

### Packaging

Also probably coming out of the good ol' Java days is the single release artifact which was the
`.war`. Having 50 different effing environments to deploy to a few years ago helped get it through
my head that there was no sane or safe way of making manual changes after a deployment.

Up until this point everything...config, verify, etc...has been local to your project. This stuff is
usually unique to the project, but I feel like the process of packaging, releasing, and deploying could
be extracted to a set of generic steps and parameterized to specify what's unique to your situation.
Especially since we're targeting Heroku here. The package that came out of this is available 
at [darrinholst/heroku-nodejs-build](https://github.com/darrinholst/heroku-nodejs-build).

Once installed you'll have access to the `package`, `release`, and `deploy` scripts so your scripts
section of `package.json` will need these additions:

``` json
    "package": "node_modules/heroku-nodejs-build/scripts/package",
    "release": "node_modules/heroku-nodejs-build/scripts/release",
    "deploy": "node_modules/heroku-nodejs-build/scripts/deploy"
```

Its only requirements is that you have Docker installed locally and a `scripts/verify` script
exists. Docker is needed because we need the [heroku/heroku](https://hub.docker.com/r/heroku/heroku/)
image so that we can build a [slug](https://devcenter.heroku.com/articles/slug-compiler) that the Heroku
dyno manager knows what to do with. Docker is also nice in that the only dependency (besides node/npm) you
needs is Docker itself. When setting this up in a CI environment I just tell it to run
`npm install && npm run package && npm run release`.

*Side note: before I extracted these scripts to an npm package I didn't even need Node installed on CI.*

The `package` script will run `scripts/verify` from earlier, but local to the docker container this
time. If it runs successfully it will then tar everything up into a slug and put it in the `build`
directory.

### Releasing

Releasing is simply taking those artifacts built from `package` and storing them somewhere. That is
what the `release` script does. It uses the [GitHub Releases](https://github.com/blog/1547-release-your-software)
infrastructure for storage. This is where your deployable artifacts will live and this is where the
`deploy` script will retrieve them from when deploying. It will also assign it a sequential version
number and tag the repo with that so you have a complete trail of everything.

It will need a couple of environment variables set to tell it about which GitHub repo you're working
with and a token for authentication. See the [README](https://github.com/darrinholst/heroku-nodejs-build#usage) for details.

### Deploying

Almost done, hang in there. The act of deploying is just choosing a release and telling the `deploy`
script which Heroku app you want to deploy to. As mentioned earlier, I'm guessing the majority of
people know how to deploy to Heroku by the ol' `git push heroku master`. What that is doing is
hooking into that push, detecting what type of project it is, choosing a
[buildpack](https://devcenter.heroku.com/articles/buildpacks), using that buildpack to create a
slug, and then running that slug on a dyno. What our `deploy` script does is skip the building of
the slug part since we already have a slug from the `package` step, downloads the release that we
want from GitHub and uses that pre built slug to run on a dyno.

*Why not just use Heroku's Node buildpack?* - because we have a non trivial build process for both
our backend and frontend and it will likely timeout with anything other than a simple app. Also, you
probably don't want to be building your application as a part of your deploy. You already know that
you have a good build since you ran all of your tests against it in the `package` step. Just
deploy it [here] please. Although not as relevant now with the introduction of lockfiles with yarn
and npm 5+, another benefit of doing it this way is that your complete dependency tree is locked in
at `package` time. Even with lockfiles installing stuff from the scary internet at deploy time
should still make you raise an eyebrow.

<img src="/images/dumpster_fire/eyebrow.jpg">

### Drink a 🍺

You deserve it for making it this far. There are a few things that I didn't cover like slack
notifications, trimming the size of the slug, uploading sourcemaps, etc., but you're smart you'll
figure it out. Drop in a comment, GitHub issue, or email with any suggestions.

