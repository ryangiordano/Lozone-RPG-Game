<p align="center">
  <img width=100% src="https://github.com/digitsensitive/phaser3-typescript/blob/master/assets/github/phaser3-typescript.png">
  Lo's Birthday Game.
</p>

# Phaser 3 and TypeScript

[Phaser](https://github.com/photonstorm/phaser) is a wonderful, fast and
free open source HTML5 game framework.
Here you will find everything you need to develop games with Phaser 3
in TypeScript. Have fun discovering, developing and playing!
Ideas and corrections are highly desirable to constantly
improve this repository!

## Getting started

### Prerequisites

```
Download and install npm with Node.js @ https://nodejs.org/en
```

### Installing

Select a folder, navigate to it, and clone this repository
with this command-line:

```
git clone https://github.com/digitsensitive/phaser3-typescript.git
```

Install the dependencies with this command-line:

```
npm install
```
> If you use yarn just replace `npm` with `yarn`

### Building and Running

Perform a quick build (bundle.js) and start server:

```
npm run dev
```
> If you use yarn just replace `npm` with `yarn`

## TypeScript Configuration

### tsconfig.json

The following `Compiler Options` have been set in the `tsconfig.json` file:

| Option | Value     |
| :------------- | :------------- |
| target       | ES2016 |
| module       | CommonJS |
| sourceMap    | true |
| noImplicitAny| true [WIP] |
| strict       | true [WIP] |

You can see the complete list of the available options at [here](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).
Interesting read about [setting up a nodejs-project](https://codeburst.io/tips-for-setting-up-a-typescript-nodejs-project-5d1c48dc1a2d).
