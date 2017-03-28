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

### Timeline

Before you can start playback of *Shapes*, they need to be set on
a timeline, using the timeline function. This will create a *Timeline*.
A *Timeline* can be composed of many *Shapes*, however, a *Shape* can
only be set on one *Timeline*.

```js
import { shape, timeline } from 'wilderness-core'

const shape1 = shape({})
const shape2 = shape({})

const animation = timeline(shape1, shape2)
```

The timeline function can also take an options object with
each *Shape*.

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

By default *Shapes* will playback in order. However, in the above
*Timeline*, both `shape2` and `shape3` will start
playback 200 milliseconds before `shape1` finishes playback.

```js
import { shape, timeline } from 'wilderness-core'

const shape1 = shape({})
const shape2 = shape({})

const animation = timeline(shape1, shape2, {
  duration: 5000,
  iterations: 5
})
```

Additionally, playback options can be passed as the last argument
of the timeline function.

### Frame

A *Frame* is an array of shapes. In the context of a *Timeline*, it
represents the shapes at the current point along that timeline. A
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

animation.subscibe('keyframe', ({ name, reverse }) => {
  console.log(`Playback hit keyframe named ${name}`)
})

play(animation)
```
