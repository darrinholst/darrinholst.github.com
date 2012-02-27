---
layout: post
title: "Tailing remote logs with capistrano"
date: 2012-02-24 12:00
comments: true
permalink: "post/18231749247/tail-remote-logs-with-capistrano.html"
---

I'm assuming most rails programmers today view their remote logs with a simple <code>heroku logs</code>. What if you don't use heroku? If you use capistrano then just drop this into your <code>deploy.rb</code>

``` ruby
desc "tail log files"
task :tail, :roles => :app do
  run "tail -f #{shared_path}/log/#{rails_env}.log" do |channel, stream, data|
    puts "#{channel[:host]}: #{data}"
    break if stream == :err
  end
end
```

Then it's just <code>cap tail</code>
