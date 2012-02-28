---
layout: post
title: "svn:externals in git?"
date: 2009-08-13
comments: true
permalink: "/post/162307644.html"
---

For all the benefits git has over svn, I found one thing that I was missing…svn:externals. There are a few suggesstions that you come across when searching around on this topic, one being git subprojects and another being git submodules.

I couldn’t find (read lost desire) a whole lot on subprojects, but from what I got out of it is you just do a git clone of your external project in whatever directory of your project. I tried that, committed, and pushed, but when I cloned it back just the directory was there…no files. Granted, I didn’t spend a lot of time on this, but if it were as easy as clone, commit, push then I guess everyone would be using it.

Git submodules are a little more involved and require extra commands after a clone…git submodule update. Also, these modules are bound to a specific commit where I wanted the latest (like how svn:externals work). Too much work.

So it appears, unless I’m missing something, that git doesn’t have a 100% replacement for svn:externals.

In my case I don’t care about the history of the external repo being in my repo, I just want the latest in there. Also, the external repo I need is relatively small so duplication between repos is not an issue. Finally, I don’t need to change or push to the external repo from the local one.

So I ended up with a sync job that runs every hour that looks like this…

```bash
#!sh

function sync_project() {
  rm -rf $1
  git clone ssh://git-server/$1.git
  cd $1
  rm -rf local/path/external-project
  mkdir -p local/path
  cp -R ../external-project local/path
  rm -rf `/bin/find . -type d -name .svn`
  git add .
  git add -u
  git commit -m "auto sync"
  git push origin master
  cd ..
}

rm -rf external-project
svn co http://svn/external-project
sync_project "my-project"
sync_project "my-other-project"
```

You’ll notice that my external project comes from svn, this can easily be replaced with whatever scm it’s in.

