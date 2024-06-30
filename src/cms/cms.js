import React from "react";
import PropTypes from "prop-types";
import CMS from "decap-cms-app";
import { IndexTemplate } from "../templates/index";
import { FindUsTemplate } from "../templates/find-us";
import { GalleryTemplate } from "../templates/gallery";
import { RoomRatesTemplate } from "../templates/room-rates";
import { VisitorsCommentsTemplate } from "../templates/visitors-comments";
import { GenericTemplate } from "../templates/generic";
import config from "../../gatsby-config";

const createPagePreview = (Template) => {
  const PreviewTemplate = ({ entry }) => {
    const data = entry.getIn(["data"]).toJS();

    if (data) {
      return <Template {...data} siteMetadata={config.siteMetadata} />;
    } else {
      return <div>Loading...</div>;
    }
  };

  PreviewTemplate.propTypes = {
    entry: PropTypes.shape({
      getIn: PropTypes.func,
    }),
    getAsset: PropTypes.func,
  };

  return PreviewTemplate;
};

CMS.registerPreviewTemplate("index", createPagePreview(IndexTemplate));
CMS.registerPreviewTemplate("contact-us", createPagePreview(GenericTemplate));
CMS.registerPreviewTemplate("dogs", createPagePreview(GenericTemplate));
CMS.registerPreviewTemplate("find-us", createPagePreview(FindUsTemplate));
CMS.registerPreviewTemplate("gallery", createPagePreview(GalleryTemplate));
CMS.registerPreviewTemplate(
  "local-attractions",
  createPagePreview(GenericTemplate)
);
CMS.registerPreviewTemplate("room-rates", createPagePreview(RoomRatesTemplate));
CMS.registerPreviewTemplate(
  "visitors-comments",
  createPagePreview(VisitorsCommentsTemplate)
);
