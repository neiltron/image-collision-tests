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
  complete: ({cat}) => {
    document.getElementById('load_progress').classList.add('done');
    document.querySelector('section').style.opacity = 1;

    canvas.width = canvas2d.width = cat.width;
    canvas.height = canvas2d.height = cat.height;

    const regl = require('regl')({
      gl: gl,
      extensions: ['OES_texture_float']
    });

    // we could go with a texture size of 1x<total pixels> except it will
    // probably exceed the maximum allowed texture dimension. so instead we'll
    // get the square root of the total pixels and set the width/height to that

    var bufferSize = Math.sqrt(cat.height * cat.width + cat.width);

    fbo = regl.framebuffer({
      width: Math.round(bufferSize),
      height: Math.round(bufferSize),
      colorFormat: 'rgba',
      colorType: 'float'
    });

    const buildPixelMapGL = regl({
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
    });

    const buildPixelMapJS = (opts) => {
      var tempCanvas = document.createElement('canvas');

      var pixelMap = {};

      tempCanvas.width = opts.texture.width;
      tempCanvas.height = opts.texture.height;

      var tempCtx = tempCanvas.getContext('2d'),
          textureWidth = opts.texture.width,
          textureHeight = opts.texture.height;

      tempCtx.drawImage(opts.texture, 0, 0, textureWidth, textureHeight);

      var pixels = tempCtx.getImageData(0, 0, textureWidth, textureHeight);

      for (var i = 0, p = pixels.data.length; i < p; i += 4) {
        var x = i / 4,
            y = x / textureWidth,
            pixel = [pixels.data[i], pixels.data[i+1], pixels.data[i+2], pixels.data[i+3]];

        x = x - y * textureWidth;

        if (pixel[3] >= 1) {
          pixelMap[Math.floor(y * textureWidth + x)] = 1;
        }
      }

      return pixelMap;
    }



    /////////////
    //
    //  GL PIXEL MAP
    //
    /////////////

    // calculate start time so we can test pixelmap generation times
    var startTime = new Date().getTime();

    // generate pixel map
    buildPixelMapGL({
      texture: regl.texture(cat)
    });

    pixelMap = regl.read();

    // print generation time
    console.log('read in ' + (new Date().getTime() - startTime) / 1000 + ' seconds (gl)')



    /////////////
    //
    //  JAVASCRIPT PIXEL MAP
    //
    /////////////

    // calculate start time so we can test pixelmap generation times
    startTime = new Date().getTime();

    // generate pixel map
    var pixelMapJS = buildPixelMapJS({
      texture: cat
    });

    // print generation time
    console.log('read in ' + (new Date().getTime() - startTime) / 1000 + ' seconds (js)')



    //
    //  draw canvas to screen to visualize hit areas
    //
    canvas2d.addEventListener('mousemove', (e) => {
      // if hit, change cursor to pointer. if not, switch back to default
      if (pixelMap[pixelMap.length - (e.offsetY *  cat.width + e.offsetX) * 4] == 255) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    })

    ctx.drawImage(cat, 0, 0);

    document.querySelector('#renderer_container').appendChild(canvas2d);
  }
});