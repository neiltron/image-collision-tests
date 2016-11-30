import resl from 'resl';

class Loader {
  constructor(opts) {
    this._progress = this._progress.bind(this);

    this.progressBar = document.getElementById('load_progress');

    this.completeCb = opts.complete;
    this.manifest = {
      tree: {
        type: 'image',
        src: './images/tree-03.png'
      }
    };

    this._load();
  }

  _progress(progress, msg) {
    this.progressBar.style.transform = 'scaleX(' + progress + ')';
  }

  _load() {
    resl({
      manifest: this.manifest,
      onProgress: this._progress,
      onDone: (assets) => {
        this.progressBar.style.transform = 'scaleX(1)';

        this.completeCb.call(null, assets);
      }
    });
  }
}

export default Loader;