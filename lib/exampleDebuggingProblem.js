// library that demonstrate something throwing when it's init is called

const example = {};

example.init = function() {
    //this is an error created intentionally (bar is not defined)
    const foo = bar;
}

module.exports = example;