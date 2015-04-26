---
layout: post
title: "changing git commit messages"
date: 2010-01-29
comments: true
permalink: "/post/359817782.html"
categories: git
---

Changing your last commit message in a git repository is fairly trivial

    git commit --amend -m "some other message"

but what if you’ve made several commits and want to change a message that’s not the last one? An interactive rebase is one way to do this. First find the commit just before the message you want to change

    $ git lg
    * 6119426 - (master) third commit (3 seconds ago by Darrin Holst)
    * b6a0a9f - we want to change this message (23 seconds ago by Darrin Holst)
    * e24b57d - first commit (37 seconds ago by Darrin Holst)

Then start the interactive rebase

    $ git rebase --interactive e24b57d

Which will open up your editor with…

    pick b6a0a9f we want to change this message
    pick 6119426 third commit
    
    # Rebase e24b57d..6119426 onto e24b57d
    #
    # Commands:
    #  p, pick = use commit
    #  e, edit = use commit, but stop for amending
    #  s, squash = use commit, but meld into previous commit
    #
    # If you remove a line here THAT COMMIT WILL BE LOST.
    # However, if you remove everything, the rebase will be aborted.
    #

Change “pick” to “edit” for those that you want to edit and save that file

    edit b6a0a9f we want to change this message
    pick 6119426 third commit

    # Rebase e24b57d..6119426 onto e24b57d
    #
    # Commands:
    #  p, pick = use commit
    #  e, edit = use commit, but stop for amending
    #  s, squash = use commit, but meld into previous commit
    #
    # If you remove a line here THAT COMMIT WILL BE LOST.
    # However, if you remove everything, the rebase will be aborted.
    #

Now amend that commit

    $ git commit --amend -m "some other message"

Then continue the rebase

    $ git rebase --continue
    $ git lg
    * cec3fba - (master) third commit (2 seconds ago by Darrin Holst)
    * c146f90 - some other message (29 seconds ago by Darrin Holst)
    * e24b57d - first commit (5 minutes ago by Darrin Holst)

Congratulations, you have just changed history, but remember all the same rules apply for rebasing commits that you’ve pushed to a public repository (hint - don’t do it)

Thanks to [@rubbish](http://twitter.com/rubbish) and [@developernotes](http://twitter.com/developernotes) for the info

