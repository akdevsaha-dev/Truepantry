import test from "node:test";
import assert from "node:assert/strict";
import { motion, sharpness, toGray } from "../lib/scanner/frame-quality";

const W = 16;
const H = 16;

function checkerboard(): Uint8Array {
  const g = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y * W + x] = (x + y) % 2 ? 255 : 0;
  return g;
}

test("toGray maps white to 255 and black to 0", () => {
  const rgba = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]);
  const gray = toGray(rgba, 2, 1);
  assert.equal(gray[0], 255);
  assert.equal(gray[1], 0);
});

test("sharpness is zero for a flat frame and high for a detailed one", () => {
  const flat = new Uint8Array(W * H).fill(128);
  assert.equal(sharpness(flat, W, H), 0);
  assert.ok(sharpness(checkerboard(), W, H) > 1000);
});

test("motion is zero for identical frames and large for different ones", () => {
  const a = checkerboard();
  assert.equal(motion(a, a), 0);
  const b = new Uint8Array(W * H).fill(0);
  assert.ok(motion(a, b) > 100);
  assert.equal(motion(a, new Uint8Array(4)), Infinity);
});
