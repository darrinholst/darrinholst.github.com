---
layout: post
title: "re-rejecting promises"
date: 2015-07-28 21:00
comments: true
categories: javascript promise
---
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

Let's pretend that you have a bit of code like below...

<div data-height="745" data-theme-id="0" data-slug-hash="OVaXmx" data-default-tab="js" data-user="darrinholst" class='codepen'>
  <pre>
    <code>
angular.module('demo', [])

  .controller('LoginController', function(loginService) {
    var vm = this;
  
    vm.login = function login() {
      loginService.login(vm.username, vm.password)
        .then(function () {
          setBackground('green');
        })
        .catch(function () {
          setBackground('red');
        });
    }
  
    function setBackground(color) {
      angular.element(document.body).css({'background-color': color});
    }
  })

  .factory('loginService', function ($http, $q) {
    return {
      login: function login(username, password) {
        return $http.post('whatevs', {u: username, p: password})
          .then(function (response) {
            return response.data.token;
          })
          .catch(function (reason) {
            console.log('wtf - ' + reason);
          })
      }
    };
  });
    </code>
  </pre>

  <p>See the Pen <a href='http://codepen.io/darrinholst/pen/OVaXmx/'>broken promise</a> by Darrin Holst (<a href='http://codepen.io/darrinholst'>@darrinholst</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
</div>


If you're unfamiliar with angular then the gist of it is that you have 
the `LoginController` that gets the `login` function called when the Login button is clicked. The controller 
uses a service called `loginService` (ignore that part about the service being defined with a `factory` call) 
that gets injected via the magical powers of angular. It uses that service to 
call an endpoint and returns a token on success and logs a message on failure. Back in the controller we set the 
background color to green on success and to red on failure. I know, right? That's web 2.0 at its finest.

Assuming that the http call to `whatevs` fails; what do you expect to happen? As of before yesterday my guess would be
the message would get logged in the service and then the controller would set the background to red.

It'd be a pretty boring post if that is what actually happened so go ahead and click Login below to see for yourself.

<p data-height="156" data-theme-id="17343" data-slug-hash="OVaXmx" data-default-tab="result" data-user="darrinholst" class='codepen'>See the Pen <a href='http://codepen.io/darrinholst/pen/OVaXmx/'>broken promise</a> by Darrin Holst (<a href='http://codepen.io/darrinholst'>@darrinholst</a>) on <a href='http://codepen.io'>CodePen</a>.</p>

Green, amirite?

We can see from the console that we got the error logged.

![console](/images/re_reject/console.png)

The problem ends up being in our `catch` in the service. If you think of it like a traditional try/catch in 
other languages it makes sense. We caught the "exception", but we didn't "rethrow" it. The fix is to return 
a rejected promise in our error handling so the rejection gets propagated up the promise chain.

Notice the addition of the `return $q.reject(reason);` line in the service ($q is angular's promise implementation).

<div data-height="747" data-theme-id="17343" data-slug-hash="zGMBJY" data-default-tab="js" data-user="darrinholst" class='codepen'>
  <pre>
    <code>
angular.module(&#39;demo&#39;, [])

  .controller(&#39;LoginController&#39;, function(loginService) {
    var vm = this;

    vm.login = function login() {
      loginService.login(vm.username, vm.password)
        .then(function () {
          setBackground(&#39;green&#39;);
        })
        .catch(function () {
          setBackground(&#39;red&#39;);
        });
    }

    function setBackground(color) {
      angular.element(document.body).css({&#39;background-color&#39;: color});
    }
  })

  .factory(&#39;loginService&#39;, function ($http, $q) {
    return {
      login: function login(username, password) {
        return $http.post(&#39;whatevs&#39;, {u: username, p: password})
          .then(function (response) {
            return response.data.token;
          })
          .catch(function (reason) {
            console.log(&#39;wtf - &#39; + reason);
            return $q.reject(reason);
          })
      }
    };
  });
    </code>
  </pre>
  <p>See the Pen <a href='http://codepen.io/darrinholst/pen/zGMBJY/'>rejection</a> by Darrin Holst (<a href='http://codepen.io/darrinholst'>@darrinholst</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
</div>

Try 'er again...

<p data-height="159" data-theme-id="17343" data-slug-hash="zGMBJY" data-default-tab="result" data-user="darrinholst" class='codepen'>See the Pen <a href='http://codepen.io/darrinholst/pen/zGMBJY/'>rejection</a> by Darrin Holst (<a href='http://codepen.io/darrinholst'>@darrinholst</a>) on <a href='http://codepen.io'>CodePen</a>.</p>

Like most everything else, it makes sense once you know how it works and is completely baffling when you don't. #themoreyouknow

Check out [this excellent post](http://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html) to get a better understanding of promises if you don't already know all the things.
 In particular, I found this very helpful...  

> Every promise gives you a then() method (or catch(), which is just sugar for then(null, ...)). Here we are inside of a then() function:
> 
> somePromise().then(function () {  
> &nbsp;&nbsp;&nbsp;&nbsp;// I'm inside a then() function!  
> });  
> 
> What can we do here? There are three things:
> 
> 1. return another promise
> 2. return a synchronous value (or undefined)
> 3. throw a synchronous error
> 

> That's it. Once you understand this trick, you understand promises.

