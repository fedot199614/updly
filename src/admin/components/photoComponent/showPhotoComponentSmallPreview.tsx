import React from 'react'
//import { Box } from 'adminjs'

const PhotoPreviewSmall = (props) => {
    const { resource, action, record } = props

    let imgSrc = record.params.imgLink
    let photoAlt = record.params.imgAlt
    return (
        <div className="container">
            <div>
                <img style={{maxWidth: "200px", height: "auto"}} src={imgSrc} alt={photoAlt}/>
            </div>
        </div>
    )
}

export default PhotoPreviewSmall