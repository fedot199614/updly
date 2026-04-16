import React from 'react';
const PhotoPreviewSmall = (props) => {
    const { resource, action, record } = props;
    let imgSrc = record.params.imgLink;
    let photoAlt = record.params.imgAlt;
    return (React.createElement("div", { className: "container" },
        React.createElement("div", null,
            React.createElement("img", { style: { maxWidth: "200px", height: "auto" }, src: imgSrc, alt: photoAlt }))));
};
export default PhotoPreviewSmall;
