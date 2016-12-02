import glslify from 'glslify';
import Loader from './_loader';

    // 3d canvas/context. used for generating pixel map
let canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }),

    // 2d canvas/context. only used to display the texture. also has mouse
    // events attached to show the collision map in use
    canvas2d = document.createElement('canvas'),
    ctx = canvas2d.getContext('2d'),
    progressBar,
    fbo = null, // framebuffer for the shader to output to
    pixelMap = null;


// loader's self-calling. it calls itself.
var loader = new Loader({
  complete: ({tree}) => {
    document.getElementById('load_progress').classList.add('done');
    document.querySelector('section').style.opacity = 1;

    canvas.width = canvas2d.width = tree.width;
    canvas.height = canvas2d.height = tree.height;

    const regl = require('regl')({
      gl: gl,
      extensions: ['OES_texture_float']
    });

    // we could go with a texture size of 1x<total pixels> except it will
    // probably exceed the maximum allowed texture dimension. so instead we'll
    // get the square root of the total pixels and set the width/height to that

    var textureSize = Math.sqrt(tree.height * tree.width + tree.width);

    fbo = regl.framebuffer({
      width: Math.round(textureSize),
      height: Math.round(textureSize),
      colorFormat: 'rgba',
      colorType: 'float'
    });

    const buildPixelMap = regl({
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

    // calculate start time so we can test pixelmap generation times
    var startTime = new Date().getTime();

    // GOGOGOGO
    buildPixelMap({
      texture: regl.texture(tree)
    });

    pixelMap = regl.read();

    // print generation time
    console.log('read in ' + (new Date().getTime() - startTime) / 1000 + ' seconds')


    //
    //  draw canvas to screen to visualize hit areas
    //
    canvas2d.addEventListener('mousemove', (e) => {
      // if hit, change cursor to pointer. if not, switch back to default
      if (pixelMap[pixelMap.length - (e.offsetY *  tree.width + e.offsetX) * 4] == 255) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    })

    ctx.drawImage(tree, 0, 0);

    document.querySelector('#renderer_container').appendChild(canvas2d);
  }
});