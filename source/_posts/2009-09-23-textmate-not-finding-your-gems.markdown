---
layout: post
title: "TextMate not finding your gems?"
date: 2009-09-23
comments: true
permalink: "/post/195012461.html"
---

If you’ve built ruby yourself and stuck it in /usr/local/bin you may run into a problem where textmate is using the pre-installed version of ruby. That will result in searching for gems in the pre-installed location (wherever that is)

To fix this add a shell variable called TM_RUBY in the advanced preferences of TM pointing to /usr/local/bin/ruby

