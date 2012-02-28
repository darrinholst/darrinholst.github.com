---
layout: post
title: "backup backup backup"
date: 2010-02-26
comments: true
permalink: "/post/413204323/backup-backup-backup.html"
---

I’ve gone through many variations of my backup strategy since I started storing things digitally. Here is my current setup…

* The master copy is stored on my iMac’s local disk.
* Everything except music and dvds are synced with [dropbox](http://www.dropbox.com/).
* Everything is one way synced to external drive 1 via [chronosync](http://www.econtechnologies.com/pages/cs/chrono_overview.html) nightly.
* External drive 1 is cloned to external drive 2 via [superduper](http://www.shirt-pocket.com/SuperDuper/SuperDuperDescription.html) weekly.

I just recently switched my offsite backup from s3/jungledisk to dropbox. Dropbox is significantly faster at uploading (at least at my house). Dropbox does this cool thing where if you try to upload a file that is already on their system it won’t actually push the bits, instead it will point to the existing copy or make a duplicate internally at dropbox (not sure what actually happens, but it doesn’t matter the point is that you don’t have to upload that file). The dropbox clients are faster at syncing between machines when compared to jungledisk’s sync feature.

The one way sync (nothing is deleted) with chronosync is an important piece since if you delete something on one dropboxed client then that deletion is instantly propagated everywhere. So if you decide you don’t want something on one machine and you delete it then it gets deleted on every machine that is using dropbox. Dropbox will soon come with selective sync which I am anxiously awaiting.

The superduper clone is just a last chance backup incase of disk failures.

I’m sure this setup will change again, but I’m pretty happy with it for now.

