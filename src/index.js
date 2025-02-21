import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import GoogleDrive from '@uppy/google-drive';
import Dropbox from '@uppy/dropbox';
import Instagram from '@uppy/instagram';
import Facebook from '@uppy/facebook';
import OneDrive from '@uppy/onedrive';
import Webcam from '@uppy/webcam';
import ScreenCapture from '@uppy/screen-capture';
import Tus from '@uppy/tus';
import Unsplash from '@uppy/unsplash';

export default (editor, opts = {}) => {
    const options = {
        ...{
            // default options
            // Custom button element which triggers Uppy modal
            btnEl: '',

            // Text for the button in case the custom one is not provided
            btnText: 'Upload images',

            // File picker theme
            theme: 'dark',

            // Uppys's options
            uppyOpts: {
                autoProceed: false,
                restrictions: {
                    maxFileSize: 2000000,
                    maxNumberOfFiles: 10,
                    minNumberOfFiles: 1,
                    allowedFileTypes: ['image/*']
                }
            },

            // Uppy dashboard options
            dashboardOpts: {
                showProgressDetails: true,
                note: 'Images only, 1–10 files, up to 2 MB',
                height: 470,
                metaFields: [
                    { id: 'name', name: 'Name', placeholder: 'file name' },
                    { id: 'caption', name: 'Caption', placeholder: 'describe what the image is about' }
                ],
                browserBackButtonClose: false
            },

            // Companion URL
            companionUrl: 'https://companion.uppy.io',

            // Tus URL
            endpoint: 'https://tusd.tusdemo.net/files/',

            // On complete upload callback
            // assets - Array of assets, eg. [{url:'...', filename: 'name.jpeg', ...}]
            // for debug: console.log(assets);
            onComplete(assets) {
                console.log('successful files:', assets);
            },

            // On failed upload callback
            // assets - Array of assets, eg. [{url:'...', filename: 'name.jpeg', ...}]
            // for debug: console.log(assets);
            onFailed(assets) {
                console.log('failed files:', assets);
            },

            // Set plugins
            googledrive: false,
            dropbox: false,
            instagram: false,
            facebook: false,
            onedrive: false,
            unsplash: false,
            webcam: true,
            screencapture: true,
        },
        ...opts
    };

    let btnEl;
    let uppy;
    const pfx = editor.getConfig('stylePrefix');
    const { $ } = editor;
    const { uppyOpts, dashboardOpts, companionUrl, endpoint } = options;

    // When the Asset Manager modal is opened
    editor.on('run:open-assets', () => {
        const modal = editor.Modal;
        const modalBody = modal.getContentEl();
        const uploader = modalBody.querySelector(`.${pfx}am-file-uploader`);
        const assetsHeader = modalBody.querySelector(`.${pfx}am-assets-header`);
        const assetsBody = modalBody.querySelector(`.${pfx}am-assets-cont`);

        uploader && (uploader.style.display = 'none');
        assetsBody.style.width = '100%';

        // Instance button if not yet exists
        if (!btnEl) {
            btnEl = options.btnEl ? $(options.btnEl) : $(`<button class="${pfx}btn-prim ${pfx}btn-uppy">
                    ${options.btnText}
                </button>`);
        }

        if (!uppy) {
            uppy = new Uppy({
                ...uppyOpts
            })
                .use(Dashboard, {
                    theme: options.theme,
                    trigger: btnEl.get(0),
                    ...dashboardOpts
                })
                .use(Tus, { endpoint });

            if (options.googledrive) uppy.use(GoogleDrive, { target: Dashboard, companionUrl });
            if (options.dropbox) uppy.use(Dropbox, { target: Dashboard, companionUrl });
            if (options.instagram) uppy.use(Instagram, { target: Dashboard, companionUrl });
            if (options.facebook) uppy.use(Facebook, { target: Dashboard, companionUrl });
            if (options.onedrive) uppy.use(OneDrive, { target: Dashboard, companionUrl });
            if (options.unsplash) uppy.use(Unsplash, { target: Dashboard, companionUrl });
            if (options.webcam) uppy.use(Webcam, { target: Dashboard });
            if (options.screencapture) uppy.use(ScreenCapture, { target: Dashboard });

            uppy.on('complete', result => {
                addAssets(result.successful);
                options.onComplete(result.successful);
                options.onFailed(result.failed);
            })
        }

        assetsHeader.appendChild(btnEl.get(0));
    });

    /**
     * Add new assets to the editor
     * @param {Array} files
     */
    const addAssets = (files) => {
        const urls = files.map((file) => {
            return {
                id: file.id,
                name: file.meta.name,
                caption: file.meta.caption || '',
                src: file.uploadURL
            };
        });
        return editor.AssetManager.add(urls);
    };
};