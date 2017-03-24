# Wilderness Core

Currently exploring new ideas around
[Wilderness](https://github.com/colinmeinke/wilderness) here.

## Usage

### Plain Shape Object

These are the building blocks of Wilderness.
They are defined in the [SVG Points spec](https://github.com/colinmeinke/svg-points#svg-points).

```js
const circle = {
  type: 'circle',
  cx: 50,
  cy: 50,
  r: 20,
  fill: '#E54'
}
```

For a list of all properties allowed in a Plain Shape Object
[see the wiki](https://github.com/colinmeinke/wilderness-core/wiki/Plain-Shape-Object).

### Shape

```js
import { shape } from 'wilderness-core'
const circleShape = shape(circle)
```
