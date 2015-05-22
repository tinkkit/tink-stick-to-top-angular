# Tink stick to top Angular directive

v1.0.0

## What is this repository for?

The Tink Angular stick to top directive provides a way to keep your div sticking to the top of your page.

Tink is an in-house developed easy-to-use front-end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

## Setup

### Prerequisites

* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* bower: `npm install -g bower`

### Install

1. Go to the root of your project and type the following command in your terminal:

  `bower install tink-stick-to-top-angular --save`

2. Add the following files to your project:

  `<link rel="stylesheet" href="bower_components/tink-core/dist/tink.css" />` (or one of the Tink themes)

  `<script src="bower_components/tink-stick-to-top-angular/dist/tink-stick-to-top-angular.js"></script>`


----------


## How to use

### tink-sticky

### Component

```html
<div data-tink-sticky>
  <p>This content will stick to the top of the page until the next sticky element pushes it away. Note that it will remain sticky if it is the last sticky element.</p>
</div>
```

If you want more levels to be sticky:

```html
<div data-tink-sticky data-tink-level="1">
  <p>Main sticky element</p>
</div>
<div data-tink-sticky data-tink-level="2">
  <p>This element will stick to the bottom of the previous level until the next sticky element (same level or lower) pushes it away. Note that it will remain sticky if it is the last sticky element.</p>
</div>
```

### Options

#### Accordion

Attr | Type | Default | Details
--- | --- | --- | ---
data-tink-level | `number` | `1` | Levels allow sticky elements to be stacked.

## Contribution guidelines

* If you're not sure, drop us a note
* Fork this repo
* Do your thing
* Create a pull request

## Who do I talk to?

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)

## License

The MIT License (MIT)

Copyright (c) 2014 Stad Antwerpen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
