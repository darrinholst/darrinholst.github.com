---
layout: post
title: "Regex Golf"
date: 2012-07-09 21:22
comments: true
categories: 
---
I was going to name this post Vim Golf, but it turned out to be more of a regex
experiment than vim keystrokes.

So I found this cool [ifttt recipe](http://ifttt.com/recipes/37991) that logs all
of your tweets to a dropbox file. It puts them all in a single file with a
format of:

```
At a drive in. Wat?  @ Valle Drive-In http://t.co/Z9lz7O5F
Jun 30, 2012
http://twitter.com/darrinholst/status/218878382123909120
- - - - -

I see blurry apps
Jun 30, 2012
http://twitter.com/darrinholst/status/219074474073538560
- - - - -
```

Since the twitter api only allows you to get to 3200 of your tweets I though it
would be a good idea to get the rest of the tweets that are accessible to me in there as
well. The quickest way I know to get my latest tweets is at
[allmytweets.net](http://allmytweets.net). Allmytweets will pull down all your
tweets and then show them on their page. The html ends up looking like:

```
8"><img src="css/extlink.png"></a></li><li>Straw in the wro
ng hole.  @ High Life Lounge <a href="http://t.co/kdMfTvPk">
http://t.co/kdMfTvPk</a> <span class="created_at">Jun 12, 20
12</span> <a href="https://twitter.com/#!/darrinholst/status
/212644435689881600"><img src="css/extlink.png"></a></li><li
>I can see @dwolla from here! <span class="created_at">Jun 1
2, 2012</span> <a href="https://twitter.com/#!/darrinholst/s
tatus/212639918541910016"><img src="css/extlink.png"></a></l
i><li>Simplify Design With  Zero, One, Many rules <a href="h
ttp://t.co/0bvdVzzo">http://t.co/0bvdVzzo</a> <span class="c
```

All the data is there, but not very useful for a txt file. Here's the commands I threw at it
to format it up:

Split li tags up to separate lines

```
%s/<li>/\r<li>/g
```

Preserve new lines in the tweets with a token

```
%s/\n/##NL##/g
```

Change new line tokens in between li tags back to new lines

```
%s/<\/li>##NL##<li>/<\/li>\r<li>/g
```

Reverse the order of the tweets, I want them in chronological order (The only
non-replace command)

```
g/^/m0
```

Remove li start tags

```
%s/<li>//g
```

Replace li end tags with a separator

```
%s/<\/li>/\r- - - - -\r/g
```

Turn new line tags back into new lines

```
%s/##NL##/\r/g
```

Get rid of the start span tag for the date

```
%s/<span class="created_at">/\r/g
```

Get rid of the end span tag and tweet link start tag. Also change from https to
http

```
%s/<\/span> <a href="https/\rhttp/g
```

Get rid of those stupid #!s

```
%s/\/#!\//\//g
```

Get rid of the image from allmytweets.net

```
%s/"><img src="css\/extlink.png"><\/a>//g
```

HTML decode

```
%s/&amp;/\&/g
%s/&lt;/</g
%s/&gt;/>/g
%s/&nbsp;/ /g
```

Get rid of remaining html

```
%s/<a href="//g
%s/">.*<\/a>//g
```

Clean up trailing spaces

```
%s/ *$//g
```

EDITING TEXT IS FUHHHH UHN! I wish I would have though of this 3800 tweets ago
though.
