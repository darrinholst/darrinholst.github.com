---
layout: post
title: "Rails Mass Assignment"
date: 2012-03-04 20:06
comments: true
categories: ruby rails security
---

A quiet Sunday morning turned into Dramaville in the Rails world over [this commit](https://github.com/rails/rails/commit/b83965785db1eec019edf1fc272b1aa393e6dc57) to Rails master. A github user managed to get his public key into the list that are allowed access via the mass assignment loop hole. If you use Rails and don't know about the problem with the default behavior of mass assignment go [read this now](http://guides.rubyonrails.org/security.html#mass-assignment).

There are a lot of issues with this whole situation, the first being that it's absolutely the developer's responsibility for the security and integrity of the software that we write. Blaming a framework is not an option here. That said, if you have a Rails app I highly recommend adding the following line to `config/application.rb`

```ruby
config.active_record.whitelist_attributes = true
```

What this will do is turn white listing on for every model in your application. That means that you will have to explicitly define each attribute in your model that you expect to update via a http request with `attr_accessible`. That certainly is a pain in the ass, especially for large applications, but it's better than the alternative of what happened to github today.

Another issue was the way that this was exposed. I'm torn on this specific incident because the guy [was ignored](https://github.com/rails/rails/issues/5228), but on the other hand this has been such a well known problem in the Rails world that I probably would have ignored it too if he didn't provide any code to fix the problem. Generally though I would encourage security vulnerabilities to be reported via the appropriate channels and give the owners time to fix it.

The last issue I want to comment on is the default behavior of Rails. Although I believe you shouldn't rely on or blame a framework for security stuff, I do think that the framework should do everything possible to lead you down the right path. Rails doesn't do the right thing in this situation. The white list (or some other solution) should be on by default. Since this would break _a lot_ of apps I can see why they haven't done anything yet, but I do expect something to change for Rails 4 (and hopefully the solution moves out of the model and into the controller where it belongs).
