---
layout: post
title: "git add…all of it damn it"
date: 2009-11-05
comments: true
permalink: "/post/234568461.html"
categories: git
---

As mentioned in the comments `git add -A` stages all modified, new, and deleted files. Just use that.

<s>
So we all know that git add . will add all new and modified files to the index. What about the 50 files you deleted that you also want to stage? git rm 50 times? How about adding the -u option to git add which will stage modified files and also deleted files? The one problem with that is it doesn’t add new files. So if you want to stage all new files, modified files, and deleted files then you’re forced to git add . && git add -u. We can wrap that up into an alias to save some keystrokes…

git config --global alias.ad '!git add . && git add -u'

Now just use git ad and everything will be ready to commit
</s>

