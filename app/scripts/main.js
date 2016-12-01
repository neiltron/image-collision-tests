import glslify from 'glslify';
import Loader from './_loader';

let width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight,
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }),
    canvas2d = document.createElement('canvas'),
    ctx = canvas2d.getContext('2d'),
    mouseX = 0.0,
    mouseY = 0.0,
    isMouseDown = false,
    progressBar,
    fbo = null,
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

    buildPixelMap({
      texture: regl.texture(tree)
    });

    pixelMap = regl.read();

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

    // var imageData = ctx.getImageData(0, 0, canvas2d.width, canvas2d.height);
    // var data = imageData.data;

    // for (var i = 0, d = data.length; i < d; i++) {
    //   data[i] = pixelMap[i];
    // }

    ctx.drawImage(tree, 0, 0);

    // ctx.putImageData(imageData, 0, 0);
    document.querySelector('#renderer_container').appendChild(canvas2d);

    // for (var i = 0, p = pixels.length; i < p; i += 4) {
    //   if (pixels[i] == 255) {
    //      console.log(i / 4, i / 4 % tree.width, Math.floor(i / 4 / tree.width));
    //   }
    // }
  }
});