// test/sanitize.test.js

import { sanitize } from '../src/utils/sanitize.js';
import { expect } from 'chai';

describe('sanitize', function () {
    it('should remove special characters', function () {
        const input = 'Hello!@#$%^&*()_+World';
        const result = sanitize(input);
        expect(result).to.equal('HelloWorld');
    });

    it('should allow alphanumeric and space', function () {
        const input = 'Hello World 123';
        const result = sanitize(input);
        expect(result).to.equal('Hello World 123');
    });
});

