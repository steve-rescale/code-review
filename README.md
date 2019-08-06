Front end code review exercise
==============================


What is this?
=============

"FizzBuzz" is a classic interview question demonstrating competency with loops and I/O.

The specification is:
> "For each number 1-100, if the number is divisible by 3 print 'Fizz', if it's divisible by 5 print 'Buzz', and if it's divisible by both print 'FizzBuzz'. If the number isn't divisible by either term just print the number."

So, the output looks like:
```
1
2
Fizz
4
Buzz
Fizz
7
[...snip...]
14
FizzBuzz
16
[...snip...]
99
Buzz
```

This repo has this implemented in the form of an API endpoint. It takes `begin` and `end` parameters and returns JSON describing the labels for each number from `begin`-`end` inclusive.

Due to feature creep, the API can now also accept different rules for how to label divisible numbers. The prototypical scheme described above is coded as `[[3, 'Fizz'], [5, 'Buzz']]`, but you could supply any number of `[integer, string]` tuples to label the list accordingly.

You can assume that this API works well enough, though you are welcome to take a look at it.


The focus is on the web components comprising the interface to this API, collecting the pertinent parameters and displaying the output. It sorta works, but has some rough edges to consider code-wise, and ...debatable stylistic presentation.

![in action](fizzbuzz.gif)


Setup:
======

 1. `git clone https://github.com/steve-rescale/code-review.git`
 2. `cd code-review`
 3. `git checkout -b code-review --track origin/code-review`
 4. `npm install`
 5. `npm run watch`
 6. (in another terminal) `npm start`

 Visit `http://localhost:3000` in your browser.

 If you have a conflict on port 3000, re-run with `NODE_PORT=3030 npm start` (or whatever other port number).


Layout
======

We're primarily concerned with the files in `packages/front-end/src`.

These are TypeScript files, but the types are just informational. You don't have to look for problems with them.


Native Webcomponents
====================

These components are built with the web components spec implemented in Chrome. It's similar to other reactive binding frameworks like React, Vue, Polymer, etc, but with a more minimal API.

Native components extend `HTMLElement` to add new tags the HTML vernacular:

```javascript
class MyCustomButton extends HTMLElement {...}
window.customElements.define('my-custom-button', MyCustomButton);
```

Then, elsewhere:
```html
<form>
  <my-custom-button foo="bar">Click me!</my-custom-button>
</form>
```

The component behavior is implemented by defining some lifecycle events in the class:

## Lifecycle

### `connectedCallback()`

Means the component has been stamped into the DOM, similar to React's `componentDidMount`

### `static get observedAttributes()`

This returns a `[ 'list', 'of', 'attribute', 'names' ]` that the component is interested in observing. This is similar to your list of `props` in React. Unlike React props, they can be modified by the component itself (`setAttribute`).

The observed list ties directly to:

### `attributeChangedCallback(attributeName, oldValue, newValue)`

`componentWillReceiveProps`, except that it's called once with each changed.

Here you respond to the data by whatever means necessary, usually by re-rendering some or all of the component HTML.


## Events

Data flow is "attributes down, events up".

Just like a plain `<input>` emits `change`, `keypress`, `click`, etc, components can emit `CustomEvent`s describing their state changes.

This happens once here, when the rule set component `change`s, with the outer component listening updates its list accordingly.


Questions
=========

 * Does the code do what it's meant to? What are the edge cases, and are they accounted for? Is there anything a user could do to end up with an error or an inconsistent or misleading state?

 * Does the broad approach make sense, or are there things that should be refactored to operate differently?

 * Is the code of good quality? Are there any bugs, dead code, unclear code, needless indirections, typos, unsafe assumptions, deliberate obfuscations?

 * Is the presentation good? Is it obvious how to use the application and easy to interpret the results?

