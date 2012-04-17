---
layout: post
title: "Try Before You Buy"
date: 2012-04-17 09:29
comments: true
categories: backbone
---
I've been working on an [envelope budgeting app](http://budgetbuffer.com) recently and like all applications that I pay money for I would want to try it out before forking over cash. There are a number of ways to do this, but I think the most common way is to make the user sign up for an account and then keep track of the trial period on the server. The best apps that do this make it super easy to sign up for an account and not ask for payment information. The worst apps that do this make you provide payment information and then expect you to figure out how to cancel it if you don't like it (and hope you don't figure it out or remember).

I want to create an experience that is slightly better than the best apps which means making it even more simple to try before you buy. So let's get rid of the sign up step, the last thing that anyone needs is yet another online account for something they may or may not use.

For this app I chose to use [backbone](http://documentcloud.github.com/backbone/) for various reasons...perceived speed of the app, getting html out of the server, javascript is cool, etc. The one feature I didn't foresee using though was [local storage](https://github.com/jeromegn/Backbone.localStorage). Normally with backbone apps when you save or retrieve data from the server it's done via ajax, but with the local storage adapter you can swap out that ajax layer with a layer that reads and writes to local storage...all mostly seamless to the application itself. Now with this adapter I don't have to keep track of potential customer's data on the server, I can just let them use the app normally and save the data locally. All without having to sign up or in.

So here is what my routing looked like before

``` coffeescript
routes:
  "budgets"     : "listBudgets"
  "budgets/:id" : "editBudget"

listBudgets: ->
  $("#backbone").html(new BudgetApp.Views.BudgetsView(collection: @budgets).render().el)

editBudget: (id) ->
  $("#backbone").html(new BudgetApp.Views.BudgetView(model: @budgets.get(id)).render().el)
```

now we add the local storage junk to the router

``` coffeescript
routes:
  "budgets"             : "listBudgets"
  "sandbox/budgets"     : "listBudgets"
  "budgets/:id"         : "editBudget"
  "sandbox/budgets/:id" : "editBudget"

listBudgets: ->
  if(window.localStorage)
    BudgetApp.localStorage = new Backbone.LocalStorage("budgets")
    @budgets.localStorage = BudgetApp.localStorage

  $("#backbone").html(new BudgetApp.Views.BudgetsView(collection: @budgets).render().el)

editBudget: (id) ->
  budget = @budgets.get(id)

  if window.localStorage and !budget
    budget = @budgets.create()

  $("#backbone").html(new BudgetApp.Views.BudgetView(model: budget).render().el)
```

I have added a couple of more routes (there's probably some wildcard thing you can do to be more generic, but sometimes being explicit is good...especially when you're only talking about 2 more routes). Then in the ```listBudgets``` function I check to see if I have turned on and setup the models to use local storage. I set the ```localStorage``` flag in the html/js returned from the server for the sandbox page. And lastly in the ```editBudget``` function I create a new budget if localStorage is on and it isn't already in the collection...this is to catch the situation where they refresh the page.

So with a few lines of code I can use the application in local mode and not have to worry about signing up people that just want to check it out.

