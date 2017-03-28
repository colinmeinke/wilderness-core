# Wilderness Core

Currently exploring new ideas around
[Wilderness](https://github.com/colinmeinke/wilderness) here.

## Usage

### Plain Shape Object

These are the building blocks of Wilderness.
A *Plain Shape Object* allows you to define a static shape,
as specified by the
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

For a list of all props allowed in a *Plain Shape Object*
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

The plainShapeObject function does the reverse, creating a *Plain
Shape Object* from a *Shape*.

```js
const { shape, plainShapeObject } from 'wilderness-core'
const morph = shape(circle, square)

// At some point in time later
console.log(plainShapeObject(morph))

// {
//   type: 'path',
//   d: '...' // A shape somewhere between a circle and a square
//   fill: '#E54'
// }
```

### Timeline

Before a *Shape* can start playback, it needs to be queued on
a *Timeline*. A *Timeline* is created with the timeline function.
A *Timeline* can be composed of many *Shapes*. By default *Shapes*
will be queued consecutively.

```js
import { shape, timeline } from 'wilderness-core'

const shape1 = shape({})
const shape2 = shape({})

const animation = timeline(shape1, shape2)
```

Each *Shape* passed into the timeline function can also take
options.

```js
import { shape, timeline } from 'wilderness-core'

const shape1 = shape({})
const shape2 = shape({})
const shape3 = shape({})

timeline(
  [ shape1, { name: 'SHAPE1' } ],
  [ shape2, { queue: -200 } ],
  [ shape3, { queue: [ 'SHAPE1', -200 ] } ]
)
```

In the example above, the options passed together with each
*Shape* will adjust the queue timing. Both `shape2` and `shape3`
will start playback 200 milliseconds before `shape1` finishes
playback.

Additionally, playback options can be passed as the last argument
of the timeline function.

```js
import { shape, timeline } from 'wilderness-core'

const shape1 = shape({})
const shape2 = shape({})

const animation = timeline(shape1, shape2, {
  duration: 5000,
  iterations: 5
})
```

This is also where middleware can be defined.

```js
import { shape, timeline } from 'wilderness-core'

const shape1 = shape({})
const shape2 = shape({})

const animation = timeline(shape1, shape2, {
  middleware: [
    colorMiddleware,
    unitMiddleware
  ]
})
```

### Frame

A *Frame* is an array of shapes at a specific point in time. A
*Frame* is created by passing a *Timeline* to the frame function.

```js
import { shape, timeline, frame } from 'wilderness-core'

const shape1 = shape({})
const shape2 = shape({})

const animation = timeline(shape1, shape2)

frame(timeline).map(frameShape => {
  console.log(`Handle view`)
})
```

### Play

```js
import { shape, timeline, play } from 'wilderness-core'

const shape1 = shape({})
const shape2 = shape({})

const animation = timeline(shape1, shape2)

play(animation)
```

### Events

A *Timeline* exposes a subscribe method for subscribing to
playback events.

```js
import { shape, timeline, play } from 'wilderness-core'

const shape1 = shape({})
const shape2 = shape({})

const animation = timeline(shape1, shape2)

animation.subscribe('keyframe', ({ name, reverse }) => {
  console.log(`Playback hit keyframe named ${name}`)
})

play(animation)
```

For a list of all events
[see the wiki](https://github.com/colinmeinke/wilderness-core/wiki/Events).
