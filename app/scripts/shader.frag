precision mediump float;

uniform float time;
uniform vec2 u_resolution;
uniform sampler2D texture;
varying vec2 vTextureCoord;

void main() {
  vec4 image = texture2D(texture, vTextureCoord.xy);

  if (image.a == 0.0) {
    gl_FragColor = vec4(0);
  } else {
    gl_FragColor = vec4(1.0);
  }
}