import glslify from 'glslify';
import Loader from './_loader';

let width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight,
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }),
    mouseX = 0.0,
    mouseY = 0.0,
    isMouseDown = false,
    progressBar,
    fbo = null


// loader's self-calling. it calls itself.
var loader = new Loader({
  complete: ({tree}) => {
    document.getElementById('load_progress').classList.add('done');
    document.querySelector('section').style.opacity = 1;

    canvas.width = tree.width;
    canvas.height = tree.height;

    const regl = require('regl')({
      gl: gl,
      extensions: ['OES_texture_float']
    });

    var textureSize = Math.sqrt(tree.height * tree.width + tree.width);

    fbo = regl.framebuffer({
      width: Math.round(textureSize),
      height: Math.round(textureSize),
      colorFormat: 'rgba',
      colorType: 'float'
    });

    document.querySelector('#renderer_container').appendChild(canvas)

    const drawCanvas = regl({
      frag: glslify('./app/scripts/shader.frag'),
      vert: glslify('./app/scripts/shader.vert'),
      count: 3,

      attributes: {
        position: [
          -2, 0,
          0, -2,
          2, 2
        ]
      },

      uniforms: { texture: regl.prop('texture') }
    })

    var time = new Date().getTime();

    drawCanvas({
      texture: regl.texture(tree)
    });

    var pixels = regl.read();

    // for (var i = 0, p = pixels.length; i < p; i += 4) {
    //   if (pixels[i] == 255) {
    //      console.log(i / 4, i / 4 % tree.width, Math.floor(i / 4 / tree.width));
    //   }
    // }

    console.log('read in ' + (new Date().getTime() - time) / 1000 + 'seconds')
  }
});