Video Frame Uploader
====================

Drop a video and upload frames of your choosing and/or automatically parse
and upload frames from the video to easily tell a story.


## Features
- Drag and drop a video to render it as playable in the browser.
- Preview & upload any number of frames by manually navigating to them in the video.
- Have Video Frame Uploader turn your video into an story (collection of equally spaced frames).
- Upload all selected frames.
- Include a description for each frame (to be sent to the server).
- Each frame includes a name that represents the video name and the location in the video.
- Each frame show may be renamed.
- Uploaded frames may be deleted.
- Each frame includes a small preview image.
- Each frame includes a large preview image that can be displayed by clicking the small preview.
- All selected previews may be viewed in a gallery/slide-show format.
- The current time of each frame and the duration of the video will be sent to the server with each frame.
- Compile frame shots from multiple videos.

## Browser Support
- Chrome
- Internet Explorer 10+
- Firefox
- Safari
- Opera 15+


## License
This example and all example code is licensed under MIT.  Fine Uploader is
licensed under a Widen Commercial License or GPL v3.  To purchase a commercial license,
please see [our purchase page](http://fineuploader.com/purchase).


## Questions or Feature Suggestions?
See the [issue tracker](https://github.com/FineUploader/video-frame-uploader/issues).


## Installation
1. Clone this repo: `git clone https://github.com/FineUploader/video-frame-uploader.git`.  Switch to the newly created directory.
2. [Grab a copy of Fine Uploader](http://fineuploader.com/downloads).
3. Drop The Fine Uploader JavaScript and CSS files in a subdirectory called "assets".
4. Also place the placeholder and other image files bundled with Fine Uploader in this new "assets" directory.
5. Ensure the index.html file references the actual names of the Fine Uploader JS and CSS files.
6. Ensure you have a current version of node.js installed.
7. Install bower: `npm install -g bower`.
8. Install all bower dependencies required by this app: `bower update`.
9. Install all server-side node dependencies required by this app: `npm install`.
10. Start the server: `node server`.
11. Navigate to `http://localhost:8000` in your browser to use Video Frame Uploader.

## Notes
- You may customize server.js, index.html, custom.css, or client.js to suit your specific needs.
- Files are uploaded into an "uploaderFiles" directory under the "assets" subdirectory.
