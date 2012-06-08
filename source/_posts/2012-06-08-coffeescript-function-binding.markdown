---
layout: post
title: "CoffeeScript Function Binding"
date: 2012-06-08 06:57
comments: true
categories: coffeescript
---

![](https://dl.dropbox.com/u/2144189/blog/darrinholst/fatarrow/all%20the%20things.jpg)

In my last talk that I gave on CoffeeScript I quickly went over function binding and
CoffeeScript's ```=>``` syntax. My point was that when you need to use ```.bind(this)``` then
you could just use ```=>``` for shorter syntax. The inevitable question that
came up was "Why wouldn't I just use that everywhere?". It's a valid question,
especially coming from people that aren't in the JavaScript world a lot and/or
haven't figured out the ```this``` craziness. I didn't have a good
answer at the time, but I gave the example of jQuery setting ```this``` to the
event element and you might want that ```this``` pointer instead of the current
one.

``` coffeescript
class ClickLogger
   clicked: ->
     console.log(@.href)

   clickedBound: (event) =>
     console.log(event.target.href)

$("a").on("click", new ClickLogger().clicked)
$("a").on("click", new ClickLogger().clickedBound)
```

In the example above we want the element that was clicked and we don't need anything from the instance of
```ClickLogger``` so there is no reason to bind it. It also shows what you would
have to do if you did bind it.

Fast forward to present day when [Les Hill](http://twitter.com/leshill) posted
[some slides](http://blog.leshill.org/backbone_and_rails_magma) of a Backbone and Rails presentation he did. In there was...

![](https://dl.dropbox.com/u/2144189/blog/darrinholst/fatarrow/warning.jpg)

...which got me thinking about it again. So I asked him and his response was...

![](https://dl.dropbox.com/u/2144189/blog/darrinholst/fatarrow/response.jpg)

Intention revealing. So by *not* using ```=>``` everywhere means that I know
what it does and when I should use it and that I really inteded to override the
default behavior.

Just because you have shorter syntax to do cumbersome things doesn't mean you
should use it everywhere, especially if you wouldn't have naturally done the
cumbersome thing if you didn't have the shorter syntax.

In case you were wondering if performance was a reason for not using it
everywhere...[it's not](http://nesbot.com/2012/1/20/CoffeeScript-why-is-function-binding-not-the-default).

