module.exports = {
  siteMetadata: {
    title: "Moonfleet",
    siteUrl: "https://www.moonfleetguesthouse.co.uk",
    defaultDescription:
      "Stay at Moonfleet, a Grade II listed guest house in Skinningrove, 300 yards from the sea and close to the Cleveland Way, Cattersty Sands, Saltburn and Staithes.",
    defaultImage: "/assets/moonfleet-og.png",
    email: "moonfleetguesthouse@icloud.com",
    telephone: "07572 743 951",
    priceRange: "£125-£160",
    address: {
      streetAddress: "The Square",
      addressLocality: "Skinningrove",
      addressRegion: "Saltburn-by-the-Sea",
      postalCode: "TS13 4BD",
      addressCountry: "GB",
    },
    sameAs: [
      "https://www.tripadvisor.co.uk/Hotel_Review-g2312120-d7381138-Reviews-Moonfleet-Skinningrove_North_Yorkshire_England.html",
      "https://www.booking.com/hotel/gb/moonfleet-loftus.en-gb.html",
    ],
    amenities: [
      "Free parking",
      "Breakfast",
      "Dog-friendly by arrangement",
      "Private bar",
      "Games room",
    ],
    mainNav: [
      { href: "/room-rates/", title: "Room Rates" },
      { href: "/find-us/", title: "Find Us" },
      { href: "/gallery/", title: "Gallery" },
      { href: "/contact-us/", title: "Contact" },
      { href: "/local-attractions/", title: "Things To Do" },
      { href: "/visitors-comments/", title: "Reviews" },
      { href: "/dogs/", title: "Dogs" },
    ],
  },
  plugins: [
    `gatsby-transformer-remark`,
    {
      resolve: "gatsby-plugin-decap-cms",
      options: {
        modulePath: `${__dirname}/src/cms/cms.js`,
        customizeWebpackConfig: (config) => {
          if (config.mode === "production") {
            config.devtool = false;
          }
        },
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: `pages`,
      },
    },
    `gatsby-plugin-netlify`,
  ],
};
