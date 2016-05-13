(function($) {
    var currentVideoId,
        frameGrab,
        videoName,
        descriptions = [],
        timeInSecs = [],
        durations = [];

    function showPleaseWait(type) {
        $("#pleaseWaitDialog .modal-title").text("Generating " + type + "...");
        $("#pleaseWaitDialog").modal("show");
    }

    function hidePleaseWait() {
        $("#pleaseWaitDialog").modal("hide");
    }
                                                                                  
    function showError(message) {
        $("#errorDialog").find(".error-message").text(message);
        $("#errorDialog").modal("show");
    }

    function maybeConstructFramegrab() {
        if (!frameGrab) {
            frameGrab = new FrameGrab({
                video: $("#video")[0],
                skip_solids: {
                    enabled: false
                }
            });
        }
    }
    function reformatVideoFilename(originalName) {
        var filenameSansExt = originalName,
            extIdx = filenameSansExt.lastIndexOf(".");

        if (extIdx > 0) {
            filenameSansExt = filenameSansExt.substr(0, extIdx);
        }

        return filenameSansExt.replace(/[_-]/g, " ");
    }

    function sortFramesInUi() {
        var ordered = $("[data-video-id='" + currentVideoId + "']").sort(function(a, b) {
            var timeA = parseFloat($(a).data("time")),
                timeB = parseFloat($(b).data("time"));

            if (timeA < timeB) {
                return 1;
            }
            if (timeA > timeB) {
                return -1;
            }
            return 0;
        });

        $(".qq-upload-list-selector").prepend(ordered);
    }

    function updateGallery() {
        setTimeout(function() {
            $('.qq-thumbnail-selector').magnificPopup({
                type:'image',
                gallery: {
                    enabled: true
                }
            }, 0);
        })
    }

    $(function() {
        $("#uploader").fineUploader({
            autoUpload: false,
            request: {
                endpoint: "/uploads",
                params: {
                    sendThumbnailUrl: !qq.supportedFeatures.imagePreviews
                }
            },

            thumbnails: {
                placeholders: {
                    notAvailablePath: "/fineuploader/placeholders/not_available-generic.png",
                    waitingPath: "/fineuploader/placeholders/waiting-generic.png"
                }
            },

            deleteFile: {
                endpoint: "/uploads",
                enabled: true
            },

            display: {
                fileSizeOnSubmit: true,
                prependFiles: true
            },

            failedUploadTextDisplay: {
                mode: "custom"
            },

            retry: {
                enableAuto: true
            },

            chunking: {
                enabled: true
            },

            resume: {
                enabled: true
            },

            showMessage: function(message) {
                showError(message);
            },

            formatFileName: function(fileOrBlobName) {
                if (fileOrBlobName !== undefined && fileOrBlobName.length > 43) {
                    fileOrBlobName = fileOrBlobName.slice(0, 24) + "..." + fileOrBlobName.slice(-19);
                }
                return fileOrBlobName;
            },

            callbacks: {
                onCancel: updateGallery,

                onDeleteComplete: updateGallery,

                onStatusChange: function() {
                    var submittedCount = this.getUploads({status: qq.status.SUBMITTED}).length;

                    if (submittedCount) {
                        $("#start-upload-button").show();
                    }
                    else {
                        $("#start-upload-button").hide();
                    }
                },

                onSubmitted: function(id, name) {
                    var $file = $(this.getItemByFileId(id)),
                        $thumbnail = $file.find(".qq-thumbnail-selector"),
                        file = this.getFile(id),
                        URL = window.URL || window.webkitURL;

                    timeInSecs[id] = file.timeInSecs;

                    $file.data("time", timeInSecs[id]);
                    $file.attr("data-video-id", currentVideoId);
                    sortFramesInUi();

                    durations[id] = $("#video")[0].duration;
                    $thumbnail.attr("href", URL.createObjectURL(file));
                    updateGallery();
                },

                onUpload: function(id) {
                    var params = {
                            time: timeInSecs[id],
                            duration: durations[id]
                        },
                        $file = $(this.getItemByFileId(id));

                    if (descriptions[id]) {
                        params.description = descriptions[id];
                    }

                    this.setParams(params, id);
                    $file.find(".qq-upload-cancel-selector").text("Cancel");
                }
            }
        })

            .on("click", ".edit-description", function() {
                var fileId = $("#uploader").fineUploader("getId", this),
                    filename = $("#uploader").fineUploader("getName", fileId);

                bootbox.prompt({
                    title: "Please enter or edit the description for '" + filename + "'",
                    value: descriptions[fileId],
                    callback: function(description) {
                        if (description && description.trim().length > 0) {
                            descriptions[fileId] = description;
                        }
                    }
                });
            });

        // TODO eliminate redundancies w/ .tell-story
        $(".grab-frame").click(function() {
            var pleaseWaitTimer = setTimeout(function() {
                showPleaseWait("image");
            }, 500);

            maybeConstructFramegrab();

            frameGrab && frameGrab.grab_now("blob").then(
                function success(result) {
                    // TODO This is kludgey.  Modify frame-grab to limit units in returned time string
                    var formattedTime = frameGrab.secs_to_time_string(result.time, 2).replace("00:", "");

                    // setParams is a bit inflexible in FU.
                    // TODO Add an `updateParams` and/or `getParams` API method to FU.
                    result.container.timeInSecs = result.time;

                    $("#uploader").fineUploader("addBlobs", {
                        blob: result.container,
                        // TODO determine the correct extension based on `Blob.type`.
                        name: videoName + " - " + formattedTime + ".png"
                    });

                    clearTimeout(pleaseWaitTimer);
                    hidePleaseWait();
                },

                function failure(reason) {
                    clearTimeout(pleaseWaitTimer);
                    hidePleaseWait();
                    showError(reason);
                }
            )
        });

        // TODO eliminate redundancies w/ .grab-frame
        $(".tell-story").click(function() {
            maybeConstructFramegrab();

            if (frameGrab) {
                bootbox.prompt({
                    title: "How many images shall I generate?",
                    inputType: "number",
                    callback: function(result) {
                        var imageCount = parseInt(result);

                        if (imageCount > 0) {
                            showPleaseWait("story");

                            frameGrab.make_story("blob", imageCount).then(
                                function success(results) {
                                    $.each(results, function() {
                                        // TODO This is kludgey.  Modify frame-grab to limit units in returned time string
                                        var formattedTime = frameGrab.secs_to_time_string(this.time, 2).replace("00:", "");

                                        hidePleaseWait();

                                        // setParams is a bit inflexible in FU.
                                        // TODO Add an `updateParams` and/or `getParams` API method to FU.
                                        this.container.timeInSecs = this.time;

                                        // No guarantee on the order an array of files/blobs is submitted,
                                        // so we need to force the order for now.
                                        // TODO Adjust Fine Uploader code to ensure submitted order is respected, so we can pass in all blobs at once via an array
                                        $("#uploader").fineUploader("addBlobs", {
                                            blob: this.container,
                                            // TODO determine the correct extension based on `Blob.type`.
                                            name: videoName + " - " + formattedTime + ".png"
                                        });
                                    });
                                },

                                function failure(reason) {
                                    hidePleaseWait();
                                    showError(reason);
                                }
                            )
                        }
                    }
                });
            }
        });

        $("#start-upload-button").hide()
            .click(function() {
                $("#uploader").fineUploader("uploadStoredFiles");
            });

        $("#video-drop-zone").fineUploaderDnd({
            classes: {
                dropActive: "qq-upload-drop-area-active"
            }
        })
            .on("processingDroppedFilesComplete", function(event, files, dropTarget) {
                var file = files[0],
                    name = file.name;

                FrameGrab.blob_to_video(file).then(
                    function success(video) {
                        document.getElementById('video').src = video.src;
                        currentVideoId = name;
                        frameGrab = null;
                        videoName = reformatVideoFilename(name);
                        $("#video-drop-zone").removeClass("empty");
                    },

                    function failure() {
                        showError("'" + name + "' uses an unsupported video codec or is not a video file");
                    }
                )
            });
    });
})(jQuery);
