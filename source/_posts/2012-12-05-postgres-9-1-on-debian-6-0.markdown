---
layout: post
title: "Installing PostgreSQL 9.1 on Debian 6.0 with Chef"
date: 2012-12-05 19:32
comments: true
categories: postgresql debian chef
---

__11/8/2014 Update:__ Ignore all the babbling below and just install it from the [PGDG repo](http://www.postgresql.org/about/news/1432/).

``` ruby
node.set[:postgresql][:enable_pgdg_apt] = true
node.set[:postgresql][:version] = '9.1'
node.from_file(run_context.resolve_attribute('postgresql', 'default'))

include_recipe 'postgresql::server'
```

Original content follows...

On a project I've been working on I needed to get PostgreSQL
updated from 8.4 to 9.anything on a Debian 6.0 system. 8.4 is the most
up-to-date package on this particular system. Googling around didn't turn
anything up so this is a documentation of what I did to get it installed
using Chef.

I'm assuming you're using the [postgresql cookbook](http://community.opscode.com/cookbooks/postgresql) and the [apt cookbook](http://community.opscode.com/cookbooks/apt).

One of the first things that you'll probably run into while searching for a solution is the [Debian
Backports](http://backports-master.debian.org/) project. This is a repository of backported packages that will run on an older Debian system. This is where you'll find packages for PostgreSQL 9.1. You'll need to add this repository to APT. Add a new file called `cookbooks/postgresql/recipes/squeeze_backports.rb` with the following contents

``` ruby
apt_repository "squeeze-backports" do
  uri "http://backports.debian.org/debian-backports"
  distribution "squeeze-backports"
  components ["main"]
end
```

You could add this recipe everywhere you use `postgresql::server` or
`postgresql::client`, but I chose to just include it at the top of each of
those recipes

``` ruby
include_recipe "postgresql::squeeze_backports"
```

Now with that repository you can install the packages using the `-t` option of
apt-get. Unfortunately I couldn't find an easy way for the package resource in
chef to do this unobtrusively since it doesn't look in our backports repository
to figure out what version to install. I did find a [bug report](http://tickets.opscode.com/browse/CHEF-1547) in Chef
discussing this and a fix for it, but it wasn't fixed in the version I was
using. So we'll do it the DevOps way and hack it...in `cookbooks/postgresql/recipes/client.rb` I
replaced:

``` ruby
node['postgresql']['client']['packages'].each do |pg_pack|
  package pg_pack
end
```

with:

``` ruby
execute "install postgresql-client from backports" do
  command "apt-get -t squeeze-backports install postgresql-client -y"
  not_if "dpkg-query -W postgresql-client|grep -q postgresql-client.+"
end

execute "install libpq-dev from backports" do
  command "apt-get -t squeeze-backports install libpq-dev -y"
  not_if "dpkg-query -W libpq-dev|grep -q libpq-dev.+"
end
```

and in `cookbooks/postgresql/server_debian.rb` I replaced:

``` ruby
node['postgresql']['server']['packages'].each do |pg_pack|
  package pg_pack
end
```

with:

``` ruby
execute "install postgresql-server from backports" do
  command "apt-get -t squeeze-backports install postgresql -y"
  not_if "dpkg-query -W postgresql|grep -q postgresql.+"
end
```

One last thing you'll need to do is make sure the PostgreSQL version is set
correctly in `cookbooks/postgresql/attributes/default.rb` which just means
removing the check for debian 6.0 so it defaults to 9.1. It ends up looking
something like:

``` ruby
when "debian"

  case
  when node['platform_version'].to_f <= 5.0
    default['postgresql']['version'] = "8.3"
  else
    default['postgresql']['version'] = "9.1"
  end
```

Given all of those changes and if all the moons line up then on your next chef client run you
should have version 9.1 installed. Good luck and please add a comment if there
is a more elegant way that I missed.

