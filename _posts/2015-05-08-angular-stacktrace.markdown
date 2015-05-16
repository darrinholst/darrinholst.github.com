---
layout: post
title: "XL stacktraces in your angular tests?"
date: 2015-05-15 21:00
comments: true
categories: angular
---

I've been stumbling through learning angular the last several weeks and I ran into a frustrating problem today where I was getting an excessivly large stacktrace printed in my test output. A contrived example of my test looks like...

```javascript
it('should not have a giant stack trace', inject(function ($document) {
  expect($document.find('.fumullins')).to.have.length(1);
}));
```

Nothing fancy there. It's just looking to see if an element with a certain class exists on the page. I would expect something like the following to be in the last few lines of my test watch window so I know the test failed for the right reason.

```
expected { Object ... } to have a length of 1 but got 0
```

I was presented with the following very helpful output instead...

```
the object {
  "line": 875
  "message": "expected { Object (length, prevObject, ...) } to have a length of 1 but got 0"
  "name": "AssertionError"
  "sourceId": 207567360
  "stack": "AssertionError: expected { Object (length, prevObject, ...) } to have a length of 1 but got 0
    at base/node_modules/chai/chai.js?d8de1f708fb0a86a7411a0eba65bb24c852addaa:875
    at assertLength (base/node_modules/chai/chai.js?d8de1f708fb0a86a7411a0eba65bb24c852addaa:1939)
    at base/node_modules/dirty-chai/lib/dirty-chai.js?4ec10c65927a645a87817aa9142cd7df2b9263cb:127
    at base/node_modules/chai/chai.js?d8de1f708fb0a86a7411a0eba65bb24c852addaa:5289
    at assert (base/node_modules/chai/chai.js?d8de1f708fb0a86a7411a0eba65bb24c852addaa:4052)
    at base/spec/app/common/secretFormatter/secretFormatter.directive.spec.js?9dd0fd4d1504a3a1a0b79d0c9533131e13223438:15
    at invoke (base/src/bower_components/angular/angular.js?1061b10c86c20aae22472741139f553995ce2951:4203)
    at workFn (base/src/bower_components/angular-mocks/angular-mocks.js?bd422b0634824fd1aec4b70bdad3b63fc7e1f519:2436)
undefined"
  "stackArray": [
    {
      "line": 875
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/chai/chai.js"
    }
    {
      "function": "assertLength"
      "line": 1939
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/chai/chai.js"
    }
    {
      "line": 127
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/dirty-chai/lib/dirty-chai.js"
    }
    {
      "line": 5289
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/chai/chai.js"
    }
    {
      "function": "assert"
      "line": 4052
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/chai/chai.js"
    }
    {
      "line": 15
      "sourceURL": "/Users/dholst/Projects/secret/spec/app/common/secretFormatter/secretFormatter.directive.spec.js"
    }
    {
      "function": "invoke"
      "line": 4203
      "sourceURL": "/Users/dholst/Projects/secret/src/bower_components/angular/angular.js"
    }
    {
      "function": "workFn"
      "line": 2436
      "sourceURL": "/Users/dholst/Projects/secret/src/bower_components/angular-mocks/angular-mocks.js"
    }
    {
      "function": "callFn"
      "line": 4562
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "line": 4555
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "line": 4974
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "line": 5079
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "function": "next"
      "line": 4899
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "line": 4909
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "function": "next"
      "line": 4844
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "line": 4871
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "function": "done"
      "line": 4518
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "function": "callFn"
      "line": 4573
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "line": 4555
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "function": "next"
      "line": 4872
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "line": 4871
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "function": "done"
      "line": 4518
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "function": "callFn"
      "line": 4573
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "line": 4555
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "function": "next"
      "line": 4872
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "line": 4876
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
    {
      "function": "timeslice"
      "line": 6483
      "sourceURL": "/Users/dholst/Projects/secret/node_modules/mocha/mocha.js"
    }
  ]
} was thrown, throw an Error :)
```

Wtf? No, the effing smiley face at the end doesn't make me feel better, but thanks mocha. That was 138 lines to scroll up to find out that my test failed for the reason I thought it did in case you didn't count. The good news with modern day javascript development is that there are very few tools in the chain to dig through to figure how to get rid of this giant stackArray thing. Was it karma or was it mocha or was it karma-mocha or maybe chai or possible karma-chai or maybe phantomjs has something to do with it. At this point I was all like (╯°□°）╯︵ ┻━┻.

I was pretty certain that it was a mocha issue and I did find a nice [stack trace cleaner](https://github.com/rstacruz/mocha-clean) in the process of trying to figure it out. That helped with the stack, but it didn't help with that weird stackArray thing.

Some more googling and some greping finally landed me on this in angular-mocks.js...

```javascript
try {
  injector.invoke(blockFns[i] || angular.noop, this);
} catch (e) {
  if (e.stack && errorForStack) {
    throw new ErrorAddingDeclarationLocationStack(e, errorForStack);
  }
  throw e;
} finally {
  errorForStack = null;
}

var ErrorAddingDeclarationLocationStack = function(e, errorForStack) {
  this.message = e.message;
  this.name = e.name;
  if (e.line) this.line = e.line;
  if (e.sourceId) this.sourceId = e.sourceId;
  if (e.stack && errorForStack)
    this.stack = e.stack + '\n' + errorForStack.stack;
  if (e.stackArray) this.stackArray = e.stackArray;
};
```

This is where the light bulb went off. If you go back up to the test you notice that I wrapped my assertion in an inject call. I did this just out of convenience to get a dependency injected closer to where it was needed in the test.

### tl;dr

Don't wrap your assertions in an inject function.

I put my dependencies in a before block like so...

{% highlight ruby %}
var $document;

beforeEach(inject(function (_$document_) {
  $document = _$document_;
}));

it('should not have a giant stack trace', function () {
  expect($document.find('.fumullins')).to.have.length(1);
});
{% endhighlight %}

and #boom, a more sane looking message

```
PhantomJS 1.9.8 (Mac OS X) secret-formatter should not have a giant stack trace FAILED
        AssertionError: expected { Object (length, prevObject, ...) } to have a length of 1 but got 0
            at /Users/dholst/Projects/secret/node_modules/chai/chai.js:875
            at assertLength (/Users/dholst/Projects/secret/node_modules/chai/chai.js:1939)
            at /Users/dholst/Projects/secret/node_modules/dirty-chai/lib/dirty-chai.js:127
            at /Users/dholst/Projects/secret/node_modules/chai/chai.js:5289
            at assert (/Users/dholst/Projects/secret/node_modules/chai/chai.js:4052)
            at /Users/dholst/Projects/secret/spec/app/common/secretFormatter/secretFormatter.directive.spec.js:21
```

Hope that helps somebody.

