import React from "react";
import PropTypes from "prop-types";
import CMS from "decap-cms-app";
import IndexTemplate from "../components/page-templates/index-template";
import FindUsTemplate from "../components/page-templates/find-us-template";
import GalleryTemplate from "../components/page-templates/gallery-template";
import RoomRatesTemplate from "../components/page-templates/room-rates-template";
import VisitorsCommentsTemplate from "../components/page-templates/visitors-comments-template";
import GenericTemplate from "../components/page-templates/generic-template";
import { Ways } from "@18ways/react";
import { createPageTranslationContext, WAYS_ROOT_PROPS } from "../i18n";
import config from "../../gatsby-config";

const createPagePreview = (Template, page) => {
  const PreviewTemplate = ({ entry }) => {
    const data = entry.getIn(["data"]).toJS();

    if (data) {
      return (
        <Ways {...WAYS_ROOT_PROPS}>
          <Ways
            context={createPageTranslationContext(
              page.name,
              page.label,
              page.filePath
            )}
          >
            <Template {...data} siteMetadata={config.siteMetadata} />
          </Ways>
        </Ways>
      );
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

CMS.registerPreviewTemplate(
  "index",
  createPagePreview(IndexTemplate, {
    name: "homepage",
    label: "Homepage",
    filePath: "src/pages/index.md",
  })
);
CMS.registerPreviewTemplate(
  "contact-us",
  createPagePreview(GenericTemplate, {
    name: "contact-us",
    label: "Contact Us",
    filePath: "src/pages/contact-us.md",
  })
);
CMS.registerPreviewTemplate(
  "dogs",
  createPagePreview(GenericTemplate, {
    name: "dogs",
    label: "Dogs",
    filePath: "src/pages/dogs.md",
  })
);
CMS.registerPreviewTemplate(
  "find-us",
  createPagePreview(FindUsTemplate, {
    name: "find-us",
    label: "Find Us",
    filePath: "src/pages/find-us.md",
  })
);
CMS.registerPreviewTemplate(
  "gallery",
  createPagePreview(GalleryTemplate, {
    name: "gallery",
    label: "Gallery",
    filePath: "src/pages/gallery.md",
  })
);
CMS.registerPreviewTemplate(
  "local-attractions",
  createPagePreview(GenericTemplate, {
    name: "local-attractions",
    label: "Things To Do",
    filePath: "src/pages/local-attractions.md",
  })
);
CMS.registerPreviewTemplate(
  "room-rates",
  createPagePreview(RoomRatesTemplate, {
    name: "room-rates",
    label: "Room Rates",
    filePath: "src/pages/room-rates.md",
  })
);
CMS.registerPreviewTemplate(
  "visitors-comments",
  createPagePreview(VisitorsCommentsTemplate, {
    name: "visitors-comments",
    label: "Reviews",
    filePath: "src/pages/visitors-comments.md",
  })
);
