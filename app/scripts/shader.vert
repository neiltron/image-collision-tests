precision mediump float;

attribute vec2 position;
uniform vec2 u_resolution;
varying vec2 vTextureCoord;
varying float collisionPoint;

void main () {
  vTextureCoord = position;
  collisionPoint = position.y * u_resolution.x + position.x;

  gl_Position = vec4(1.0 - 2.0 * position, 0, 1.0) * vec4(-1.0, 1.0, 1.0, 1.0);
}