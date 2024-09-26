import React, { useState, useEffect } from "react";

const Video = ({ videos, node }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    console.log("Video component received node:", node);
    console.log("Video component received videos:", videos);
  }, [node, videos]);

  if (!node) {
    console.log("No node selected");
    return (
      <div className="text-gray-600">Select a node to see related videos.</div>
    );
  }

  if (!videos || videos.length === 0) {
    console.log("No videos available for node:", node.id);
    return (
      <div className="text-gray-600">No videos available for this node.</div>
    );
  }

  const openModal = (video) => {
    console.log("Opening modal for video:", video);
    setSelectedVideo(video);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  const getYoutubeVideoId = (url) => {
    if (!url) {
      console.error("Invalid URL provided:", url);
      return null;
    }
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  if (!node || !node.data) {
    return (
      <div className="video-container text-center">
        <p className="text-gray-500">Select a node to see related videos</p>
      </div>
    );
  }

  const { label } = node.data;

  return (
    <>
      <div>
        <div className="inline-flex bg-gradient-to-b from-white to-transparent p-2 mb-1">
          {/*// {label !== undefined && label !== null && (*/}
          <h2 className="pl-1">{label} </h2>
        </div>
        {/*// )}*/}
        <div className="flex space-x-2 min-w-max">
          {videos.map((video) => {
            const videoId = getYoutubeVideoId(video.url);
            console.log(`Video ${video.id} has YouTube ID:`, videoId);
            return (
              <div
                key={video.id}
                className="min-w-[20vw] bg-white p-2 rounded-lg shadow-md cursor-pointer"
                onClick={() => openModal(video)}
              >
                {videoId ? (
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                    alt={video.title}
                    className="w-[20vw] h-auto rounded"
                  />
                ) : (
                  <div className="w-full h-[67px] bg-gray-200 rounded flex items-center justify-center">
                    No Thumbnail
                  </div>
                )}
                <p className="text-center text-sm mt-2 truncate">
                  {video.title}
                </p>
              </div>
            );
          })}
        </div>

        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-3xl w-full overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="relative w-full h-full pb-[56.25%]">
                {" "}
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                    selectedVideo.url
                  )}`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full rounded"
                ></iframe>
              </div>
              {/* <div className="mt-4 flex justify-end"> */}
              {/* </div> */}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Video;
