---
layout: post
title: "Vim ❤️ ESLint ❤️ Prettier"
date: 2018-04-01 07:00
comments: true
categories: javascript vim prettier eslint
---

If you're on a team or project that is still using eslint for formatting rules then first...I'm sorry.
Second, this will show you how to get vim setup to autoformat code using both eslint and
[prettier](https://prettier.io/). I'll skip the prettier pitch for now. Use it.

The first thing you'll need is is a vim plugin that can format code. I use
[neoformat](https://github.com/sbdchd/neoformat).

``` vimscript
Plugin 'sbdchd/neoformat'
```

Neoformat uses external tools to format a buffer based on the filetype. The list of
[supported filetypes](https://github.com/sbdchd/neoformat#supported-filetypes) is quite extensive.
You'll see for javascript these formatters are available.

    js-beautify, prettier, prettydiff, clang-format, esformatter, prettier-eslint, eslint_d standard

In our case prettier and eslint_d are the ones that we're interested in. I configure it to only look
for those two so it's not trying to use formatters that aren't installed. Neoformat will run each
formatter in sequence _until_ one succeeds.

``` vimscript
let g:neoformat_enabled_javascript = ['prettier', 'eslint_d']
```

We need the formatting tools installed locally so let's do that...

    npm i -D prettier eslint_d

[`eslint_d`](https://github.com/mantoni/eslint_d.js) works the same as `eslint` would except it
spins up a small server in the background to use on subsequent calls. This is needed because we
don't want our "format on save" taking almost a second.

Now it's time to try it.

<figure class="full">
  <img src="/images/vim_prettier_eslint/prettier.gif">
  <figcaption>First time using asciicast and I couldn't find the make me look like a good typist option</figcaption>
</figure>


You can see that invoking `:Neoformat` will reformat the buffer with the default prettier config by
removing the blank line and inserting the semicolon. The problem is when we have conflicting rules.
Suppose we have the following eslint rule...

``` json
{
  "rules": {
    "quotes": ["error", "single"]
  }
}
```

The eslint rules say that it wants single quotes.  I mentioned above that neoformat will only run 
until one formatter succeeds. We need to tell it to run _all_ formatters with...

``` vimscript
let g:neoformat_run_all_formatters = 1
```

Now if we run it again you'll see that both prettier and eslint formatting is applied by the
changing of double quotes to single quotes.

![eslint](/images/vim_prettier_eslint/eslint.gif)

In order to format on save you can add an `autocmd` to run `Neoformat` on buffer pre write like
so...

``` vimscript
au BufWritePre *.js,*.ts,*.scss,*.rb Neoformat
````

Now every time you save both prettier and eslint formatters will run with eslint having the final
say since it's last in the neoformat list.


