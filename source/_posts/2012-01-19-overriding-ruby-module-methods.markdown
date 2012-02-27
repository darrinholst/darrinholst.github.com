---
layout: post
title: "Overriding ruby module methods"
date: 2012-01-19
comments: true
permalink: "/post/16116450958/overriding-ruby-module-methods.html"
---

I learned something new about Module.include the other day. Consider the following:

```ruby
module Turkey
  def tastes_like?
    "turkey"
  end
end

module Duck
  def tastes_like?
    "duck"
  end
end

module Chicken
  def tastes_like?
    "chicken"
  end
end

class Turducken
  include Turkey
  include Duck
  include Chicken
end

t = Turducken.new
p "This thing tastes like #{t.tastes_like?}"

#=> This thing tastes like chicken
```

It outputs chicken as I would expect since it was the last one included, but it also does one more thing that I didn’t expect. It sets up a method inheritance chain for duplicate methods so you have access to the method you have overridden. So if we call super in our example:

```ruby
module Turkey
  def tastes_like?
    "turkey"
  end
end

module Duck
  def tastes_like?
    super + "duck"
  end
end

module Chicken
  def tastes_like?
    super + "chicken"
  end
end

class Turducken
  include Turkey
  include Duck
  include Chicken
end

t = Turducken.new
p "This thing tastes like #{t.tastes_like?}"

#=> This thing tastes like turkeyduckchicken
```

You get a proper turducken. Of course there are some order dependencies in my contrived example, but you get the point.

One real world example that I used this for was rails tag helpers. I wanted to wrap each text input in a div (take your snarky semantic markup comments somewhere else). So I just defined a text_field method in my helper and then wrapped the output of the super call.

```ruby
module SomeHelper
  def text_field(object_name, method, options = {})
    content_tag(:div, super(object_name, method, options), :class =&gt; "input")
  end
end
```
