import React from 'react';
const PhotoPreview = (props) => {
    const { resource, action, record } = props;
    let imgSrc = record.params.imgLink;
    let photoAlt = record.params.imgAlt;
    return (React.createElement("div", { className: "container" },
        React.createElement("div", null,
            React.createElement("img", { style: { maxWidth: "50%", height: "auto" }, src: imgSrc, alt: photoAlt }))));
};
export default PhotoPreview;
