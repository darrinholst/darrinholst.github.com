---
layout: post
title: "Web Working with Webpack"
date: 2016-09-11 08:00
comments: true
categories: javascript
---

### The Problem

You have a computational intense piece of javascript that is blocking browser interactions and
animations and making you question why you even try building desktop class web applications. In my case
I was trying to bring spreadsheet-like functionality into an application complete with formulas that
referenced other formulas that referenced other formulas to the brink of infinity. I ended up needing
to calculate tens of thousands of "cells" to get the data I needed.
While these calculations can usually complete in under 500 milliseconds (on a fast
browser/computer), a 1/2 second where the browser can't do anything makes for a less than ideal
experience. (Think back in the day when you tried to use `async: false` on your ajax requests
because you couldn't figure this callback stuff out. Was I the only one to try that? 🤔)

### Solution #1 - setTimeout

In a server or native application we'd fire up a new thread to punt all of these computations
to. The browser, for better or for worse, is all like #lolThreads. I was not familiar enough with web
workers at the time to immediately reach for it so I improvised with the `setTimeout`
trick. It went something like:

``` javascript
function calculate(years, callback) {
  processYear(years, {}, callback);
}

function processYear(years, results, callback) {
  if (years.length) {
    doAllTheThingsForYear(years.shift(), results);
    setTimeout(processYear, 0, years, results, callback);
  } else {
    callback(results);
  }
}
```

This actually worked quite well. It uses `setTimeout` to give up control after each year and lets the
browser do all the things it needs to do. Although it works well it still felt a little hackish and
assumes you have a good seam like processing over a number of years to give up control at. Also, for
our tests we don't want to just give away milliseconds like that because they add up over time.

### Solution #2 - web worker

So I let the setTimeout hack ride for a week or two before I listened to this [Adventures in
Angular](https://devchat.tv/adv-in-angular/108-aia-web-workers-in-angular-with-torgeir-helgevold)
episode where they talked about web workers in Angular. They spent a good amount of time trying to
come up with real world examples of where web workers would help. As I listened it occurred to me
that I was sitting on one of the quintessential examples...a spreadsheet...so it made me give them
another look.

When I realized that a web worker loaded an entirely separate script resource I almost gave up,
but we're using [webpack](https://webpack.github.io/) so it's just another entry, right? Kind of. My first attempt
was exactly that which was adding another entry with all my web workin code. The problem with
that is this other script runs in a completely different thread outside of your page so when it
tries to load it has no idea about the webpack module loading. In other words, it didn't work.

I thought to myself...surely someone has done this before with webpack so off to
[duckduckgo](https://lmddgtfy.net/?q=webpack%20web%20worker) it was.
It turns out that there is an
[example](https://github.com/webpack/webpack/tree/master/examples/web-worker) of how to do this in
the webpack repo itself. Unfortunately, there's not a lot of actual words in this example so you have
to have both a good understanding of web workers and webpack to interpret it. The result is going to
be a little anti-climatic since my solution looks a lot like the example, but here goes:

My first step was to make the calculator code where I had previously had the `setTimeout`s synchronous:

``` javascript
function calculate(years) {
  const results = {};
  years.forEach((year) => doAllTheThingsForYear(year, results));
  return results;
}
```

Simple enough, I like deleting code. Step 2 was to change the way I was calling the calculator since
it moved from callback based to synchronous:

Before:

``` javascript
function serviceUsedByComponent($q) {
  return {
    calculate: function() {
      return $q(function(resolve) {
        calculatorService.calculate([2016, 2017, 2018], (results) => resolve(results));
      });
    }
  };
}
```

After:

``` javascript
function serviceUsedByComponent($q) {
  return {
    calculate: function() {
      return $q(function(resolve) {
        resolve(calculatorService.calculate([2016, 2017, 2018]));
      });
    }
  };
}
```

`$q` is Angular's promise library. I had previously wrapped my interactions with the calculator
in a promise in order to support the setTimeout solution.

At this point I'm back at square one with my component that needs the data using a synchronous call
into the calculator. 

_\[webpack enters stage right]_

#### making the worker work

``` javascript
function serviceUsedByComponent($q) {
  const Worker = require('worker!../workers/calculator.worker');
  const worker = new Worker();

  return {
    calculate: function() {
      return $q(function(resolve) {
        worker.onmessage = (event) => resolve(event.data);
        worker.postMessage([2016, 2017, 2018]);
      });
    }
  };
}
```

Here we change it up a little to instantiate a new worker from the worker code loaded by webpack's
[worker-loader](https://www.npmjs.com/package/worker-loader) so don't forget to `npm i
worker-loader`. Instead of calling the calculator directly we now post a message to the worker
with our calculator input and resolve the promise with the data we get posted back to us from the
worker.  That's it for calling the worker, now on to the worker itself which is a new file.

#### working on the worker

``` javascript
require('babel-polyfill');

const calculatorService = require('services/calculator.service');

onmessage = function(event) {
  postMessage(calculatorService.calculate(event.data));
};
```

The first line imports babels polyfills in case you use anything like `Object.assign`. Remember
that this worker is loaded in it's own thread/context so you don't get anything from your regular
webpack bundle. The rest of the file is receiving the message we posted from the main thread and posting back
the results of the calculations. 

#### webpack.config.js

The only thing I changed in my webpack config was taken from the
example itself which sets the output filename for the worker:

``` javascript
worker: {
  output: {
    filename: 'calculator.worker.js',
    chunkFilename: '[id].calculator.worker.js'
  }
},
```

#### ship it

There you have it, webpack saves the day again.

#### errors

I left out error handling in my examples for
brevity. I'm starting off with a nodejs style `err` property on my postback messages, but it appears
you can get any errors back with an `onerror` callback - [details here](http://www.html5rocks.com/en/tutorials/workers/basics/#toc-errors).

#### browsers

Browser support is all I needed it to be, ymmv -
[caniuse](http://caniuse.com/#feat=webworkers)

#### performance

Performance wasn't any better in my case and it may be slightly worse. I don't think a user is
going to be able to tell the difference between 500ms and 700ms. The more important part here was
getting these computations off of the ui thread. I'm sending a fairly complex object which may be
helped with [Transferable
Objects](http://www.html5rocks.com/en/tutorials/workers/basics/#toc-transferrables), but I'm calling
it good for now. `¯\_(ツ)_/¯`

#### lazy loading

An unforeseen benefit in our situation was that this provides lazy loading qualities. Our calculator
is relatively big so it's nice to not have that in the initial load.

