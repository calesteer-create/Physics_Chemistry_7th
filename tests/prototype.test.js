import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { WHATSAPP_URL, student, lessonSteps } from '../src/demo-data.js';
test('verified WhatsApp destination', () => assert.equal(WHATSAPP_URL, 'https://wa.me/963930210222'));
test('demo lesson has seven ordered phases ending in notebook', () => { assert.equal(lessonSteps.length, 7); assert.deepEqual(lessonSteps.map(s => s.id), ['discover','explain','example','activity','check','summary','notebook']); });
test('demo progress values are valid', () => { for (const value of [student.physics, student.chemistry]) assert.ok(value >= 0 && value <= 100); });
