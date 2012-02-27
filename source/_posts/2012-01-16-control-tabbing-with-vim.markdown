---
layout: post
title: "Control Tabbing with Vim"
date: 2012-01-16
comments: true
permalink: "/post/15946656216/control-tabbing-with-vim.html"
---

Every once in a while I’ll go down the rabbit hole of trying to get proper control tabbing working in vim. If you’re not familiar with control tabbing through files in your editor think of it the same way as command tabbing through applications is osx or alt tabbing in windows. All the files that you’re working with are in a stack and the most recently used ones stay at the top. From the extensive research I’ve done not a lot of developers use this, but once you get used to it it’s hard to use something that doesn’t have it…like vim.

Up until now I’ve been using a combination of :bu # bound to Control-Tab and the [bufexplorer plugin](http://www.vim.org/scripts/script.php?script_id=42) bound to ,bb. If I want to quickly go back and forth between the top two buffers I’d use Control Tab, if I wanted to go back farther in history I’d use ,bb. Bufexplorer has a Most Recently Used option so the list shows up how I’d expect it to.

![](http://dl.dropbox.com/u/2144189/blog/darrinholst/controltab/%5BBufExplorer%5D%20-%20%28~_Projects_chromepaper%29%20-%20VIM-3.jpg)

There are two things I don’t like about this. First, I have separate commands to navigate buffers…Control-Tab and ,bb. The second thing I don’t like is bufexplorer loads in a new window which takes me out of my flow.

So after playing around with [Sublime Text 2](http://www.sublimetext.com/2) the other day and seeing that they have this functionality I thought I’d give it another shot. What I found was [LustyJuggler](http://www.vim.org/scripts/script.php?script_id=2050).

LustyJuggler will load all your buffers in a strip along the bottom and you can navigate with arrow keys, number keys, or home row keys. It also lists them in Most Recently Used order.

![](http://dl.dropbox.com/u/2144189/blog/darrinholst/controltab/vimrc%20%28~%29%20-%20VIM.jpg)

At first I wasn’t any happier with this solution than I was with bufexplorer…until I RTFM and found the LustyJugglerAltTabMode option. With this option set, activating LustyJuggler will automatically highlight the previous buffer.

![](http://dl.dropbox.com/u/2144189/blog/darrinholst/controltab/vimrc%20%28~%29%20-%20VIM%202.jpg)

Continuing to activate it will cycle through the list. So now with Control-Tab bound to this I can quickly Control-Tab and then Enter for the buffer I want.

```
let g:LustyJugglerAltTabMode = 1
noremap <silent> <C-Tab> :LustyJuggler<CR>
```

This is almost the behavior that I want. The only thing I don’t like about it is that extra Enter when selecting a buffer instead of selecting it when you release. I’m not sure if you can do that in Vim, but it shouldn’t take too long to build up the muscle memory to do it.

