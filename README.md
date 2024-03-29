angular-kpax // old but gold
============

Angular-Kpax - AngularJS factory for Kpax

This repo is for distribution on `bower`.

## Install

Install with `bower`:

```shell
bower install angular-kpax
```

Add a `<script>` to your `index.html`:

```html
<script src="/bower_components/angular/angular.min.js"></script>
<script src="/bower_components/socket.io-client/dist/socket.io.min.js"></script>
<script src="/bower_components/angular-kpax/angular-kpax.min.js"></script>
<!-- or combined file -->
<script src="/bower_components/angular/angular.min.js"></script>
<script src="/bower_components/angular-kpax/socket.io-client-angular-kpax.js"></script>
```

And add `ngKpax` as a dependency for your app:

```javascript
var myApp = angular.module('myApp', ['ngKpax']);
myApp.controller('myController', [
  '$scope', 'kpax',
  function ($scope, kpax) {
    kpax.get({
      url: '/hi',
      success: function(data) {
        console.log(data);
      }
    });
  }
]);
```

## Documentation

TODO

## Developing

```bash
  $ sudo npm -g gulp bower
  $ bower install
  $ npm install
  $ gulp
```


### Dependencies:
* angularjs >= 1.2.x
* socket.io-client >= 0.9.x


## License
The MIT License

 ▲ 2014 Diogo Karma <dnechtan@gmail.com> ▲ https://karmas.digital

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
