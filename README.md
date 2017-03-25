# Wilderness Core

Currently exploring new ideas around
[Wilderness](https://github.com/colinmeinke/wilderness) here.

## Usage

### Plain Shape Object

These are the building blocks of Wilderness.
A *Plain Shape Object* allows you to define a static shape,
as specified in the
[SVG Points spec](https://github.com/colinmeinke/svg-points#svg-points).

```js
const circle = {
  type: 'circle',
  cx: 50,
  cy: 50,
  r: 20,
  fill: '#E54'
}
```

For a list of all prop allowed in a *Plain Shape Object*
[see the wiki](https://github.com/colinmeinke/wilderness-core/wiki/Plain-Shape-Object).

### Shape

A *Shape* is created with the shape function.
A *Shape* is a sequence of static shapes.
When the shape function is passed one or more *Plain Shape Object*
it will create a keyframe for each shape. Wilderness will equalise
these keyframes so we can later tween between them.

```js
import { shape } from 'wilderness-core'
const morph = shape(circle, square)
```
