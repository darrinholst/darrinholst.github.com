---
layout: post
title: "Testing Angular Components with Mocha, Webpack and jsdom"
date: 2017-11-09 08:00
comments: true
categories: javascript angular webpack mocha jsdom
---

The following Angular component shows a logout button if there is a logged in user.

``` typescript
import {Component} from '@angular/core';
import {select} from '@angular-redux/store';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar fxLayoutAlign="end center">
      <a class="logo" fxFlex routerLink="/"><img src="logo.png"></a>
      <button *ngIf="isLoggedIn()" mat-icon-button [matMenuTriggerFor]="menu"><i class="fa fa-bars"></i></button>
    </mat-toolbar>

    <mat-menu #menu="matMenu">
      <button mat-menu-item routerLink="/logout" title="logout"><i class="fa fa-sign-out"></i> Logout</button>
    </mat-menu>
  `
})
export class AppHeaderComponent {
  private user: any;
  @select() private user$: Observable<any>;

  ngOnInit() {
    this.user$.subscribe(user => (this.user = user));
  }

  isLoggedIn() {
    return !!this.user;
  }
}
```

Supposing I want to test the two different states I might come up with a test like:

``` typescript
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NgReduxTestingModule, MockNgRedux} from '@angular-redux/store/testing';
import {expect} from 'chai';

import {MaterialModule} from 'core/material.module';
import {AppHeaderComponent} from 'core/app-header.component';

describe('app-header', () => {
  let fixture: ComponentFixture<AppHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, NgReduxTestingModule],
      declarations: [AppHeaderComponent]
    });

    fixture = TestBed.createComponent(AppHeaderComponent);
  });

  it('should show a menu button if logged in', () => {
    expectUserToBe({id: 'anything'});
    const button = findToolbarMenuButton();
    expect(button).to.have.length(1);
  });

  it('should not show a menu button if not logged in', () => {
    expectUserToBe(null);
    const button = findToolbarMenuButton();
    expect(button).to.have.length(0);
  });

  function findToolbarMenuButton() {
    fixture.detectChanges();
    return fixture.debugElement.queryAll(By.css('mat-toolbar button'));
  }

  function expectUserToBe(user: any) {
    const userSub = MockNgRedux.getSelectorStub(['user']);
    userSub.next(user);
    userSub.complete();
  }
});
```

How do I run that? I don't want to use karma because I don't want to deal with a real browser for CI
reasons. I don't want to use phantomjs for phantomjs reasons. There aren't many headless chrome
tutorials out there currently which is probably the future. I want to use mocha since that is what I
use for all my non-browser tests.

Since we just need the DOM api [jsdom](https://github.com/tmpvar/jsdom) should be good enough to get
this working. It wasn't quite a straight forward as "just using jsdom", so here's what I had to do.

For the mocha part, I use [mocha-wepback](https://github.com/zinserjan/mocha-webpack) to handle
bundling the app and running the tests. Oh yeah, you need to be using webpack for this too.

We don't need all of the bells and whistles of what a full frontend webpack config might have in it
so I use a stripped down version of one. It looks like:

``` javascript
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  externals: [nodeExternals()],

  resolve: {
    extensions: ['.js', '.ts']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loaders: [
          {
            loader: 'awesome-typescript-loader',
            options: {configFileName: path.resolve(__dirname, '../tsconfig.json')}
          },
          'angular2-template-loader'
        ]
      }
    ]
  }
};
```

So after installing mocha-webpack go ahead and try it

    mocha-webpack \
      --webpack-config client/test/webpack.config.js \
      "client/test/unit/**/*.spec.ts"

Probably didn't work. Angular needs a whole bunch of things to get the testing environment setup
so we'll need a way to do that. For reasons that I'm unable to recall I
call this file `mocha-shim.js`. I *think* Angular ships with a jasmine shim so that's maybe where I
got it from. Anyway, it's the content that matters. Here's what it looks like:

``` javascript
const {JSDOM} = require('jsdom');
const document = new JSDOM('<!doctype html><html><body></body></html>');
const window = document.window;

global.HTMLElement = window.HTMLElement;
global.XMLHttpRequest = window.XMLHttpRequest;
global.document = window.document;
global.navigator = window.navigator;
global.Node = function() {};
global.Node.ELEMENT_NODE = 1;
global.Event = function() {};

require('core-js/es6');
require('core-js/es7/reflect');
require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/proxy');
require('zone.js/dist/sync-test');
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');

const testing = require('@angular/core/testing');
const browser = require('@angular/platform-browser-dynamic/testing');

testing.TestBed.initTestEnvironment(
  browser.BrowserDynamicTestingModule,
  browser.platformBrowserDynamicTesting()
);

global.window = window;
global.CSS = null;

require('hammerjs');
```

You'll see we're setting up jsdom to get a browser environment and then setting a bunch of global
things that you'd find in a real browser. Then we require some things to "make it work". To be
honest I copied most of this from that jasmine shim file so I couldn't tell you for sure what
everything is doing here. I will tell you that order is important in this file. There's also a few
lines at the bottom that you won't need if you're not using Material.

Now we need to require that file in our test runner. Don't forget to install jsdom.

    mocha-webpack \
      --webpack-config client/test/webpack.config.js \
      --require client/test/unit/helpers/mocha-shim.js \
      "client/test/unit/**/*.spec.ts"

That got us closer and we'd be done if there was only one test, but when it hits the second test we
get:

    Error: Cannot configure the test module when the test module has already been instantiated. Make sure you are not using `inject` before `TestBed.configureTestingModule`.

One other thing that the jasmine integrations do for us out of the box is reset the testing
environment after each test. We'll need to do that for mocha. I added a helper file that we can
include in the test runner.

``` javascript
import {getTestBed} from '@angular/core/testing';

afterEach(() => {
  getTestBed().resetTestingModule();
});
```

Our final command looks like...

    mocha-webpack \
      --webpack-config client/test/webpack.config.js \
      --require client/test/unit/helpers/mocha-shim.js \
      --include client/test/unit/helpers/spec-helper.js \
      "client/test/unit/**/*.spec.ts"


...and we finally get the green we've been looking for

```
  app-header
    ✓ should show a menu button if logged in
    ✓ should not show a menu button if not logged in

  2 passing (444ms)
```

