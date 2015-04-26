---
layout: post
title: "Heroku's Ugly Secret"
date: 2013-02-14 08:00
comments: true
categories: rails
external-url: http://rapgenius.com/James-somers-herokus-ugly-secret-lyrics
---

> In mid-2010, Heroku redesigned its routing mesh so that new requests would be routed, not to the first available dyno, but randomly, regardless of whether a request was in progress at the destination.
<br>
> The unfortunate conclusion being that Heroku is not appropriate for any Rails app that’s more than a toy.

Great analysis of Heroku's routing.

I love the service that Heroku provides, but I probably wouldn't put too many of
my eggs in their basket.

