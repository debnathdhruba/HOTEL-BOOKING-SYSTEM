/* eslint-env jest */
const { normalizeUploadName } = require('./src/lib/gridfs.storage');

test('normalizes supported room and user upload paths', () => {
  expect(normalizeUploadName('/uploads/rooms/example.jpeg')).toBe('rooms/example.jpeg');
  expect(normalizeUploadName('C:\\app\\public\\uploads\\users\\avatar.png')).toBe('users/avatar.png');
});

test('rejects paths outside supported upload folders', () => {
  expect(normalizeUploadName('/avatar.png')).toBeNull();
  expect(normalizeUploadName('/uploads/other/file.png')).toBeNull();
});
