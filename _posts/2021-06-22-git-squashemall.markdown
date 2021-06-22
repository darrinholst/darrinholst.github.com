---
layout: post
title: "git squashemall"
date: 2021-06-22 12:00
comments: true
---

Sometimes through a series of unfortunate events you find yourself in a git branch hell of merge conflicts and duplicate commits. Usually it's from a combination of a long running branch, rebasing, and merging. Your changes are small, but it seems you keep needing to resolve the same conflicts over and over again. If you're willing to give up your prior commits and squash them all then `git squashemall` is one way to climb out of your mess.

Add the following to your ~/.gitconfig

``` 
[alias]
  squashemall = !git reset $(git merge-base master $(git rev-parse --abbrev-ref HEAD))
```

After running that hopefully you're left with just your changes that you can then add, commit, and force push. 

Details of what is going on with this command are [here](https://stackoverflow.com/questions/25356810/git-how-to-squash-all-commits-on-branch).

Remember that long running branches almost always end up bad. Avoid them at all costs.